// import 'cypress-axe';
import './commands';
import { mockController } from './mock-controller';

before(() => {
  window.localStorage.setItem('access', 'true');
  window.localStorage.setItem('theme', 'light');

  if (Cypress.env('mock')) {
    mockController();
  }

  cy.visit(`/controller/debug`);
  // cy.injectAxe()

  // cy.visit(`/login`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true })
  // cy.get('#server').type('https://localhost:8043')
  // cy.get('#username').type('test')
  // cy.get('#password').type('test')
  // cy.get('button[type=submit]').click()

  // Cypress.Cookies.preserveOnce(names...)

  // Cypress.Cookies.defaults({
  //     preserve: ['_csrf', '_oauth_proxy', 'acm-access-token-cookie'],
  // })
  // cy.login()
  // cy.visit(`/`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true })
  // cy.get('.pf-c-page__main').contains('Red Hat', { timeout: 5 * 60 * 1000 })
});

beforeEach(() => {
  window.localStorage.setItem('access', 'true');
  window.localStorage.setItem('theme', 'light');

  if (Cypress.env('mock')) {
    mockController();
  }
});

afterEach(() => {
  // cy.checkA11y()
});
