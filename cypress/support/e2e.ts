/// <reference types="cypress" />
// import 'cypress-axe';
import './commands';

beforeEach(() => {
  cy.login();
});

afterEach(() => {
  // cy.checkA11y()
});
