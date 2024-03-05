/// <reference types="cypress" />
// import 'cypress-axe';
import '@4tw/cypress-drag-drop';
import '@cypress/code-coverage/support';
import { randomString } from '../../framework/utils/random-string';
import { HubUser } from '../../frontend/hub/interfaces/expanded/HubUser';
import './auth';
import './awx-commands';
import './awx-user-access-commands';
import './common-commands';
import './core-commands';
import './e2e';
import './eda-commands';
import { hubAPI } from './formatApiPathForHub';
import './hub-commands';
import './input-commands';
import './rest-commands';
import './table-commands';

export const galaxykitUsername: string = `e2e_${randomString(4)}`;
export const galaxykitPassword: string = randomString(9);
export let galaxyE2EUserID: number;

before(function () {
  const devBaseUrlPort = Cypress.config().baseUrl?.split(':').slice(-1).toString();
  switch (devBaseUrlPort) {
    case '4101': // AWX
      cy.createGlobalOrganization();
      cy.createGlobalProject();
      break;
    case '4102': // HUB
      cy.hubLogin();
      cy.requestPost<{ id: number }, HubUser>(hubAPI`/_ui/v1/users/`, {
        username: galaxykitUsername,
        first_name: '',
        last_name: '',
        email: '',
        password: galaxykitPassword,
        groups: [],
        is_superuser: true,
      }).then((response) => {
        galaxyE2EUserID = response.id;
      });
  }
});

after(function () {
  const devBaseUrlPort = Cypress.config().baseUrl?.split(':').slice(-1).toString();
  switch (devBaseUrlPort) {
    case '4102': // HUB
      cy.requestGet<HubUser>(hubAPI`/_ui/v1/users/${galaxyE2EUserID.toString()}/`).then((user) => {
        user.is_superuser = false;
        cy.requestPut(hubAPI`/_ui/v1/users/${galaxyE2EUserID.toString()}/`, user).then(() => {
          cy.requestDelete(hubAPI`/_ui/v1/users/${galaxyE2EUserID.toString()}/`, {
            failOnStatusCode: false,
          });
        });
      });
      break;
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

// Cypress.Keyboard.defaults({ keystrokeDelay: 0 });
