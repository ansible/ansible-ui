/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineConfig } from 'cypress';
import setValue from 'set-value';
import { baseConfig } from './cypress.base.config';

baseConfig.e2e!.specPattern = 'cypress/e2e/hub/collections-list.cy.ts';
baseConfig.e2e!.baseUrl = 'https://localhost:4102';
baseConfig.component!.specPattern = 'frontend/hub/**/*.cy.{js,jsx,ts,tsx}';
setValue(baseConfig, 'component.devServer.webpackConfig.devServer.port', 4202);

module.exports = defineConfig(baseConfig);
