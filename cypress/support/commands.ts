/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
import '@cypress/code-coverage/support';
import { randomString } from '../../framework/utils/random-string';
import { Group, Host, Inventory } from '../../frontend/awx/interfaces/generated-from-swagger/api';
import { Organization } from '../../frontend/awx/interfaces/Organization';

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
      getByLabel(label: string | RegExp): Chainable<void>;
      clickLink(label: string | RegExp): Chainable<void>;
      clickButton(label: string | RegExp): Chainable<void>;
      clickTab(label: string | RegExp): Chainable<void>;
      navigateTo(label: string | RegExp, refresh?: boolean): Chainable<void>;
      hasTitle(label: string | RegExp): Chainable<void>;
      hasAlert(label: string | RegExp): Chainable<void>;
      clickToolbarAction(label: string | RegExp): Chainable<void>;
      clickRow(name: string | RegExp, filter?: boolean): Chainable<void>;
      getRowFromList(name: string | RegExp, filter?: boolean): Chainable<void>;
      clickRowAction(
        name: string | RegExp,
        label: string | RegExp,
        filter?: boolean
      ): Chainable<void>;
      selectRow(name: string | RegExp, filter?: boolean): Chainable<void>;
      selectRowInDialog(name: string | RegExp, filter?: boolean): Chainable<void>;
      clickPageAction(label: string | RegExp): Chainable<void>;
      typeByLabel(label: string | RegExp, text: string): Chainable<void>;
      selectByLabel(label: string | RegExp, text: string | RegExp): Chainable<void>;
      filterByText(text: string): Chainable<void>;

      requestPost<T>(url: string, data: Partial<T>): Chainable<T>;
      requestGet<T>(url: string): Chainable<T>;
      requestDelete(url: string, ignoreError?: boolean): Chainable;

      createInventoryHostGroup(
        organization: Organization
      ): Chainable<{ inventory: Inventory; host: Host; group: Group }>;
    }
  }
}

const sessionID = randomString(8);

Cypress.Commands.add('login', () => {
  cy.session(
    sessionID,
    () => {
      window.localStorage.setItem('theme', 'light');
      window.localStorage.setItem('disclaimer', 'true');

      cy.visit(`/automation-servers`, {
        retryOnStatusCodeFailure: true,
        retryOnNetworkFailure: true,
      });

      const server = Cypress.env('server')
        ? (Cypress.env('server') as string)
        : 'https://localhost:8043/';
      cy.setCookie('server', server);
      const username = Cypress.env('username') ? (Cypress.env('username') as string) : 'admin';
      const password = Cypress.env('password') ? (Cypress.env('password') as string) : 'admin';
      let serverType = 'AWX Ansible server';
      switch (Cypress.env('servertype')) {
        case 'EDA':
          serverType = 'EDA server';
          break;
      }

      cy.clickButton(/^Add automation server$/);
      cy.typeByLabel(/^Name$/, 'E2E');
      cy.typeByLabel(/^Url$/, server);
      cy.get('.pf-c-select__toggle').click();
      cy.clickButton(serverType);
      cy.get('button[type=submit]').click();

      cy.contains('a', /^E2E$/).click();
      cy.typeByLabel(/^Username$/, username);
      cy.typeByLabel(/^Password$/, password);
      cy.get('button[type=submit]').click();

      cy.contains(/^Welcome to/);
      cy.wait(2000);
    },
    { cacheAcrossSpecs: true }
  );
});

Cypress.Commands.add('getByLabel', (label: string | RegExp) => {
  cy.contains('.pf-c-form__label-text', label)
    .parent()
    .invoke('attr', 'for')
    .then((id: string | undefined) => {
      if (id) {
        cy.get('#' + id);
      }
    });
});

Cypress.Commands.add('filterByText', (text: string) => {
  cy.get('#filter-input').type(text, { delay: 0 });
  cy.get('[aria-label="apply filter"]').click();
});

Cypress.Commands.add('requestPost', function requestPost<T>(url: string, body: Partial<T>) {
  cy.getCookie('csrftoken').then((cookie) =>
    cy
      .request<T>({ method: 'POST', url, body, headers: { 'X-CSRFToken': cookie?.value } })
      .then((response) => response.body)
  );
});

Cypress.Commands.add('requestGet', function requestGet<T>(url: string) {
  return cy.request<T>({ method: 'GET', url }).then((response) => response.body);
});

