/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineConfig } from 'cypress';
import { baseConfig } from './cypress.base.config';

baseConfig.e2e!.specPattern = 'cypress/e2e/awx/**/*.cy.ts';
baseConfig.e2e!.baseUrl = 'http://localhost:4101';
baseConfig.component!.specPattern = 'frontend/awx/**/*.cy.{js,jsx,ts,tsx}';

module.exports = defineConfig(baseConfig);
