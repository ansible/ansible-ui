/// <reference types="cypress" />
// import 'cypress-axe';
import './commands';

before(() => {
  cy.login();
});

// afterEach(() => {
//   // cy.checkA11y()
// });
