/// <reference types="cypress" />
// import 'cypress-axe';
import '@cypress/code-coverage/support';
import './commands';
import { createGlobalProject } from './global-project';

before(() => {
  const devBaseUrl = Cypress.config().baseUrl?.split(':').slice(-1).toString();
  if (
    devBaseUrl &&
    (devBaseUrl === '4200' ||
      devBaseUrl === '4201' ||
      devBaseUrl === '4202' ||
      devBaseUrl === '4203' ||
      devBaseUrl === '4102' ||
      devBaseUrl === '4103')
  ) {
    return;
  } else {
    createGlobalProject();
  }
});

// afterEach(() => {
//   // cy.checkA11y()
// });
