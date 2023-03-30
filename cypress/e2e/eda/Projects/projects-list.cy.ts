/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

//Tests a user's ability to perform necessary actions on the Projects list in the EDA UI.

import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';

describe('EDA Projects List', () => {
  let edaproject: EdaProject;

  before(() => {
    cy.edaLogin();

    cy.createEdaProject().then((project) => {
      edaproject = project;
    });
  });
  after(() => {
    cy.deleteEdaProject(edaproject);
  });

  it('renders the EDA projects page', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.hasTitle(/^Projects$/);
    cy.get('h1').should('contain', 'Projects');
  });

  it('renders the Project details page', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.get('h1').should('contain', 'Projects');
    cy.clickRow(edaproject.name);
    cy.hasTitle(edaproject.name);
    cy.clickButton(/^Details$/);
    cy.get('#name').should('contain', edaproject.name);
  });

  it('can filter the Projects list based on Name', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.filterByText(edaproject.name);
    cy.get('td[data-label="Name"]').should('contain', edaproject.name);
  });

  it('can bulk delete Projects from the Projects list', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.createEdaProject().then((testProject) => {
      cy.navigateTo(/^Projects$/, false);
      cy.selectRow(testProject.name);
      cy.selectRow(edaproject.name);
      cy.clickToolbarAction(/^Delete selected projects$/);
      cy.confirmModalAction('Delete projects');
      cy.assertModalSuccess();
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
