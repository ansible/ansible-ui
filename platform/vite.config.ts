/// <reference types="vite-plugin-svgr/client" />
/* eslint-disable no-restricted-exports */
/* eslint-disable no-console */
import fs from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import selfsigned from 'selfsigned';
import { type PluginOption, type UserConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import compression from 'vite-plugin-compression';
import monacoEditorPlugin, { IMonacoEditorOpts } from 'vite-plugin-monaco-editor';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';
import type { InlineConfig } from 'vitest/node';
import { vendorChunkGroups } from '../framework/vite.chunkGroups';
import { getVitestAliases } from '../framework/vitest.shared';

const monacoEditorPluginDefault = (monacoEditorPlugin as unknown as { default: unknown })
  .default as (options: IMonacoEditorOpts) => PluginOption;

const DEV_SERVER_PROTOCOL = process.env.DEV_SERVER_PROTOCOL ?? 'https';
const PLATFORM_SERVER = process.env.PLATFORM_SERVER as string;
const AWX_WEBSOCKET_PREFIX = '/api/controller/v2/websocket/';

// Konflux e2e pipeline: build-platform-ui runs `npm run build` (with
// PLATFORM_SERVER set), then the sidecar runs `npx vite --force --port 4100`.
// Vite 8 Rolldown optimizer peaks at ~1.6GB bundling 62 deps — exceeds the
// sidecar's 2Gi limit and gets OOM-killed. Detect the built dist and serve it
// directly: keeps RSS under ~80MB while the /api proxy still reaches the AAP.
const platformDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(platformDir, 'dist');
const distIndex = path.join(distDir, 'index.html');
const isE2eSidecar =
  process.env.E2E_SIDECAR === '1' || (!process.stdout.isTTY && fs.existsSync(distIndex));

const environment: Record<string, string> = {
  PLATFORM_SERVER,
  AWX_API_PREFIX: '/api/controller/v2',
  AWX_WEBSOCKET_PREFIX,
  EDA_API_PREFIX: '/api/eda/v1',
  HUB_API_PREFIX: '/api/galaxy',
  METRICS_API_PREFIX: '/api/metrics/v1',
  DEV_SERVER_PROTOCOL,
};
console.log('Environment', environment);

const proxyUrl = PLATFORM_SERVER ? new URL(PLATFORM_SERVER) : undefined;
const wsURL = PLATFORM_SERVER ? new URL(PLATFORM_SERVER) : undefined;
if (wsURL) wsURL.protocol = 'wss:';

interface VitestUserConfig extends UserConfig {
  test: InlineConfig;
}
// https://vitejs.dev/config/
const config: VitestUserConfig = {
  plugins: isE2eSidecar
    ? []
    : [
        react(),
        svgr(),
        monacoEditorPluginDefault({
          publicPath: '/',
          languageWorkers: [],
          customWorkers: [
            { label: 'editorWorkerService', entry: 'monaco-editor/editor/editor.worker' },
            { label: 'json', entry: 'monaco-editor/language/json/json.worker' },
            { label: 'yaml', entry: 'monaco-yaml' },
          ],
        }),
        viteStaticCopy({ targets: [{ src: '../locales', dest: '' }] }) as PluginOption,
        compression(),
      ],
  define: { 'process.env': environment },
  // Vite 8 + Node 22 resolves `localhost` to ::1 only on Linux. Chromium sends
  // requests to 127.0.0.1. Bind all interfaces so both IPv4 and IPv6 work.
  // Vite 8 Rolldown changed CJS default-import semantics (the `default` import
  // from CJS with __esModule is now `module.exports.default` in type:module files).
  // This breaks react-use-websocket and similar CJS packages. Restore pre-Vite 8:
  // https://vite.dev/guide/migration#consistent-commonjs-interop
  legacy: { inconsistentCjsInterop: true },
  server: {
    host: process.env.CI ? '0.0.0.0' : 'localhost',
    strictPort: true,
    allowedHosts: process.env.CI ? true : undefined,
    cors: false,
    proxy: {
      '/api': {
        target: PLATFORM_SERVER,
        secure: false,
        headers: {
          host: proxyUrl?.host ?? '',
          origin: proxyUrl?.origin ?? '',
        },
      },
      [AWX_WEBSOCKET_PREFIX]: {
        target: wsURL?.origin,
        secure: false,
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
  build: {
    sourcemap: 'hidden',
    commonjsOptions: { transformMixedEsModules: true },
    rollupOptions: {
      output: {
        legalComments: 'none',
        codeSplitting: {
          groups: vendorChunkGroups,
        },
      },
    },
  },
  test: {
    coverage: {
      enabled: true,
      reporter: ['json', 'lcov', 'text'],
      reportsDirectory: 'coverage/vitest',
      include: ['**/*.{ts,tsx}'],
      exclude: ['node_modules/**', '**/vitest.*.ts'],
    },
    css: !process.env.CI,
    environment: 'happy-dom',
    setupFiles: ['vitest.setup.ts'],
    server: {
      deps: {
        inline: ['@patternfly/react-styles'],
      },
    },
    alias: getVitestAliases(),
  },
};

if (DEV_SERVER_PROTOCOL !== 'http') {
  const pems = selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
    days: 365,
    keySize: 2048,
  });
  const https = {
    key: pems.private,
    cert: pems.cert,
  };
  config.server!.https = https;
  config.preview = {
    ...config.preview,
    host: '0.0.0.0',
    strictPort: true,
    https,
  };
}

if (isE2eSidecar) {
  console.log('E2E sidecar: serving platform/dist (build has PLATFORM_SERVER baked in)');
  config.optimizeDeps = { noDiscovery: true, include: [] };
  config.server = {
    ...config.server,
    hmr: false,
    watch: null,
    preTransformRequests: false,
  };
  config.plugins = [
    {
      name: 'serve-dist',
      configureServer(server) {
        server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
          const url = req.url ?? '/';
          if (url.startsWith('/api')) {
            next();
            return;
          }
          const pathname = decodeURIComponent(url.split('?')[0] ?? '/');
          const filePath = path.join(distDir, pathname === '/' ? 'index.html' : pathname);
          const safe = path.normalize(filePath);
          if (!safe.startsWith(distDir + path.sep) && safe !== distDir) {
            res.statusCode = 403;
            res.end();
            return;
          }
          const file = fs.existsSync(safe) && fs.statSync(safe).isFile() ? safe : distIndex;
          const ext = path.extname(file).toLowerCase();
          const mimeTypes: Record<string, string> = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.wasm': 'application/wasm',
          };
          res.setHeader('Content-Type', mimeTypes[ext] ?? 'application/octet-stream');
          fs.createReadStream(file).pipe(res);
        });
      },
    } as PluginOption,
  ];
}

export default defineConfig(config);
