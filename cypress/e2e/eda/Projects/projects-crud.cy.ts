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
    cy.clickButton(/^Create project$/);
    cy.typeByLabel(/^Name$/, name);
    cy.typeByLabel(/^SCM URL$/, 'https://example.com');
    cy.clickButton(/^Create project$/);
    cy.hasTitle(name);
  });

  it.only('can edit a project from the list view', () => {
    cy.navigateTo(/^Projects$/);
    cy.clickRow(edaproject.name);
    cy.clickPageAction(/^Edit project$/);
    cy.hasTitle(/^Edit project$/);
    cy.typeByLabel(/^Name$/, 'a');
    cy.clickButton(/^Save project$/);
    cy.hasTitle(`${edaproject.name}a`);
  });

  it.skip('can delete a project', () => {
    //write this once Project deletion has been implemented
  });
});
