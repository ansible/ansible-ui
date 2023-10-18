/// <reference types="cypress" />
// import 'cypress-axe';
import '@cypress/code-coverage/support';
import './commands';
import { createGlobalProject } from './global-project';

before(() => {
  const devBaseUrl = Cypress.config().baseUrl?.split(':').slice(-1).toString();
  cy.log('PORT', devBaseUrl);
  if (devBaseUrl && (devBaseUrl === '4201' || devBaseUrl === '4202' || devBaseUrl === '4203')) {
    return;
  } else {
    createGlobalProject();
  }
});

// afterEach(() => {
//   // cy.checkA11y()
// });
