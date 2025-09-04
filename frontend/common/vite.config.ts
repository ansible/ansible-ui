/* eslint-disable no-restricted-exports */
import react from '@vitejs/plugin-react';
import { defineConfig, type PluginOption } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()] as PluginOption[],

  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['vitest.setup.ts'],
    coverage: {
      enabled: true, // Enabled for dump scripts
      reporter: ['json', 'lcov', 'text'],
      reportsDirectory: 'coverage/vitest',
      include: ['**/*.{ts,tsx}'],
      exclude: ['node_modules/**'],
    },
  },
});
