describe('Authenticators', () => {
  before(() => {
    cy.platformLogin();
  });
  it('should render the Authenticators page', () => {
    cy.get('[data-cy="nav-toggle"]').should('exist');
    cy.visit('/access/authenticators');
    cy.verifyPageTitle('Authentication');
  });
});
//write CRUD commands
