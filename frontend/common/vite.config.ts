/* eslint-disable no-restricted-exports */
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type PluginOption } from 'vite';
import { defineConfig } from 'vitest/config';
import { getVitestAliases } from '../../framework/vitest.shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()] as PluginOption[],

  test: {
    globals: true,
    css: !process.env.CI,
    environment: 'happy-dom',
    setupFiles: ['vitest.setup.ts'],
    coverage: {
      enabled: true, // Enabled for dump scripts
      reporter: ['json', 'lcov', 'text'],
      reportsDirectory: 'coverage/vitest',
      include: ['**/*.{ts,tsx}'],
      exclude: ['node_modules/**', '**/vitest.*.ts'],
    },
    server: {
      deps: {
        inline: ['@patternfly/react-styles'],
      },
    },
    // found at: https://github.com/vitest-dev/vitest/discussions/1806
    alias: [
      ...getVitestAliases(),
      {
        find: /^monaco-editor$/,
        replacement: path.resolve(
          __dirname,
          '../../node_modules/monaco-editor/esm/vs/editor/editor.api'
        ),
      },
    ],
  },
});
