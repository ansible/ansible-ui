/// <reference types="cypress" />
describe('organizations', () => {
  it('organizations page', () => {
    cy.navigateTo(/^Organizations$/);
    cy.hasTitle(/^Organizations$/);
  });

  it('organization details', () => {
    cy.navigateTo(/^Organizations$/);
    cy.clickRow(/^Organization 002$/);
    cy.hasTitle(/^Organization 002$/);
  });

  it('organizations toolbar delete organizations', () => {
    cy.navigateTo(/^Organizations$/);
    cy.get('#select-all').click();
    cy.clickToolbarAction(/^Delete selected organizations/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete organization/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
  });

  it('organizations empty state', () => {
    cy.navigateTo(/^Organizations$/);
    cy.contains('No organizations yet');
  });

  it('empty state create organization', () => {
    cy.navigateTo(/^Organizations$/);
    cy.clickButton(/^Create organization$/);
    cy.hasTitle(/^Create organization$/);
  });
});
