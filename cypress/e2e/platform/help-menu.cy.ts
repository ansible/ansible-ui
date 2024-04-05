describe('Platform Header Toolbar - Help Menu', () => {
  it('checks the help menu items', () => {
    cy.platformLogin();
    cy.visit('/');

    // Click on help-menu
    cy.get('[data-cy="help-menu"]').click();

    //Check the docs link
    cy.checkAnchorLinks('Documentation');
    cy.get('[data-cy="masthead-documentation"]')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'href')
      .and(
        'equal',
        'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform'
      );

    // Check the quick starts link
    cy.get('[data-cy="masthead-quickstarts"]').click();
    cy.url().should('include', '/quickstarts');

    // Click on About to open the modal
    cy.get('[data-cy="help-menu"]').click();
    cy.get('[data-cy="masthead-about"]').click();

    cy.get('.pf-v5-c-about-modal-box').within(() => {
      // Check the Automation Controller Version
      cy.get('dt').contains('Automation Controller Version').next().should('have.text', '4.6.0');

      // Check the Automation Hub Version
      cy.get('dt').contains('Automation Hub Version').next().should('have.text', '4.10.0dev');
      cy.get('.pf-v5-c-button').click();
    });
  });
});
