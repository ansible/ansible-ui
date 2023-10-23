import '@cypress/code-coverage/support';

Cypress.Commands.add('searchAndDisplayResource', (resourceName: string) => {
  cy.get('[data-cy="text-input"]')
    .find('input')
    .type(resourceName)
    .then(() => {
      cy.get('[data-cy="apply-filter"]').click();
    });
});

Cypress.Commands.add('getFiltersToolbarItem', () => {
  cy.get('#filter').parent().parent().parent().parent();
});

Cypress.Commands.add('getListRowByText', (name: string | RegExp, filter?: boolean) => {
  if (filter !== false && typeof name === 'string') {
    cy.filterTableByText(name);
  }
  cy.contains('li', name);
});

Cypress.Commands.add('openToolbarFilterTypeSelect', () => {
  cy.get('#filter').click();
  cy.get('#filter-select');
});

Cypress.Commands.add('selectToolbarFilterType', (text: string | RegExp) => {
  cy.openToolbarFilterTypeSelect().within(() => {
    cy.clickButton(text);
  });
});

Cypress.Commands.add('filterTableByText', (text: string) => {
  cy.get('[data-cy="text-input"]').within(() => {
    cy.get('input').clear().type(text, { delay: 0 });
  });
  cy.get('[data-cy="apply-filter"]').click();
});

Cypress.Commands.add('filterTableByTypeAndText', (filterLabel: string | RegExp, text: string) => {
  cy.selectToolbarFilterType(filterLabel);
  cy.filterTableByText(text);
});

Cypress.Commands.add(
  'filterBySingleSelection',
  (filterType: RegExp | string, selectLabel: RegExp | string) => {
    cy.selectToolbarFilterType(filterType);
    cy.get('#filter-input').click();
    cy.get('#filter-input-select').within(() => {
      cy.contains(selectLabel).click();
    });
  }
);

Cypress.Commands.add(
  'filterByMultiSelection',
  (filterType: RegExp | string, selectLabel: RegExp | string) => {
    cy.selectToolbarFilterType(filterType);
    cy.get('#filter-input').click();
    cy.get('#filter-input-select').within(() => {
      cy.contains(selectLabel).click();
    });
    cy.get('tbody').click();
  }
);

Cypress.Commands.add(
  'singleSelectShouldHaveSelectedOption',
  (selector: string, label: string | RegExp) => {
    cy.get(selector).within(() => {
      cy.get('.pf-v5-c-menu-toggle__text').should('have.text', label);
    });
  }
);

Cypress.Commands.add(
  'multiSelectShouldHaveSelectedOption',
  (selector: string, label: string | RegExp) => {
    cy.get(selector).within(() => {
      cy.contains('.pf-v5-c-chip__text', label).should('have.text', label);
    });
  }
);

Cypress.Commands.add(
  'multiSelectShouldNotHaveSelectedOption',
  (selector: string, label: string | RegExp) => {
    cy.get(selector).within(() => {
      cy.contains('.pf-v5-c-chip__text', label).should('not.exist');
    });
  }
);

Cypress.Commands.add(
  'singleSelectShouldContainOption',
  (selector: string, label: string | RegExp) => {
    cy.get(selector).click();
    cy.get(selector)
      .parent()
      .get('.pf-v5-c-menu__content')
      .within(() => {
        cy.contains('.pf-v5-c-menu__item-text', label).should('contain.text', label);
      });
    cy.get(selector).click();
  }
);

Cypress.Commands.add('selectSingleSelectOption', (selector: string, label: string | RegExp) => {
  cy.get(selector).click();
  cy.get(selector)
    .parent()
    .get('.pf-v5-c-menu__content')
    .within(() => {
      cy.contains('.pf-v5-c-menu__item-text', label).parent().click();
    });
});

Cypress.Commands.add('selectMultiSelectOption', (selector: string, label: string | RegExp) => {
  cy.get(selector)
    .parent()
    .get('.pf-v5-c-menu__content')
    .within(() => {
      cy.contains('.pf-v5-c-menu__item-text', label)
        .parent()
        .within(() => {
          cy.get('input').click();
        });
    });
});
