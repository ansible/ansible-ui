/// <reference types="cypress" />
// import 'cypress-axe';
import './commands';
import { mockController } from './mock-controller';

before(() => {
  const server = Cypress.env('server') ? (Cypress.env('server') as string) : 'mock';
  const username = Cypress.env('username') ? (Cypress.env('username') as string) : 'admin';
  const password = Cypress.env('password') ? (Cypress.env('password') as string) : 'password';

  // cy.injectAxe()

  Cypress.Cookies.defaults({
    preserve: ['awx_sessionid', 'useLoggedIn', 'csrftoken'],
  });

  window.localStorage.setItem('access', 'true');
  window.localStorage.setItem('theme', 'light');

  if (!Cypress.env('server')) {
    mockController();
  }

  cy.visit(`/automation-servers`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });

  cy.clickButton(/^Add automation server$/);
  cy.typeByLabel(/^Name$/, 'Controller');
  cy.typeByLabel(/^Url$/, server);
  cy.get('button[type=submit]').click();

  cy.contains('a', /^Controller$/).click();
  cy.typeByLabel(/^Username$/, username);
  cy.typeByLabel(/^Password$/, password);
  cy.get('button[type=submit]').click();

  cy.contains(/^Welcome to Automation Controller$/);

  // Cypress.Cookies.

  // Cypress.Cookies.defaults({
  //     preserve: ['_csrf', '_oauth_proxy', 'acm-access-token-cookie'],
  // })
});

beforeEach(() => {
  window.localStorage.setItem('access', 'true');
  window.localStorage.setItem('theme', 'light');

  if (!Cypress.env('server')) {
    mockController();
  }
});

afterEach(() => {
  // cy.checkA11y()
});
