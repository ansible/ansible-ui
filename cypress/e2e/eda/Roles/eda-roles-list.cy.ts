//Tests a user's ability to perform certain actions on the Roles list in the EDA UI.

describe('EDA Roles List', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can render the Roles list view and utilize the Roles links to view details', () => {
    cy.navigateTo('eda', 'roles');
    cy.verifyPageTitle('Roles');
    cy.getEdaRoles().then((roles) => {
      cy.setTablePageSize('20');
      cy.get('tbody').find('tr').should('have.length', roles.length);
      roles.forEach((role) => {
        cy.verifyPageTitle('Roles');
        cy.clickTableRow(role.name, true);
        cy.verifyPageTitle(role.name);
        cy.get('#description').should('contain', role.description);
        cy.clickLink(/^Roles$/);
      });
    });
  });
});
