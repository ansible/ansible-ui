/// <reference types="vite-plugin-svgr/client" />
/* eslint-disable no-restricted-exports */
/* eslint-disable no-console */
import react from '@vitejs/plugin-react-swc';
import { defineConfig, PluginOption } from 'vite';
import compression from 'vite-plugin-compression';
import monacoEditorPlugin, { IMonacoEditorOpts } from 'vite-plugin-monaco-editor';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';

const monacoEditorPluginDefault = (monacoEditorPlugin as unknown as { default: unknown })
  .default as (options: IMonacoEditorOpts) => PluginOption;

const EDA_SERVER = process.env.EDA_SERVER as string;

const environment: Record<string, string> = {
  EDA_SERVER,
  EDA_API_PREFIX: '/api/eda/v1',
};
console.log('Environment', environment);

const proxyUrl = EDA_SERVER ? new URL(EDA_SERVER) : undefined;
const wsURL = EDA_SERVER ? new URL(EDA_SERVER) : undefined;
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
    viteStaticCopy({ targets: [{ src: '../../locales', dest: '' }] }) as PluginOption,
    compression(),
  ],
  define: { 'process.env': environment },
  server: {
    cors: false,
    proxy: {
      '/api': {
        target: EDA_SERVER,
        secure: false,
        headers: {
          host: proxyUrl?.host ?? '',
          origin: proxyUrl?.origin ?? '',
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
    // found at: https://github.com/vitest-dev/vitest/discussions/1806
    alias: [
      {
        find: /^monaco-editor$/,
        replacement: __dirname + '/../../node_modules/monaco-editor/esm/vs/editor/editor.api',
      },
    ],
  },
});
