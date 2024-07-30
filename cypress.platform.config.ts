/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineConfig } from 'cypress';
import setValue from 'set-value';
import { baseConfig } from './cypress.base.config';

baseConfig.e2e!.specPattern = [
  'cypress/e2e/platform/**/*.cy.ts',
  'cypress/e2e/awx/**/*.cy.ts',
  'cypress/e2e/eda/**/*.cy.ts',
  'cypress/e2e/resource_cleanup_downstream/*.cy.ts',
];
baseConfig.e2e!.excludeSpecPattern = [
  'cypress/e2e/awx/access/*.cy.ts',
  'cypress/e2e/awx/administration/applications.cy.ts',
  'cypress/e2e/awx/administration/settings.cy.ts',
  'cypress/e2e/awx/administration/instanceGroups.cy.ts',
  'cypress/e2e/awx/overview/*.cy.ts',
  'cypress/e2e/eda/Access-Management/*.cy.ts',
  'cypress/e2e/eda/admin-user/*.cy.ts',
  'cypress/e2e/eda/General-UI/*.cy.ts',
  'cypress/e2e/eda/main/*.cy.ts',
  'cypress/e2e/eda/overview/*.cy.ts',
  'cypress/e2e/eda/Roles/*.cy.ts',
  'cypress/e2e/eda/Users/*.cy.ts',
  'cypress/e2e/awx/resources/inventoriesConstructed.cy.ts',
  'cypress/e2e/awx/administration/wfApprovalsList.cy.ts',
  'cypress/e2e/awx/resources/inventoryHost/inventoryHostSmart.cy.ts',
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
