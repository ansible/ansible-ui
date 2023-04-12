/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

//Tests a user's ability to perform necessary actions on the Projects list in the EDA UI.

describe('EDA Projects List', () => {
  before(() => cy.edaLogin());

  it('renders the EDA projects page', () => {
    cy.navigateTo(/^Projects$/);
    cy.hasTitle(/^Projects$/);
  });

  it('renders the Project details page', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.navigateTo(/^Projects$/);
      cy.clickRow(edaProject.name);
      cy.hasTitle(edaProject.name);
      cy.clickButton(/^Details$/);
      cy.get('#name').should('contain', edaProject.name);
      cy.deleteEdaProject(edaProject);
    });
  });

  it('can filter the Projects list based on Name', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.navigateTo(/^Projects$/);
      cy.filterByText(edaProject.name);
      cy.get('td[data-label="Name"]').should('contain', edaProject.name);
      cy.deleteEdaProject(edaProject);
    });
  });

  it('can bulk delete Projects from the Projects list', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.createEdaProject().then((testProject) => {
        cy.navigateTo(/^Projects$/);
        cy.selectRow(edaProject.name);
        cy.selectRow(testProject.name);
        cy.clickToolbarAction(/^Delete selected projects$/);
        cy.intercept('DELETE', `/api/eda/v1/projects/${edaProject.id}/`).as('edaProject');
        cy.intercept('DELETE', `/api/eda/v1/projects/${testProject.id}/`).as('testProject');
        cy.confirmModalAction('Delete projects');
        cy.wait('@deletedA').then((edaProject) => {
          expect(edaProject?.response?.statusCode).to.eql(204);
        });
        cy.wait('@deletedB').then((testProject) => {
          expect(testProject?.response?.statusCode).to.eql(204);
        });
        cy.assertModalSuccess();
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });
});
