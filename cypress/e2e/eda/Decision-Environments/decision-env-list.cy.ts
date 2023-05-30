//Tests a user's ability to perform certain actions on the Decision Environment list in the EDA UI.

describe('EDA Decision Environment List', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can filter the Decision Environment list based on Name filter option', () => {
    cy.createEdaDecisionEnvironment().then((edaDE) => {
      cy.navigateTo(/^Decision Environments$/);
      cy.hasTitle(/^Decision Environments$/)
        .next('p')
        .should(
          'have.text',
          'Decision environments contain a rulebook image that dictates where the rulebooks will run.'
        );
      cy.filterTableByText(edaDE.name);
      cy.get('button[aria-label="table view"]').click();
      cy.contains('td', edaDE.name).should('be.visible').click();
      cy.deleteEdaDecisionEnvironment(edaDE);
    });
  });

  it('can bulk delete Decision Environments from the list', () => {
    cy.createEdaDecisionEnvironment().then((edaDE1) => {
      cy.createEdaDecisionEnvironment().then((edaDE2) => {
        cy.navigateTo(/^Decision Environments$/);
        cy.get('button[aria-label="table view"]').click();
        cy.selectTableRow(edaDE1.name);
        cy.selectTableRow(edaDE2.name);
        cy.clickToolbarKebabAction(/^Delete selected decision environments$/);
        cy.intercept('DELETE', `/api/eda/v1/decision-environments/${edaDE1.id}/`).as('edaDE1');
        cy.intercept('DELETE', `/api/eda/v1/decision-environments/${edaDE2.id}/`).as('edaDE2');
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete decision environments');
        cy.wait(['@edaDE1', '@edaDE2']).then((edaArr) => {
          expect(edaArr[0]?.response?.statusCode).to.eql(204);
          expect(edaArr[1]?.response?.statusCode).to.eql(204);
        });
        cy.assertModalSuccess();
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });

  it('can verify the delete functionality of items in the kebab menu of the DE list view', () => {
    cy.createEdaDecisionEnvironment().then((edaDE) => {
      cy.navigateTo(/^Decision Environments$/);
      cy.hasTitle(/^Decision Environments$/);
      cy.clickTableRowKebabAction(edaDE.name, /^Delete decision environment$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete decision environment/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
      cy.hasTitle(/^Decision Environments$/);
    });
  });
});
