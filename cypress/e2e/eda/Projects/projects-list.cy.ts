/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

//Tests a user's ability to perform necessary actions on the Projects list in the EDA UI.

describe('EDA Projects List', () => {
  before(() => cy.edaLogin());

  it('renders the EDA projects page', () => {
    cy.visit('/eda/projects?sort=&page=1&perPage=100');
    cy.hasTitle(/^Projects$/);
  });

  it('renders the Project details page', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.visit('/eda/projects?sort=&page=1&perPage=100');
      cy.clickTableRow(edaProject.name);
      cy.hasTitle(edaProject.name);
      cy.clickButton(/^Details$/);
      cy.get('#name').should('contain', edaProject.name);
      cy.deleteEdaProject(edaProject);
    });
  });

  it('can filter the Projects list based on Name', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.visit('/eda/projects?sort=&page=1&perPage=100');
      cy.filterTableByText(edaProject.name);
      cy.get('td[data-label="Name"]').should('contain', edaProject.name);
      cy.deleteEdaProject(edaProject);
    });
  });

  it('can bulk delete Projects from the Projects list', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.createEdaProject().then((testProject) => {
        cy.visit('/eda/projects?sort=&page=1&perPage=100');
        cy.selectTableRow(edaProject.name);
        cy.selectTableRow(testProject.name);
        cy.clickToolbarKebabAction(/^Delete selected projects$/);
        cy.intercept('DELETE', `/api/eda/v1/projects/${edaProject.id}/`).as('edaProject');
        cy.intercept('DELETE', `/api/eda/v1/projects/${testProject.id}/`).as('testProject');
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
