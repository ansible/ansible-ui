/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineConfig } from 'cypress';
import setValue from 'set-value';
import { baseConfig } from './cypress.base.config';

baseConfig.e2e!.specPattern = [
  'cypress/e2e/platform/**/*.cy.ts',
  'cypress/e2e/awx/**/*.cy.ts',
  'cypress/e2e/eda/**/*.cy.ts',
  'cypress/e2e/hub/**/*.cy.ts',
  'cypress/e2e/resource_cleanup_downstream/*.cy.ts',
];
baseConfig.e2e!.excludeSpecPattern = [
  'cypress/e2e/awx/access/organizations/*.cy.ts',
  'cypress/e2e/awx/access/teams/*.cy.ts',
  'cypress/e2e/awx/access/tokens/*.cy.ts',
  'cypress/e2e/awx/access/users/*.cy.ts',
  'cypress/e2e/awx/cleanup/*.cy.ts',
  'cypress/e2e/awx/overview/*.cy.ts',
  'cypress/e2e/eda/admin-user/*.cy.ts',
  'cypress/e2e/eda/cleanup/*.cy.ts',
  'cypress/e2e/eda/General-UI/*.cy.ts',
  'cypress/e2e/eda/main/*.cy.ts',
  'cypress/e2e/eda/overview/*.cy.ts',
  'cypress/e2e/eda/Roles/*.cy.ts',
  'cypress/e2e/eda/Users/*.cy.ts',
  'cypress/e2e/hub/api-tokens.cy.ts',
  'cypress/e2e/hub/approvals.cy.ts',
  'cypress/e2e/hub/collections-detail-install.cy.ts',
  'cypress/e2e/hub/overview/hub-overview.cy.ts',
  'cypress/e2e/hub/hub-roles.cy.ts',
  'cypress/e2e/hub/namespaces.cy.ts',
  'cypress/e2e/hub/signature-keys.cy.ts',
];
baseConfig.e2e!.baseUrl = 'https://localhost:4100';
baseConfig.component!.specPattern = 'platform/**/*.cy.{js,jsx,ts,tsx}';
baseConfig.e2e!.env = {
  ...baseConfig.e2e!.env,
  PLATFORM_SERVER: process.env.PLATFORM_SERVER,
  PLATFORM_USERNAME: process.env.PLATFORM_USERNAME,
  PLATFORM_PASSWORD: process.env.PLATFORM_PASSWORD,
};
setValue(baseConfig, 'component.devServer.webpackConfig.devServer.port', 4204);
module.exports = defineConfig(baseConfig);
