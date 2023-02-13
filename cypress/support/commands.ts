/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
import '@cypress/code-coverage/support';
import { randomString } from '../../framework/utils/random-string';
import {
  handleControllerDelete,
  handleControllerGet,
  handleControllerPost,
  ICollectionMockItem,
  mockController,
} from './mock-controller';

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
      clickRowAction(
        name: string | RegExp,
        label: string | RegExp,
        filter?: boolean
      ): Chainable<void>;
      selectRow(name: string | RegExp, filter?: boolean): Chainable<void>;
      clickPageAction(label: string | RegExp): Chainable<void>;
      typeByLabel(label: string | RegExp, text: string): Chainable<void>;
      filterByText(text: string): Chainable<void>;

      requestPost<T>(url: string, data: Partial<T>): Chainable<T>;
      requestGet<T>(url: string): Chainable<T>;
      requestDelete(url: string): Chainable;
    }
  }
}

const sessionID = randomString(8);

Cypress.Commands.add('login', () => {
  cy.session(
    sessionID,
    () => {
      window.localStorage.setItem('theme', 'light');

      cy.visit(`/automation-servers`, {
        retryOnStatusCodeFailure: true,
        retryOnNetworkFailure: true,
      });

      if (Cypress.env('server')) {
        const server = Cypress.env('server') ? (Cypress.env('server') as string) : 'mock';
        const username = Cypress.env('username') ? (Cypress.env('username') as string) : 'admin';
        const password = Cypress.env('password') ? (Cypress.env('password') as string) : 'password';

        cy.clickButton(/^Add automation server$/);
        cy.typeByLabel(/^Name$/, 'Controller');
        cy.typeByLabel(/^Url$/, server);
        cy.get('.pf-c-select__toggle').click();
        cy.clickButton('AWX Ansible server');
        cy.get('button[type=submit]').click();

        cy.contains('a', /^Controller$/).click();
        cy.typeByLabel(/^Username$/, username);
        cy.typeByLabel(/^Password$/, password);
        cy.get('button[type=submit]').click();

        cy.contains(/^Welcome to/);
        cy.wait(2000);
      }
    },
    { cacheAcrossSpecs: true }
  );

  if (!Cypress.env('server')) {
    mockController();
  }
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
  if (!Cypress.env('server')) {
    return cy.wrap<T>(handleControllerPost(url, body as unknown as ICollectionMockItem) as T);
  } else {
    cy.setCookie('server', Cypress.env('server') as string);
    return cy.request<T>({ method: 'POST', url, body }).then((response) => response.body);
  }
});

Cypress.Commands.add('requestGet', function requestGet<T>(url: string) {
  if (!Cypress.env('server')) {
    return cy.wrap<T>(handleControllerGet(url) as T);
  } else {
    cy.setCookie('server', Cypress.env('server') as string);
    return cy.request<T>({ method: 'GET', url }).then((response) => response.body);
  }
});

Cypress.Commands.add('requestDelete', function deleteFn(url: string) {
  if (!Cypress.env('server')) {
    return cy.wrap(handleControllerDelete(url));
  } else {
    cy.setCookie('server', Cypress.env('server') as string);
    return cy.request({ method: 'Delete', url, failOnStatusCode: false });
  }
});

Cypress.Commands.add('typeByLabel', (label: string | RegExp, text: string) => {
  cy.getByLabel(label).type(text, { delay: 0 });
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

Cypress.Commands.add('clickPageAction', (label: string | RegExp) => {
  cy.get('#toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click();
});
