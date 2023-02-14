/// <reference types="cypress" />
// import 'cypress-axe';
import '@cypress/code-coverage/support';
import './commands';

before(() => {
  cy.login();
});

// afterEach(() => {
//   // cy.checkA11y()
// });
