Cypress.Commands.add(
  'setTableView',
  (
    view: 'table' | 'list' | 'cards',
    options?: {
      ignoreNotFound?: boolean;
    }
  ) => {
    cy.get('table').should('exist');
    if (options?.ignoreNotFound) {
      cy.get('button').then((jqueryResult) => {
        if (jqueryResult.length === 0) {
          return;
        }

        if (jqueryResult.length === 1) {
          if (jqueryResult[0].getAttribute('data-cy') === `${view}-view`) {
            jqueryResult[0].click();
          }
          return;
        }

        for (let i = 0; i < jqueryResult.length; i++) {
          if (jqueryResult[i].getAttribute('data-cy') === `${view}-view`) {
            jqueryResult[i].click();
            break;
          }
        }
      });
    } else {
      cy.getByDataCy(`${view}-view`).within(() => {
        cy.get('button').click();
      });
    }
  }
);

Cypress.Commands.add('setTablePageSize', (text: string) => {
  cy.get('[data-cy="pagination"]')
    .first()
    .within(() => {
      cy.get('#options-menu-bottom-toggle').click();
      cy.contains('button', `${text} per page`).click();
    });
});

Cypress.Commands.add('selectTableFilter', (dataCy: string) => {
  cy.get('#filter').click();
  // PF Selects open the menu at the body level
  // We need to use document() to get the body of the page
  // and then find the filter-select within that body
  // This fixes the issue where this command would fail inside a within() block
  cy.document()
    .its('body')
    .find('#filter-select')
    .within(() => {
      cy.getByDataCy(dataCy).click();
    });
});

Cypress.Commands.add('selectToolbarFilterByLabel', (text: string | RegExp) => {
  cy.openToolbarFilterTypeSelect().within(() => {
    cy.clickButton(text);
  });
});

Cypress.Commands.add('filterTableByTextFilter', (filterDataCy: string, text: string) => {
  cy.selectTableFilter(filterDataCy);
  cy.get('#filters').within(() => {
    cy.get('#filter-input').within(() => {
      cy.get('input').clear().type(text, { delay: 0 });
    });
    // Only click the apply filter if it is a multi text filter
    cy.get('[data-cy="apply-filter"]').then((jqueryResult) => {
      if (jqueryResult.length === 1 && jqueryResult[0].tagName === 'BUTTON') {
        jqueryResult[0].click();
      }
    });
  });

  // Wait for the chip to show up
  // This handles the debounce of the single text filter
  cy.contains('.pf-v5-c-chip__text', text);
});

Cypress.Commands.add('filterTableBySingleSelect', (filterDataCy: string, optionLabel: string) => {
  cy.selectTableFilter(filterDataCy);
  cy.get('.pf-v5-c-menu__content').within(() => {
    cy.contains('.pf-v5-c-menu__item-text', optionLabel).click();
  });
});

Cypress.Commands.add('filterTableByMultiSelect', (filterDataCy: string, optionLabels: string[]) => {
  cy.selectTableFilter(filterDataCy);
  cy.get('.pf-v5-c-menu__content').within(() => {
    for (const optionLabel of optionLabels) {
      cy.contains('.pf-v5-c-menu__item-text', optionLabel).click();
    }
  });
  cy.get('.pf-v5-c-menu__content').click('topRight');
});

Cypress.Commands.add(
  'getTableRow',
  (columnDataCy: string, text: string, options?: { disableFilter?: boolean }) => {
    if (options?.disableFilter !== true) {
      cy.filterTableByTextFilter(columnDataCy, text);
    }
    cy.contains(`[data-cy="${columnDataCy}-column-cell"]`, text).parents('tr');
  }
);

Cypress.Commands.add(
  'getTableCell',
  (cellDataCy: string, text: string, options?: { disableFilter?: boolean }) => {
    if (options?.disableFilter !== true) {
      cy.filterTableByTextFilter(cellDataCy, text);
    }
    cy.contains(`[data-cy='${cellDataCy}-column-cell']`, text);
  }
);

Cypress.Commands.add(
  'clickTableRowLink',
  (columnDataCy: string, text: string, options?: { disableFilter?: boolean }) => {
    cy.getTableCell(columnDataCy, text, options).within(() => {
      cy.get('a').click();
    });
  }
);

Cypress.Commands.add('clickKebabAction', (kebabDataCy: string, actionDataCy: string) => {
  cy.getByDataCy(kebabDataCy).click();
  cy.getByDataCy(actionDataCy).click();
});

Cypress.Commands.add(
  'clickTableRowAction',
  (
    columnDataCy: string,
    text: string,
    actionDataCy: string,
    options?: {
      inKebab?: boolean;
      disableFilter?: boolean;
    }
  ) => {
    cy.getTableRow(columnDataCy, text, options).within(() => {
      cy.get(`[data-cy="actions-column-cell"]`).within(() => {
        if (options?.inKebab) {
          cy.clickKebabAction('actions-dropdown', actionDataCy);
        } else {
          cy.getByDataCy(actionDataCy).click();
        }
      });
    });
  }
);

Cypress.Commands.add(
  'selectTableRowNew',
  (columnDataCy: string, text: string, options?: { disableFilter?: boolean }) => {
    cy.getTableRow(columnDataCy, text, options).within(() => {
      cy.get('[data-cy="checkbox-column-cell"]').within(() => {
        cy.get('input').click();
      });
    });
  }
);
