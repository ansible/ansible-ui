/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineConfig } from 'cypress';
import { baseConfig } from './cypress.base.config';

baseConfig.e2e!.specPattern = ['cypress/e2e/upgrades/**/*.cy.ts'];

baseConfig.e2e!.baseUrl = 'https://localhost:4100';
baseConfig.e2e!.env = {
  ...baseConfig.e2e!.env,
  PLATFORM_SERVER: process.env.PLATFORM_SERVER,
  PLATFORM_USERNAME: process.env.PLATFORM_USERNAME,
  PLATFORM_PASSWORD: process.env.PLATFORM_PASSWORD,
};
module.exports = defineConfig(baseConfig);
