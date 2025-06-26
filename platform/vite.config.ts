/// <reference types="vite-plugin-svgr/client" />
/* eslint-disable no-restricted-exports */
/* eslint-disable no-console */
import react from '@vitejs/plugin-react-swc';
import selfsigned from 'selfsigned';
import { defineConfig, PluginOption, UserConfig } from 'vite';
import compression from 'vite-plugin-compression';
import monacoEditorPlugin, { IMonacoEditorOpts } from 'vite-plugin-monaco-editor';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';
import type { InlineConfig } from 'vitest/node';

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
          pfcharts: ['@patternfly/react-charts'],
          pfquickstarts: ['@patternfly/quickstarts', '@patternfly/react-catalog-view-extension'],
          pftopology: ['@patternfly/react-topology'],
          'monaco-editor': ['monaco-editor'],
          'monaco-yaml': ['monaco-yaml'],
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
      exclude: ['node_modules/**'],
    },

    environment: 'happy-dom',
    setupFiles: ['vitest.setup.ts'],
    server: {
      deps: {
        inline: ['@patternfly/react-styles'],
      },
    },
    alias: [
      {
        find: /^monaco-editor$/,
        replacement: __dirname + '/../node_modules/monaco-editor/esm/vs/editor/editor.api',
      },
    ],
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
