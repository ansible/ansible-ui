Cypress.Commands.add('singleSelectBy', (selector: string, value: string) => {
  cy.getBy(selector).click();
  // PF Selects open the menu at the body level
  // We need to use document() to get the body of the page
  // and then find the .pf-v5-c-menu__content within that body
  // This fixes the issue where this command would fail inside a within() block
  cy.document()
    .its('body')
    .find('.pf-v5-c-menu__content')
    .within(() => {
      cy.selectLoadAll();
      cy.getByDataCy('search-input').type(value);
      cy.contains('.pf-v5-c-menu__item-text', value).parent().click();
    });
});

Cypress.Commands.add('singleSelectByDataCy', (dataCy: string, value: string) => {
  cy.singleSelectBy(`[data-cy="${dataCy}"]`, value);
});

Cypress.Commands.add('multiSelectBy', (selector: string, values: string[]) => {
  cy.getBy(selector).click();
  // PF Selects open the menu at the body level
  // We need to use document() to get the body of the page
  // and then find the .pf-v5-c-menu__content within that body
  // This fixes the issue where this command would fail inside a within() block
  cy.document()
    .its('body')
    .find('.pf-v5-c-menu__content')
    .within(() => {
      cy.selectLoadAll();
      for (const value of values) {
        cy.getByDataCy('search-input').clear().type(value);
        cy.contains('.pf-v5-c-menu__item-text', value)
          .parent()
          .within(() => {
            cy.get('input').click();
          });
      }
    });
});

Cypress.Commands.add('multiSelectByDataCy', (dataCy: string, values: string[]) => {
  cy.multiSelectBy(`[data-cy="${dataCy}"]`, values);
});

Cypress.Commands.add('selectLoadAll', () => {
  cy.get('#loading').should('not.exist');
  cy.get('button').then((buttons) => {
    for (let i = 0; i <= buttons.length; i++) {
      const button = buttons[i];
      if (button?.innerText === 'Load more') {
        button.click();
        cy.selectLoadAll();
      }
    }
  });
});
