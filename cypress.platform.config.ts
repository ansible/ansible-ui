/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineConfig } from 'cypress';
import setValue from 'set-value';
import { baseConfig } from './cypress.base.config';

baseConfig.e2e!.specPattern = 'cypress/e2e/platform/**/*.cy.ts';
baseConfig.e2e!.baseUrl = 'https://localhost:4100';
baseConfig.component!.specPattern = 'platform/**/*.cy.{js,jsx,ts,tsx}';

baseConfig.env = {
  ...baseConfig.env,
  PLATFORM_SERVER: process.env.PLATFORM_SERVER,
  PLATFORM_USERNAME: process.env.PLATFORM_USERNAME,
  PLATFORM_PASSWORD: process.env.PLATFORM_PASSWORD,
};

setValue(baseConfig, 'component.devServer.webpackConfig.devServer.port', 4204);

module.exports = defineConfig(baseConfig);
