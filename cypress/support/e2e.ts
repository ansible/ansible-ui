/// <reference types="cypress" />
// import 'cypress-axe';
import '@cypress/code-coverage/support';
import './commands';
import { createGlobalOrganization, createGlobalProject } from './global-project';

before(function () {
  const devBaseUrlPort = Cypress.config().baseUrl?.split(':').slice(-1).toString();
  if (devBaseUrlPort === '4101') {
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
