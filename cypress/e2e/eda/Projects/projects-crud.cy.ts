//Tests a user's ability to create, edit, and delete a Project in the EDA UI.
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { randomString } from '../../../../framework/utils/random-string';

describe('EDA Projects CRUD', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can create a Project, sync it, and assert the information showing on the details page', () => {
    const name = 'E2E Team ' + randomString(4);
    cy.navigateTo(/^Projects$/, false);
    cy.clickButton(/^Create project$/);
    cy.typeByLabel(/^Name$/, name);
    cy.typeByLabel(/^SCM type$/, 'git');
    cy.typeByLabel(/^SCM URL$/, 'https://example.com');
    cy.clickButton(/^Create project$/);
    cy.hasTitle(name);
    cy.contains('#name', name);
    cy.contains('#SCM type', 'git');
  });

  it.skip('can edit a project', () => {
    //write test here
  });

  it.skip('can delete a project', () => {
    //write test here
  });
});
