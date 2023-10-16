/// <reference types="cypress" />
// import 'cypress-axe';
import '@cypress/code-coverage/support';
import './commands';
import { Project } from '../../frontend/awx/interfaces/Project';
let Project: Project;

before(() => {
  cy.createGlobalProject().then((globalProject) => {
    globalProject = Project;
    cy.wrap(globalProject).as('globalProject');
  });
});

// afterEach(() => {
//   // cy.checkA11y()
// });
