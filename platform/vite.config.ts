/// <reference types="vite-plugin-svgr/client" />
/* eslint-disable no-restricted-exports */
/* eslint-disable no-console */
import react from '@vitejs/plugin-react-swc';
import selfsigned from 'selfsigned';
import { defineConfig, PluginOption } from 'vite';
import compression from 'vite-plugin-compression';
import monacoEditorPlugin, { IMonacoEditorOpts } from 'vite-plugin-monaco-editor';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';
import env2 from '../webpack/environment.cjs';

const pems = selfsigned.generate([{ name: 'commonName', value: 'contoso.com' }], {
  days: 365,
  keySize: 2048,
});

const monacoEditorPluginDefault = (monacoEditorPlugin as unknown as { default: unknown })
  .default as (options: IMonacoEditorOpts) => PluginOption;

const PLATFORM_SERVER = process.env.PLATFORM_SERVER as string;
const AWX_WEBSOCKET_PREFIX = '/api/controller/v2/websocket/';

let env = { PLATFORM_SERVER, AWX_WEBSOCKET_PREFIX };
env = { ...env, ...env2 };
console.log('Environment', env);

const proxyUrl = PLATFORM_SERVER ? new URL(PLATFORM_SERVER) : undefined;
const wsURL = PLATFORM_SERVER ? new URL(PLATFORM_SERVER) : undefined;
if (wsURL) wsURL.protocol = 'wss:';

// https://vitejs.dev/config/
export default defineConfig({
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
  define: { 'process.env': env },
  optimizeDeps: {
    include: [
      '@patternfly/quickstarts',
      '@patternfly/react-catalog-view-extension',
      '@patternfly/react-charts',
      '@patternfly/react-core',
      '@patternfly/react-icons',
      '@patternfly/react-styles',
      '@patternfly/react-table',
      '@patternfly/react-tokens',
      '@patternfly/react-topology',
    ],
    exclude: ['monaco-editor'],
  },
  server: {
    cors: false,
    https: {
      key: pems.private,
      cert: pems.cert,
    },
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
        target: PLATFORM_SERVER,
        secure: false,
        ws: true,
        headers: {
          host: wsURL?.host ?? '',
          origin: wsURL?.origin ?? '',
        },
      },
    },
  },
  esbuild: { legalComments: 'none' },
  build: {
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
});
