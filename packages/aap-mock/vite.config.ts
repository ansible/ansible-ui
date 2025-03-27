// vite.config.js
/* eslint-disable no-restricted-exports */
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  test: {
    environment: 'happy-dom',
    setupFiles: ['vitest.setup.ts'],
  },
});
