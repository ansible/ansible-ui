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
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        'react',
        'react-dom',
        '@patternfly/react-core',
        '@patternfly/react-icons',
        '@patternfly/patternfly',
        '@patternfly/react-table',
      ],
      output: {
        dir: 'publish',
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@patternfly/react-core': 'PatternflyReactCore',
          '@patternfly/react-icons': 'PatternflyReactIcons',
          '@patternfly/react-table': 'PatternflyReactTable',
          '@patternfly/patternfly': 'Patternfly',
        },
      },
    },
  },
});
