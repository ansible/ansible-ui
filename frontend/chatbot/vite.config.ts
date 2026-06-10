/// <reference types="vite-plugin-svgr/client" />
/* eslint-disable no-restricted-exports */
/* eslint-disable no-console */
import react from '@vitejs/plugin-react';
import { type PluginOption } from 'vite';
import { defineConfig } from 'vitest/config';
import compression from 'vite-plugin-compression';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import svgr from 'vite-plugin-svgr';
import { getVitestAliases } from '../../framework/vitest.shared';

const PLATFORM_SERVER = process.env.PLATFORM_SERVER as string;

const environment: Record<string, string> = {
  PLATFORM_SERVER: PLATFORM_SERVER,
  LIGHTSPEED_API_PREFIX: '/api/lightspeed/v1',
};
console.log('Environment', environment);

const proxyUrl = PLATFORM_SERVER ? new URL(PLATFORM_SERVER) : undefined;
const wsURL = PLATFORM_SERVER ? new URL(PLATFORM_SERVER) : undefined;
if (wsURL) wsURL.protocol = 'wss:';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    viteStaticCopy({ targets: [{ src: '../../locales', dest: '' }] }) as PluginOption,
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
    },
  },
  esbuild: { legalComments: 'none' },
  build: {
    lib: {
      name: '@ansible/chatbot',
      entry: ['index.ts'],
      fileName: 'index',
    },
    commonjsOptions: { transformMixedEsModules: true },
    rollupOptions: {
      external: ['react'],
    },
  },
  test: {
    globals: true,
    coverage: {
      enabled: true,
      reporter: ['json', 'lcov', 'text'],
      reportsDirectory: 'coverage/vitest',
      include: ['**/*.{ts,tsx}'],
      exclude: ['node_modules/**'],
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
});
