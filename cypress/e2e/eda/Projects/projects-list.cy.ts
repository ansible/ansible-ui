/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

//Tests a user's ability to perform necessary actions on the Projects list in the EDA UI.

import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';

describe('EDA Projects List', () => {
  let edaproject: EdaProject;

  before(() => {
    cy.edaLogin();

    cy.createEdaProject().then((proj) => {
      edaproject = proj;
    });
  });

  it('renders the EDA projects page', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.hasTitle(/^Projects$/);
  });

  it('renders the Project details page', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.clickRow(edaproject.name);
    cy.hasTitle(edaproject.name);
    cy.clickButton(/^Details$/);
    cy.contains('#name', edaproject.name);
  });

  it.only('can filter the Projects list based on Name', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.getRowFromList(edaproject.name);
  });

  it.skip('can bulk delete Projects from the Projects list', () => {
    //write this once Project deletion has been implemented
  });

  it.skip('can verify the functionality of items in the kebab menu on the Projects list view', () => {
    //write this once Project deletion has been implemented
  });
});
