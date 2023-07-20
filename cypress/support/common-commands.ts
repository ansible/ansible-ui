import '@cypress/code-coverage/support';

/** Find the toolbar filter select, clicks it and returns the opened menu element. */
Cypress.Commands.add('openToolbarFilterSelect', () => {
  cy.get('#filter').click().parent().get('.pf-c-menu');
});
