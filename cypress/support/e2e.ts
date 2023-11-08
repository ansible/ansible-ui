/// <reference types="cypress" />
// import 'cypress-axe';
import '@cypress/code-coverage/support';
import './commands';
import { createGlobalOrganization, createGlobalProject } from './global-project';

before(function () {
  let splitLocalhost;
  const devBaseUrlPort = Cypress.config().baseUrl?.split(':').slice(-1).toString();
  const baseUrl = Cypress.config().baseUrl;
  let localhost;
  // Assuming baseUrl = "https://localhost.com"
  if (baseUrl) {
    const splitUrl = baseUrl.split('.');
    if (splitUrl.length >= 4) {
      localhost = splitUrl[splitUrl.length - 4];
      cy.log('LOCALHOST', localhost); // Output: "localhost"
    } else {
      cy.log('The URL might not contain the expected segments.');
    }
  } else {
    cy.log('Base URL is not defined.');
  }
  if (localhost) {
    splitLocalhost = localhost.split('/').slice(-1).toString();
  }

  if (devBaseUrlPort === '4101' || splitLocalhost !== 'localhost') {
    //if port is 4101 or if localhost does not appear in baseurl
    createGlobalOrganization();
    createGlobalProject();
  }
});

// AWX E2E Port: 4101
// AWX Component Port: 4201
// HUB E2E Port: 4102
// HUB Component Port: 4202
// EDA E2E Port: 4103
// EDA Component Port: 4203

Cypress.on('uncaught:exception', (_err, _runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  // fixes problems with monaco loading workers
  return false;
});
