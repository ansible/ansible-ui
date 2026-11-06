/// <reference types="vite-plugin-svgr/client" />
/* eslint-disable no-restricted-exports */
/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import selfsigned from 'selfsigned';
import { defineConfig, PluginOption, UserConfig } from 'vite';
import compression from 'vite-plugin-compression';
import monacoEditorPlugin, { IMonacoEditorOpts } from 'vite-plugin-monaco-editor';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';
import type { InlineConfig } from 'vitest/node';
import { getVitestAliases } from '../framework/vitest.shared';

const platformDir = path.dirname(fileURLToPath(import.meta.url));
const repoRootDir = path.resolve(platformDir, '..');
const rootMonacoEditorDir = path.join(repoRootDir, 'node_modules', 'monaco-editor');
const localMonacoEditorDir = path.join(platformDir, 'node_modules', 'monaco-editor');

/**
 * `vite-plugin-monaco-editor` resolves workers with
 * `require.resolve(join(process.cwd(), 'node_modules', 'monaco-editor/esm/vs/...'))`.
 * The platform app runs with cwd `platform/` while dependencies are hoisted to the repo root, so
 * create a symlink `platform/node_modules/monaco-editor` → `../../node_modules/monaco-editor`.
 */
function ensureMonacoEditorSymlink(): PluginOption {
  return {
    name: 'ensure-monaco-editor-symlink',
    enforce: 'pre',
    config() {
      if (!fs.existsSync(rootMonacoEditorDir)) {
        return;
      }
      fs.mkdirSync(path.dirname(localMonacoEditorDir), { recursive: true });
      try {
        const stat = fs.lstatSync(localMonacoEditorDir);
        if (stat.isSymbolicLink()) {
          fs.unlinkSync(localMonacoEditorDir);
        } else if (stat.isDirectory()) {
          return;
        }
      } catch {
        // does not exist yet
      }
      const relativeTarget = path.relative(path.dirname(localMonacoEditorDir), rootMonacoEditorDir);
      fs.symlinkSync(relativeTarget, localMonacoEditorDir);
    },
  };
}

const monacoEditorPluginDefault = (monacoEditorPlugin as unknown as { default: unknown })
  .default as (options: IMonacoEditorOpts) => PluginOption;

const DEV_SERVER_PROTOCOL = process.env.DEV_SERVER_PROTOCOL ?? 'https';
const PLATFORM_SERVER = process.env.PLATFORM_SERVER as string;
const AWX_WEBSOCKET_PREFIX = '/api/controller/v2/websocket/';

const environment: Record<string, string> = {
  PLATFORM_SERVER,
  AWX_API_PREFIX: '/api/controller/v2',
  AWX_WEBSOCKET_PREFIX,
  EDA_API_PREFIX: '/api/eda/v1',
  HUB_API_PREFIX: '/api/galaxy',
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
  plugins: [
    ensureMonacoEditorSymlink(),
    react(),
    svgr(),
    monacoEditorPluginDefault({
      publicPath: '/',
      languageWorkers: ['json', 'editorWorkerService'],
      customWorkers: [{ label: 'yaml', entry: 'monaco-yaml' }],
    }),
    viteStaticCopy({ targets: [{ src: '../locales', dest: '' }] }) as PluginOption,
    compression(),
  ],
  define: { 'process.env': environment },
  server: {
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
  esbuild: { legalComments: 'none' },
  build: {
    sourcemap: 'hidden',
    commonjsOptions: { transformMixedEsModules: true },
    rollupOptions: {
      output: {
        manualChunks: {
          patternfly: [
            '@patternfly/react-core',
            '@patternfly/react-icons',
            '@patternfly/react-styles',
            '@patternfly/react-table',
            '@patternfly/react-tokens',
          ],
          pfcharts: ['@patternfly/react-charts/victory'],
          pfquickstarts: ['@patternfly/quickstarts'],
          pftopology: ['@patternfly/react-topology'],
          'monaco-editor': ['monaco-editor'],
          'monaco-yaml': ['monaco-yaml'],
        },
      },
    },
  },
  test: {
    /** Parallel MSW + UI runs need more than Vitest's default 5s, especially with coverage. */
    testTimeout: 30000,
    coverage: {
      enabled: true,
      reporter: ['json', 'lcov', 'text'],
      reportsDirectory: 'coverage/vitest',
      include: ['**/*.{ts,tsx}'],
      exclude: [
        'node_modules/**',
        '**/vitest.*.ts',
        'interfaces/**',
        'main/Platform.tsx',
        '**/__mocks__/**',
      ],
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
  const pems = selfsigned.generate([{ name: 'commonName', value: 'contoso.com' }], {
    days: 365,
    keySize: 2048,
  });
  config.server!.https = {
    key: pems.private,
    cert: pems.cert,
  };
}

export default defineConfig(config);
