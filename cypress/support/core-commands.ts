Cypress.Commands.add('getBy', (selector: string) => {
  cy.get(selector)
    .should('not.be.disabled')
    .should('not.have.attr', 'aria-disabled', 'true')
    .should('not.be.hidden')
    .should('be.visible');

  // The following line is necessary to avoid flakiness in the tests
  // It's a workaround when the element is found and while assertions are running, the element is replaced
  cy.get(selector);
});

Cypress.Commands.add('getByDataCy', (dataCy: string) => {
  cy.getBy(`[data-cy="${dataCy}"]`);
});

Cypress.Commands.add('containsBy', (selector: string, text: string | number | RegExp) => {
  cy.contains(selector, text)
    .should('not.be.disabled')
    .should('not.have.attr', 'aria-disabled', 'true')
    .should('not.be.hidden')
    .should('be.visible');

  // The following line is necessary to avoid flakiness in the tests
  // It's a workaround when the element is found and while assertions are running, the element is replaced
  cy.contains(selector, text);
});

Cypress.Commands.add('containsByDataCy', (dataCy: string, text: string | number | RegExp) => {
  cy.contains(`[data-cy="${dataCy}"]`, text)
    .should('not.be.disabled')
    .should('not.have.attr', 'aria-disabled', 'true')
    .should('not.be.hidden')
    .should('be.visible');

  // The following line is necessary to avoid flakiness in the tests
  // It's a workaround when the element is found and while assertions are running, the element is replaced
  cy.contains(`[data-cy="${dataCy}"]`, text);
});

/**
 * Helper method to wait for n requests to occur.
 * ref: https://github.com/cypress-io/cypress/issues/4389#issuecomment-500296894
 */
Cypress.Commands.add('waitTimes', (alias: string, count: number, statusCode: number) => {
  for (; count; count--) {
    cy.wait(alias)
      .its('response')
      .then((response) => {
        expect(response?.statusCode).to.eql(statusCode);
      });
  }
});
