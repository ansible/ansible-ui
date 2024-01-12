describe('Authenticators', () => {
  before(() => {
    cy.platformLogin();
  });
  it('should render the Authenticators page', () => {
    // cy.visit('/login');
    // cy.get('[data-cy="username"]').type('xyz', { log: false, delay: 0 });
    // cy.get('[data-cy="password"]').type('xyz', { log: false, delay: 0 });
    // cy.get('[data-cy="Submit"]').click();
    cy.get('[data-cy="nav-toggle"]').should('exist');
    cy.visit('/access/authenticators');
    cy.verifyPageTitle('Authentication');
  });
});
