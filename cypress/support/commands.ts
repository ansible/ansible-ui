/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

import '@cypress/code-coverage/support';
import {
  handleControllerDelete,
  handleControllerGet,
  handleControllerPost,
  ICollectionMockItem,
} from './mock-controller';

declare global {
  namespace Cypress {
    interface Chainable {
      getByLabel(label: string | RegExp): Chainable<void>;
      clickLink(label: string | RegExp): Chainable<void>;
      clickButton(label: string | RegExp): Chainable<void>;
      clickTab(label: string | RegExp): Chainable<void>;
      navigateTo(label: string | RegExp, refresh?: boolean): Chainable<void>;
      hasTitle(label: string | RegExp): Chainable<void>;
      clickToolbarAction(label: string | RegExp): Chainable<void>;
      clickRow(name: string | RegExp): Chainable<void>;
      clickRowAction(name: string | RegExp, label: string | RegExp): Chainable<void>;
      clickPageAction(label: string | RegExp): Chainable<void>;
      typeByLabel(label: string | RegExp, text: string): Chainable<void>;

      requestPost<T>(url: string, data: Partial<T>): Chainable<T>;
      requestGet<T>(url: string): Chainable<T>;
      requestDelete(url: string): Chainable;
    }
  }
}

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
    return cy.request({ method: 'Delete', url });
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
  cy.contains('button:not(:disabled)', label).click();
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

Cypress.Commands.add('clickToolbarAction', (label: string | RegExp) => {
  cy.get('#toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click();
});

Cypress.Commands.add('clickRow', (name: string | RegExp) => {
  cy.contains('td', name).within(() => {
    cy.get('a').click();
  });
});

Cypress.Commands.add('clickRowAction', (name: string | RegExp, label: string | RegExp) => {
  cy.contains('td', name)
    .parent()
    .within(() => {
      cy.get('.pf-c-dropdown__toggle').click();
      cy.get('.pf-c-dropdown__menu-item').contains(label).click();
    });
});

Cypress.Commands.add('clickPageAction', (label: string | RegExp) => {
  cy.get('#toggle-kebab').click().get('.pf-c-dropdown__menu-item').contains(label).click();
});
