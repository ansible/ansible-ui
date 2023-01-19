/// <reference types="cypress" />
// import 'cypress-axe';
import './commands';
import { mockController } from './mock-controller';

before(() => {
  // cy.injectAxe()

  window.localStorage.setItem('theme', 'light');

  if (Cypress.env('server')) {
    const server = Cypress.env('server') ? (Cypress.env('server') as string) : 'mock';
    const username = Cypress.env('username') ? (Cypress.env('username') as string) : 'admin';
    const password = Cypress.env('password') ? (Cypress.env('password') as string) : 'password';

    Cypress.Cookies.defaults({
      preserve: ['awx_sessionid', 'useLoggedIn', 'csrftoken'],
    });

    cy.visit(`/automation-servers`, {
      retryOnStatusCodeFailure: true,
      retryOnNetworkFailure: true,
    });

    cy.clickButton(/^Add automation server$/);
    cy.typeByLabel(/^Name$/, 'Controller');
    cy.typeByLabel(/^Url$/, server);
    cy.get('button[type=submit]').click();

    cy.contains('a', /^AWX Ausible server$/).click();
    cy.typeByLabel(/^Username$/, username);
    cy.typeByLabel(/^Password$/, password);
    cy.get('button[type=submit]').click();

    cy.contains(/^Welcome to/);
  } else {
    mockController();
    cy.visit(`/controller/debug`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
  }
});

beforeEach(() => {
  window.localStorage.setItem('theme', 'light');

  if (!Cypress.env('server')) {
    mockController();
  }
});

afterEach(() => {
  // cy.checkA11y()
});
