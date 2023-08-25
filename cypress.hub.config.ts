/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineConfig } from 'cypress';
import setValue from 'set-value';
import { baseConfig } from './cypress.base.config';

baseConfig.e2e!.specPattern = 'cypress/e2e/hub/**/*.cy.ts';
baseConfig.e2e!.baseUrl = 'http://localhost:4102';
baseConfig.component!.specPattern = 'frontend/hub/**/*.cy.{js,jsx,ts,tsx}';
baseConfig.env = {
  HUB_USERNAME: 'admin',
  HUB_PASSWORD: 'admin',
  HUB_SERVER: 'http://localhost:5001',
  HUB_API_PREFIX: '/api/automation-hub/',
  HUB_GALAXYKIT_COMMAND: 'galaxykit --ignore-certs',
};
setValue(baseConfig, 'component.devServer.webpackConfig.devServer.port', 4202);

module.exports = defineConfig(baseConfig);
