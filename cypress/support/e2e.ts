/// <reference types="cypress" />
// import 'cypress-axe';
import '@cypress/code-coverage/support';
import './commands';
import { createGlobalProject } from './global-project';

before(() => {
  createGlobalProject();
});

// afterEach(() => {
//   // cy.checkA11y()
// });
