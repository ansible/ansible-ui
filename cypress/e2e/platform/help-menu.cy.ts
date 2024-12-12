describe('Platform Header Toolbar - Help Menu', () => {
  it('checks the help menu items', () => {
    cy.visit('/');

    // Click on help-menu
    cy.get('#help-menu-menu-toggle').click();
    //Check the docs link
    cy.checkAnchorLinks('Documentation');
    cy.get('[data-cy="masthead-documentation"]').within(() => {
      cy.get('a')
        .should('have.attr', 'href')
        .and(
          'include',
          'https://access.redhat.com/documentation/en-us/red_hat_ansible_automation_platform'
        );
    });
    // Check the quick starts link
    cy.get('[data-cy="masthead-quickstarts"]').click();
    cy.url().should('include', '/quickstarts');

    // Click on About to open the modal
    cy.get('#help-menu-menu-toggle').click();
    cy.get('[data-cy="masthead-about"]').click();

    cy.get('.pf-v5-c-about-modal-box').within(() => {
      // Check the Automation Controller Version is not empty
      cy.get('dt').contains('Automation Controller Version').next().should('not.be.empty');

      // Check the Automation Hub Version is not empty
      cy.get('dt').contains('Automation Hub Version').next().should('not.be.empty');

      // Check the Event-Driven Ansible Version is not empty
      cy.get('dt').contains('Event-Driven Ansible Version').next().should('not.be.empty');

      cy.get('.pf-v5-c-button').click();
    });
  });
});
