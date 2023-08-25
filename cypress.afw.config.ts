/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineConfig } from 'cypress';
import { baseConfig } from './cypress.base.config';

baseConfig.component!.specPattern = 'framework/**/*.cy.{js,jsx,ts,tsx}';

module.exports = defineConfig(baseConfig);
