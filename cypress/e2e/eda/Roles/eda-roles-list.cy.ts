//Tests a user's ability to perform certain actions on the Roles list in the EDA UI.

// Skip Eda role tests until the API is available in eda-server/main
describe.skip('EDA Roles List', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can render the Roles list view and utilize the Roles links to view details', () => {
    cy.navigateTo('eda', 'roles');
    cy.verifyPageTitle('Roles');
    cy.getEdaRoles().then((roles) => {
      cy.get('tbody').find('tr').should('have.length', roles.length);
      roles.forEach((role) => {
        cy.verifyPageTitle('Roles');
        cy.clickLink(role.name);
        cy.verifyPageTitle(role.name);
        cy.get('#description').should('contain', role.description);
        cy.clickLink(/^Roles$/);
      });
    });
  });
});
