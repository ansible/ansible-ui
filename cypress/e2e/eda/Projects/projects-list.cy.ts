/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { edaAPI } from '../../../support/formatApiPathForEDA';

//Tests a user's ability to perform necessary actions on the Projects list in the EDA UI.

describe('EDA Projects List', () => {
  before(() => cy.edaLogin());

  it('renders the EDA projects page', () => {
    cy.navigateTo('eda', 'projects');
    cy.verifyPageTitle('Projects');
  });

  it('renders the Project details page', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.navigateTo('eda', 'projects');
      cy.clickTableRow(edaProject.name);
      cy.verifyPageTitle(edaProject.name);
      cy.clickLink(/^Details$/);
      cy.get('#name').should('contain', edaProject.name);
      cy.deleteEdaProject(edaProject);
    });
  });

  it('can filter the Projects list based on Name', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.navigateTo('eda', 'projects');
      cy.filterTableByText(edaProject.name);
      cy.get('td[data-label="Name"]').should('contain', edaProject.name);
      cy.deleteEdaProject(edaProject);
    });
  });

  // Disabling this test as it is randomly failing because the backend randomly returns a 500
  it.skip('can bulk delete Projects from the Projects list', () => {
    //re-enable this test when bulk deletion in fixed in the EDA API
    cy.createEdaProject().then((edaProject) => {
      cy.createEdaProject().then((testProject) => {
        cy.navigateTo('eda', 'projects');
        cy.selectTableRow(edaProject.name);
        cy.selectTableRow(testProject.name);
        cy.clickToolbarKebabAction('delete-selected-projects');
        cy.intercept('DELETE', edaAPI`/projects/${edaProject.id.toString()}/`).as('edaProject');
        cy.intercept('DELETE', edaAPI`/projects/${testProject.id.toString()}/`).as('testProject');
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete projects');
        cy.wait('@edaProject').then((edaProject) => {
          expect(edaProject?.response?.statusCode).to.eql(204);
        });
        cy.wait('@testProject').then((testProject) => {
          expect(testProject?.response?.statusCode).to.eql(204);
        });
        cy.assertModalSuccess();
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });
});
