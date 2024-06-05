import '@cypress/code-coverage/support';

Cypress.Commands.add('searchAndDisplayResource', (resourceName: string) => {
  //Note: this command won't work for Hub filtering
  cy.get('[data-cy="text-input"]')
    .find('input')
    .type(resourceName)
    .then(() => {
      cy.get('[data-cy="apply-filter"]:not(:disabled):not(:hidden)').click();
    });
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

Cypress.Commands.add(
  'filterTableByText',
  (text: string, variant: 'SingleText' | 'MultiText' = 'MultiText') => {
    cy.get('[data-cy="text-input"]')
      .should('be.visible')
      .within(() => {
        cy.get('input').clear().type(text, { delay: 0 });
      });
    if (variant === 'MultiText') {
      cy.getByDataCy('apply-filter').click();
    }
    cy.contains('.pf-v5-c-chip__text', text);
  }
);

Cypress.Commands.add('filterTableBySingleText', (text: string, disableWait?: boolean) => {
  cy.filterTableByText(text, 'SingleText');
  // TODO - this should be in future better sync, but for now, we need to have tests more stable
  if (disableWait !== true) {
    cy.wait(3000);
  }
});

Cypress.Commands.add('filterTableByTypeAndText', (filterLabel: string | RegExp, text: string) => {
  cy.selectToolbarFilterByLabel(filterLabel);
  cy.filterTableByText(text);
});

Cypress.Commands.add(
  'filterTableByTypeAndSingleText',
  (filterLabel: string | RegExp, text: string) => {
    cy.selectToolbarFilterByLabel(filterLabel);
    cy.filterTableByText(text, 'SingleText');
  }
);

Cypress.Commands.add('clearAllFilters', () => {
  cy.get('button').then((buttons) => {
    for (let i = 0; i <= buttons.length; i++) {
      const button = buttons[i];
      if (button?.innerText === 'Clear all filters') {
        button.click();
      }
    }
  });
});

Cypress.Commands.add(
  'filterBySingleSelection',
  (filterType: RegExp | string, selectLabel: RegExp | string) => {
    cy.selectToolbarFilterByLabel(filterType);
    cy.get('#filter-input').click();
    cy.get('#filter-input-select').within(() => {
      cy.contains(selectLabel).click();
    });
  }
);

Cypress.Commands.add(
  'filterByMultiSelection',
  (filterType: RegExp | string, selectLabel: RegExp | string) => {
    cy.selectToolbarFilterByLabel(filterType);
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

Cypress.Commands.add('clickTableHeader', (text: string | RegExp) => {
  cy.get('thead').find('th').contains(text).click();
});

Cypress.Commands.add('getModal', () => {
  cy.get('[data-ouia-component-type="PF5/ModalContent"]');
});

Cypress.Commands.add('getWizard', () => {
  cy.get('[data-cy="wizard"]');
});

Cypress.Commands.add(
  'verifyReviewStepWizardDetails',
  (section: string, itemsList: string[], itemCount: string) => {
    cy.get(`[data-cy="expandable-section-${section}"]`).within(() => {
      cy.get('tbody td')
        .should('be.visible')
        .and(($td) => {
          expect($td).to.have.length(itemsList.length);
        })
        .each((el) => {
          cy.wrap(el)
            .invoke('text')
            .then((text) => {
              expect(itemsList).to.include(text.trim());
            });
        });
      cy.get('.pf-v5-c-badge').should('have.text', itemCount);
    });
  }
);

Cypress.Commands.add('poll', function requestPoll<
  ResponseT,
>(fn: () => Cypress.Chainable<ResponseT | undefined>, check: (response: ResponseT) => boolean, calledTimes?: number) {
  fn().then((response) => {
    if (response !== undefined && check(response)) {
      cy.wrap(response);
    } else {
      // call only 100 times, then fail
      const watchDog = (calledTimes || 0) + 1;
      if (watchDog <= 100) {
        cy.log('Calling cy.poll again for the ' + watchDog + ' time');
        cy.wait(1000).then(() => cy.poll<ResponseT>(fn, check, watchDog));
      } else {
        throw new Error('Explicitly failing this test due to cy.poll not found what it expected.');
      }
    }
  });
});
