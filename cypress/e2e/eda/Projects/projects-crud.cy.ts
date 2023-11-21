/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

//Tests a user's ability to create, edit, and delete a Project in the EDA UI.

import { randomString } from '../../../../framework/utils/random-string';

describe('EDA Projects CRUD', () => {
  before(() => cy.edaLogin());

  it('can create a Project, sync it, and assert the information showing on the details page', () => {
    const name = 'E2E Project ' + randomString(4);
    cy.navigateTo('eda', 'projects');
    cy.get('h1').should('contain', 'Projects');
    cy.clickButton(/^Create project$/);
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="url"]').type('https://github.com/ansible/ansible-ui');
    cy.clickButton(/^Create project$/);
    cy.verifyPageTitle(name);
    cy.getEdaProjectByName(name).then((project) => {
      cy.wrap(project).should('not.be.undefined');
      if (project) cy.deleteEdaProject(project);
    });
  });

  it('can edit a project from the list view', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.navigateTo('eda', 'projects');
      cy.get('h1').should('contain', 'Projects');
      cy.clickTableRow(edaProject.name);
      cy.clickPageAction('edit-project');
      cy.verifyPageTitle(`Edit ${edaProject.name}`);
      cy.get('[data-cy="name"]').type(edaProject.name + 'a');
      cy.clickButton(/^Save project$/);
      cy.verifyPageTitle(`${edaProject.name}a`);
      cy.deleteEdaProject(edaProject);
    });
  });

  it('deletes a Project from kebab menu from the project details page', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.navigateTo('eda', 'projects');
      cy.clickTableRow(edaProject.name);
      cy.verifyPageTitle(edaProject.name);
      cy.intercept('DELETE', `/api/eda/v1/projects/${edaProject.id}/`).as('deleted');
      cy.clickPageAction('delete-project');
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete projects');
      cy.wait('@deleted').then((deleted) => {
        expect(deleted?.response?.statusCode).to.eql(204);
        cy.verifyPageTitle('Projects');
      });
    });
  });
});
