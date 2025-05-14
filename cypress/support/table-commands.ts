Cypress.Commands.add(
  'setTableView',
  (
    view: 'table' | 'list' | 'card',
    options?: {
      ignoreNotFound?: boolean;
    }
  ) => {
    cy.getByDataCy('table-view-toggle').should('exist');
    if (options?.ignoreNotFound) {
      cy.get('button').then((jqueryResult) => {
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
  cy.getBy('#filter').click();
  // PF Selects open the menu at the body level
  // We need to use document() to get the body of the page
  // and then find the filter-select within that body
  // This fixes the issue where this command would fail inside a within() block
  cy.document().its('body').find('#filter-search').type(dataCy.replaceAll('-', ' '));
  cy.document()
    .its('body')
    .find('#filter-select', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.getByDataCy(dataCy).click();
    });
});

Cypress.Commands.add('selectToolbarFilterByLabel', (text: string | RegExp) => {
  cy.openToolbarFilterTypeSelect().within(() => {
    cy.clickButton(text);
  });
});

Cypress.Commands.add(
  'filterTableByTextFilter',
  (filterDataCy: string, text: string, options?: { disableFilterSelection?: boolean }) => {
    if (!options?.disableFilterSelection) {
      cy.selectTableFilter(filterDataCy);
    }
    cy.get('#filters').within(() => {
      cy.get('#filter-input').within(() => {
        cy.get('input').clear().type(text, { delay: 0 });
      });
      // cy.getByDataCy('apply-filter').click();
      // FIXME: sometimes it gets filter all over again and breaks the search
      // Only click the apply filter if it is a multi text filter
      cy.get('button').then((jqueryResult) => {
        for (let i = 0; i < jqueryResult.length; i++) {
          if (jqueryResult[i].getAttribute('data-cy') === 'apply-filter') {
            jqueryResult[i].click();
            break; // FIXME: it doesn't work and clicks again in the filter field
          }
        }
      });
    });
    // Wait for the chip to show up
    // This handles the debounce of the single text filter
    cy.contains('.pf-v5-c-chip__text', text);
  }
);

Cypress.Commands.add(
  'filterTableBySingleSelect',
  (filterDataCy: string, optionLabel: string, notFound?: boolean) => {
    cy.selectTableFilter(filterDataCy);
    notFound = notFound ? true : false;
    cy.singleSelectByDataCy('filter-input', optionLabel, false, notFound);
  }
);

Cypress.Commands.add('filterTableBySearch', (searchString: string) => {
  cy.selectTableFilter('search');

  cy.get('[data-cy="text-input"]', { timeout: 10000 })
    .should('be.visible')
    .then(($input) => {
      cy.wrap($input).clear().type(searchString);
    });
});

Cypress.Commands.add('filterTableById', (idString: string) => {
  cy.selectTableFilter('id');
  cy.get('#filters').within(() => {
    cy.contains('button', 'Select id').click();
  });
  cy.get('[data-cy="search-input"]').within(() => {
    cy.get('input').clear().type(idString);
  });
  cy.get(`li[data-cy="${idString}"]`).find('input').click();
});

Cypress.Commands.add(
  'getTableRow',
  (
    columnDataCy: string,
    text: string,
    options?: { disableFilter?: boolean; disableFilterSelection?: boolean }
  ) => {
    if (options?.disableFilter !== true) {
      cy.filterTableByTextFilter(columnDataCy, text, {
        disableFilterSelection: options?.disableFilterSelection,
      });
    }
    if (columnDataCy === 'id') {
      cy.contains(`[data-cy="row-id-${text}"]`, text).parents('tbody');
    } else {
      cy.contains(`[data-cy="${columnDataCy}-column-cell"]`, text).parents('tr');
    }
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

Cypress.Commands.add('clickKebabAction', (actionDataCy: string) => {
  cy.getBy(`[data-cy="actions-dropdown"]`);
  // cy.get('ul', { timeout: 10000 }).within(() => {
  cy.get(`[data-cy="${actionDataCy}"]`).click();
  // });
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
        cy.getBy(`[data-cy="actions-dropdown"]`).click();
      });
    });
    if (options?.inKebab) {
      cy.clickKebabAction(actionDataCy);
    } else {
      cy.getByDataCy(actionDataCy).click();
    }
  }
);

Cypress.Commands.add(
  'selectTableRowByCheckbox',
  (
    columnDataCy: string,
    text: string,
    options?: { disableFilter?: boolean; disableFilterSelection?: boolean }
  ) => {
    cy.getTableRow(columnDataCy, text, options).within(() => {
      cy.get('[data-cy="checkbox-column-cell"]').within(() => {
        cy.getBy('input').click();
      });
    });
  }
);

Cypress.Commands.add('checkValueByHeaderName', (headerName, expectedValue) => {
  cy.contains('dt', headerName)
    .next('dd')
    .invoke('text')
    .then((text) => {
      expect(text.trim()).to.equal(expectedValue);
    });
});
