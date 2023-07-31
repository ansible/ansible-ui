import '@cypress/code-coverage/support';

Cypress.Commands.add('getFiltersToolbarItem', () => {
  cy.get('#filter').parent().parent().parent();
});

Cypress.Commands.add('openToolbarFilterTypeSelect', () => {
  cy.getFiltersToolbarItem().within(() => {
    cy.get('#filter').click().parent().get('.pf-c-menu');
  });
});

Cypress.Commands.add('selectToolbarFilterType', (text: string | RegExp) => {
  cy.openToolbarFilterTypeSelect().within(() => {
    cy.clickButton(text);
  });
});

Cypress.Commands.add('filterTableByText', (text: string) => {
  cy.get('#filter-input').within(() => {
    cy.get('input').clear().type(text, { delay: 0 });
  });
  cy.get('[aria-label="apply filter"]').click();
});

Cypress.Commands.add('filterTableByTypeAndText', (filterLabel: string | RegExp, text: string) => {
  cy.selectToolbarFilterType(filterLabel);
  cy.filterTableByText(text);
});

Cypress.Commands.add(
  'filterBySingleSelection',
  (filterType: RegExp | string, selectLabel: RegExp | string) => {
    cy.selectToolbarFilterType(filterType);
    cy.getFiltersToolbarItem().within(() => {
      cy.get('.pf-c-select').click();
      cy.contains(selectLabel).click();
    });
  }
);

Cypress.Commands.add(
  'filterByMultiSelection',
  (filterType: RegExp | string, selectLabel: RegExp | string) => {
    cy.selectToolbarFilterType(filterType);
    cy.getFiltersToolbarItem().within(() => {
      cy.get('.pf-c-select').click();
      cy.contains(selectLabel).click();
    });
    cy.get('tbody').click();
  }
);

Cypress.Commands.add(
  'singleSelectShouldHaveSelectedOption',
  (selector: string, label: string | RegExp) => {
    cy.get(selector).within(() => {
      cy.get('.pf-c-menu-toggle__text').should('have.text', label);
    });
  }
);

Cypress.Commands.add(
  'singleSelectShouldContainOption',
  (selector: string, label: string | RegExp) => {
    cy.get(selector).click();
    cy.get(selector)
      .parent()
      .get('.pf-c-menu__content')
      .within(() => {
        cy.contains('.pf-c-menu__item-text', label).should('contain.text', label);
      });
    cy.get(selector).click();
  }
);

Cypress.Commands.add('selectSingleSelectOption', (selector: string, label: string | RegExp) => {
  cy.get(selector).click();
  cy.get(selector)
    .parent()
    .get('.pf-c-menu__content')
    .within(() => {
      cy.contains('.pf-c-menu__item-text', label).parent().click();
    });
});
