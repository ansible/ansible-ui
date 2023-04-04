/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

//Tests a user's ability to create, edit, and delete a Project in the EDA UI.

import { randomString } from '../../../../framework/utils/random-string';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';

describe('EDA Projects CRUD', () => {
  let edaproject: EdaProject;

  before(() => {
    cy.edaLogin();

    cy.createEdaProject().then((proj) => {
      edaproject = proj;
    });
  });

  it('can create a Project, sync it, and assert the information showing on the details page', () => {
    const name = 'E2E Team ' + randomString(4);
    cy.navigateTo(/^Projects$/);
    cy.get('h1').should('contain', 'Projects');
    cy.clickButton(/^Create project$/);
    cy.typeByLabel(/^Name$/, name);
    cy.typeByLabel(/^SCM URL$/, 'https://github.com/ansible/event-driven-ansible');
    cy.clickButton(/^Create project$/);
    cy.get('h1').should('contain', name);
    cy.getEdaProjectByName(name).then((project) => {
      cy.wrap(project).should('not.be.undefined');
      if (project) {
        cy.deleteEdaProject(project);
      }
    });
  });

  it('can edit a project from the list view', () => {
    cy.navigateTo(/^Projects$/);
    cy.get('h1').should('contain', 'Projects');
    cy.clickRow(edaproject.name);
    cy.clickPageAction(/^Edit project$/);
    cy.hasTitle(/^Edit project$/);
    cy.typeByLabel(/^Name$/, 'a');
    cy.clickButton(/^Save project$/);
    cy.hasTitle(`${edaproject.name}a`);
    cy.get('h1').should('contain', edaproject.name);
  });

  it('deletes a Project from kebab menu from the project details page', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.clickRow(edaproject.name);
    cy.get('h1').should('contain', edaproject.name);
    cy.intercept('DELETE', `/api/eda/v1/projects/${edaproject.id}/`).as('deleted');
    cy.clickPageAction(/^Delete project$/);
    cy.confirmModalAction('Delete projects');
    cy.wait('@deleted').then((deleted) => {
      expect(deleted?.response?.statusCode).to.eql(204);
      cy.get('h1').should('contain', 'Projects');
    });
  });
});
