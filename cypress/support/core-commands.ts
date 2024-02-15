// ---------------------------------------------------------------------
// Core Commands
// ---------------------------------------------------------------------
// These commands are the core commands that are used to interact with the UI.
// They are used to interact with the UI in a way that is consistent and reliable.
// They check that the element is not disabled or hidden before interacting with it.

/** Get by selector, making sure it is not disabled or hidden */
Cypress.Commands.add('getBy', (selector: string) => {
  cy.get(`${selector}:not(:disabled):not(:hidden):visible:not([aria-disabled="true"])`);
});

/** Get by data-cy attribute, making sure it is not disabled or hidden */
Cypress.Commands.add('getByDataCy', (dataCy: string) => {
  cy.getBy(`[data-cy="${dataCy}"]`);
});

/** Contains by selector, making sure it is not disabled or hidden */
Cypress.Commands.add('containsBy', (selector: string, text?: string | number | RegExp) => {
  cy.contains(`${selector}:not(:disabled):not(:hidden):visible:not([aria-disabled="true"])`, text);
});

/** Click by selector, making sure it is not disabled or hidden */
Cypress.Commands.add('clickBy', (selector: string, text?: string | number | RegExp) => {
  cy.containsBy(selector, text).click();
});

/** Click by data-cy attribute, making sure it is not disabled or hidden */
Cypress.Commands.add('clickByDataCy', (dataCy: string) => {
  cy.getBy(`[data-cy="${dataCy}"]`).click();
});

/** Type input by selector, making sure it is not disabled or hidden */
Cypress.Commands.add('typeBy', (selector: string, text: string) => {
  cy.getBy(selector).type(text);
});

/** Type input by data-cy attribute, making sure it is not disabled or hidden */
Cypress.Commands.add('typeByDataCy', (dataCy: string, text: string) => {
  cy.typeBy(`[data-cy="${dataCy}"]`, text);
});

/** Select a value from a single select input by selector, making sure it is not disabled or hidden */
Cypress.Commands.add('singleSelectBy', (selector: string, value: string) => {
  cy.getBy(selector)
    .click()
    .parent()
    .get('.pf-v5-c-menu__content')
    .within(() => {
      cy.contains('.pf-v5-c-menu__item-text', value).parent().click();
    });
});

/** Select a value from a single select input by data-cy attribute, making sure it is not disabled or hidden */
Cypress.Commands.add('singleSelectByDataCy', (dataCy: string, value: string) => {
  cy.singleSelectBy(`[data-cy="${dataCy}"]`, value);
});

/** Select a value from a multi select input by selector, making sure it is not disabled or hidden */
Cypress.Commands.add('multiSelectBy', (selector: string, value: string) => {
  cy.getBy(selector)
    .click()
    .parent()
    .get('.pf-v5-c-menu__content')
    .within(() => {
      cy.contains('.pf-v5-c-menu__item-text', value)
        .parent()
        .within(() => {
          cy.get('input').click();
        });
    });
});

/** Select a value from a multi select input by data-cy attribute, making sure it is not disabled or hidden */
Cypress.Commands.add('multiSelectByDataCy', (dataCy: string, value: string) => {
  cy.multiSelectBy(`[data-cy="${dataCy}"]`, value);
});