Cypress.Commands.add(
  'createInventoryHostGroup',
  function createInventoryHostGroup(organization: Organization) {
    cy.requestPost<Inventory>('/api/v2/inventories/', {
      name: 'E2E Inventory ' + randomString(4),
      organization: organization.id,
    }).then((inventory) => {
      cy.requestPost<Host>('/api/v2/hosts/', {
        name: 'E2E Host ' + randomString(4),
        inventory: inventory.id,
      }).then((host) => {
        cy.requestPost<{ name: string; inventory: number }>(`/api/v2/hosts/${host.id!}/groups/`, {
          name: 'E2E Group ' + randomString(4),
          inventory: inventory.id,
        }).then((group) => ({
          inventory,
          host,
          group,
        }));
      });
    });
  }
);

Cypress.Commands.add('requestDelete', function deleteFn(url: string, ignoreError?: boolean) {
  cy.getCookie('csrftoken').then((cookie) =>
    cy.request({
      method: 'Delete',
      url,
      failOnStatusCode: ignoreError ? false : true,
      headers: { 'X-CSRFToken': cookie?.value },
    })
  );
});

Cypress.Commands.add('typeByLabel', (label: string | RegExp, text: string) => {
  cy.getByLabel(label).type(text, { delay: 0 });
});

Cypress.Commands.add('selectByLabel', (label: string | RegExp, text: string | RegExp) => {
  const parent = cy.contains('.pf-c-form__label-text', label).parent();
  parent.get('.pf-c-select__toggle').click();
  parent.clickButton(text);
});

Cypress.Commands.add('clickLink', (label: string | RegExp) => {
  cy.contains('a', label).click();
});

Cypress.Commands.add('clickTab', (label: string | RegExp) => {
  cy.contains('button[role="tab"]', label).click();
});

Cypress.Commands.add('clickButton', (label: string | RegExp) => {
  cy.contains('button:not(:disabled):not(:hidden)', label).click();
});

Cypress.Commands.add('navigateTo', (label: string | RegExp, refresh?: boolean) => {
  cy.get('#page-sidebar').then((c) => {
    if (c.hasClass('pf-m-collapsed')) {
      cy.get('#nav-toggle').click();
    }
  });
  cy.contains('.pf-c-nav__link', label).click();
  cy.get('#page-sidebar').then((c) => {
    if (!c.hasClass('pf-m-collapsed')) {
      cy.get('#nav-toggle').click();
    }
  });
  if (refresh) {
    cy.get('#refresh').click();
  }
});

Cypress.Commands.add('hasTitle', (label: string | RegExp) => {
  cy.contains('.pf-c-title', label);
});

Cypress.Commands.add('hasAlert', (label: string | RegExp) => {
  cy.contains('.pf-c-alert__title', label);
});

Cypress.Commands.add('clickToolbarAction', (label: string | RegExp) => {
  cy.get('#toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click();
});

Cypress.Commands.add('clickRow', (name: string | RegExp, filter?: boolean) => {
  if (filter !== false && typeof name === 'string') {
    cy.filterByText(name);
  }
  cy.contains('td', name).within(() => {
    cy.get('a').click();
  });
});

Cypress.Commands.add('getRowFromList', (name: string | RegExp, filter?: boolean) => {
  if (filter !== false && typeof name === 'string') {
    cy.filterByText(name);
  }
  cy.contains('tr', name);
});

Cypress.Commands.add(
  'clickRowAction',
  (name: string | RegExp, label: string | RegExp, filter?: boolean) => {
    if (filter !== false && typeof name === 'string') {
      cy.filterByText(name);
    }
    cy.contains('td', name)
      .parent()
      .within(() => {
        cy.get('.pf-c-dropdown__toggle').click();
        cy.get('.pf-c-dropdown__menu-item').contains(label).click();
      });
  }
);

Cypress.Commands.add('selectRow', (name: string | RegExp, filter?: boolean) => {
  if (filter !== false && typeof name === 'string') {
    cy.filterByText(name);
  }
  cy.contains('td', name)
    .parent()
    .within(() => {
      cy.get('input[type=checkbox]').click();
    });
});

Cypress.Commands.add('selectRowInDialog', (name: string | RegExp, filter?: boolean) => {
  if (filter !== false && typeof name === 'string') {
    cy.get('div[data-ouia-component-type="PF4/ModalContent"]').within(() => {
      cy.get('#filter-input').type(name, { delay: 0 });
    });
    cy.get('[aria-label="apply filter"]').click();
  }
  cy.contains('td', name)
    .parent()
    .within(() => {
      cy.get('input[type=checkbox]').click();
    });
});

Cypress.Commands.add('clickPageAction', (label: string | RegExp) => {
  cy.get('#toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click();
});
