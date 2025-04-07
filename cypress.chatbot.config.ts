/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineConfig } from 'cypress';
import setValue from 'set-value';
import { baseConfig } from './cypress.base.config';

baseConfig.e2e!.specPattern = 'cypress/e2e/chatbot/**/*.cy.ts';
baseConfig.e2e!.baseUrl = 'https://localhost:4100';
baseConfig.component!.specPattern = 'frontend/chatbot/**/*.cy.{js,jsx,ts,tsx}';
setValue(baseConfig, 'component.devServer.webpackConfig.devServer.port', 4205);

let PLATFORM_SERVER = process.env.PLATFORM_SERVER;
if (PLATFORM_SERVER && PLATFORM_SERVER.endsWith('/')) {
  PLATFORM_SERVER = PLATFORM_SERVER.slice(0, -1);
}

baseConfig.e2e!.env = {
  ...baseConfig.e2e!.env,
  PLATFORM_SERVER: PLATFORM_SERVER,
  PLATFORM_USERNAME: process.env.PLATFORM_USERNAME,
  PLATFORM_PASSWORD: process.env.PLATFORM_PASSWORD,
};
module.exports = defineConfig(baseConfig);
