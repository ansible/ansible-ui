describe('HUB Navigation Bar Functionality', () => {
  it('can visit full Hub instance from navbar', () => {
    cy.get('div').contains('Automation Content').click();
    cy.get('[data-cy="/ui/"]').contains('Full experience');
    cy.get('[data-cy="/ui/"]').should('have.attr', 'href');
    cy.get('[data-cy="/ui/"]').invoke('attr', 'href').should('eq', '/ui/');
  });
  it('can visit full Hub instance from alert', () => {
    cy.navigateTo('hub', 'namespaces');
    cy.get('div.pf-v5-c-banner.pf-m-blue > a')
      .invoke('attr', 'href')
      .should('eq', '/ui/namespaces/');
  });
});
