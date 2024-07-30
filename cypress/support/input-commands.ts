Cypress.Commands.add(
  'singleSelectBy',
  (selector: string, value: string, exactMatch = false, notFound?: boolean) => {
    cy.getBy(selector).click();
    // PF Selects open the menu at the body level
    // We need to use document() to get the body of the page
    // and then find the .pf-v5-c-menu__content within that body
    // This fixes the issue where this command would fail inside a within() block
    cy.document()
      .its('body')
      .find('.pf-v5-c-menu__content')
      .within(() => {
        cy.getByDataCy('search-input').type(value);
        const regExp = new RegExp('^' + value + '$');
        if (notFound) {
          cy.contains('No results found');
        } else {
          cy.contains('.pf-v5-c-menu__item-text', exactMatch ? regExp : value)
            .parent()
            .click();
        }
      });
  }
);

Cypress.Commands.add(
  'singleSelectByDataCy',
  (dataCy: string, value: string, exactMatch = false, notFound?: boolean) => {
    cy.singleSelectBy(`[data-cy="${dataCy}"]`, value, exactMatch, notFound);
  }
);

Cypress.Commands.add('multiSelectBy', (selector: string, values: string[]) => {
  cy.getBy(selector).click();
  // PF Selects open the menu at the body level
  // We need to use document() to get the body of the page
  // and then find the .pf-v5-c-menu__content within that body
  // This fixes the issue where this command would fail inside a within() block
  cy.document()
    .its('body')
    .find('.pf-v5-c-menu__content')
    .should('have.length', 1)
    .within(() => {
      // cy.selectLoadAll();
      for (const value of values) {
        cy.getByDataCy('search-input').within(() => {
          cy.get('input').clear().type(value);
        });
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
  cy.document().then((document) => {
    const loadMore = document.body.querySelector('#load-more');
    if (loadMore) {
      cy.get('#load-more').click();
      cy.selectLoadAll();
    }
  });
});

Cypress.Commands.add('dataEditorType', (selector: string, value: string, clear?: boolean) => {
  cy.getBy(selector)
    .click()
    .focused()
    .type(clear ? '{ctrl}a' + value : value, { delay: 0 });
});

Cypress.Commands.add('dataEditorTypeByDataCy', (dataCy: string, value: string, clear?: boolean) => {
  cy.dataEditorType(`[data-cy="${dataCy}"]`, value, clear);
});
