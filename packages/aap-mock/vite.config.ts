// vite.config.js
/* eslint-disable no-restricted-exports */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    environment: 'happy-dom',
    setupFiles: ['vitest.setup.ts'],
  },
});
