// import codeCoverage from '@cypress/code-coverage/task';
import { defineConfig } from 'cypress';

export default defineConfig({
  viewportWidth: 1600,
  viewportHeight: 1120,
  pageLoadTimeout: 120000,
  defaultCommandTimeout: 30000,
  video: false,
  e2e: {
    testIsolation: false,
    setupNodeEvents(on, config) {
      //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
      //   codeCoverage(on, config);
      return config;
    },
    baseUrl: 'https://localhost:3002/',
  },
  component: {
    setupNodeEvents(on, config) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
      // codeCoverage(on, config);
      return config;
    },
    devServer: { framework: 'react', bundler: 'vite' },
    specPattern: ['frontend/**/*.cy.tsx', 'framework/**/*.cy.tsx'],
    supportFile: 'cypress/support/component.tsx',
  },
});
