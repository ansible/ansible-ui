// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      name: '@ansible/ansible-ui-framework',
      entry: resolve(__dirname, 'framework/index.ts'),
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-router-dom',
        '@patternfly/react-core',
        '@patternfly/react-icons',
        '@patternfly/patternfly',
        '@patternfly/react-table',
        'monaco-editor',
      ],
      output: {
        dir: 'publish',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDom',
          '@patternfly/react-core': 'PatternflyReactCore',
          '@patternfly/react-icons': 'PatternflyReactIcons',
          '@patternfly/react-table': 'PatternflyReactTable',
          '@patternfly/patternfly': 'Patternfly',
          'monaco-editor': 'MonacoEditor',
        },
      },
    },
  },
});
