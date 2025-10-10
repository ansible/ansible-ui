// vite.config.js
/* eslint-disable no-restricted-exports */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      name: '@ansible/ansible-ui-framework',
      entry: 'index.ts',
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-router',
        '@patternfly/react-core',
        '@patternfly/react-icons',
        '@patternfly/patternfly',
        '@patternfly/react-table',
        'monaco-editor',
        'monaco-yaml',
      ],
      output: {
        dir: 'publish',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router': 'ReactRouterDom',
          '@patternfly/react-core': 'PatternflyReactCore',
          '@patternfly/react-icons': 'PatternflyReactIcons',
          '@patternfly/react-table': 'PatternflyReactTable',
          '@patternfly/patternfly': 'Patternfly',
          'monaco-editor': 'MonacoEditor',
          'monaco-yaml': 'MonacoYaml',
        },
      },
    },
  },
  test: {
    coverage: {
      all: true,
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
    // found at: https://github.com/vitest-dev/vitest/discussions/1806
    alias: [
      {
        find: /^monaco-editor$/,
        replacement: __dirname + '/../node_modules/monaco-editor/esm/vs/editor/editor.api',
      },
    ],
  },
});
