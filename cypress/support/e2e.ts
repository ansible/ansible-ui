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
    case '4101': // AWX E2E
      cy.createGlobalOrganization();
      cy.createGlobalProject();
      break;
    case '4102': {
      // HUB E2E
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

      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      // cleanup old e2e repositories
      cy.queryHubRepositories().then((response) => {
        for (const repository of response.body.results) {
          if (repository.name.startsWith('e2e_') || repository.name.startsWith('hub_e2e_')) {
            if (new Date(repository.pulp_created ?? '') < oneHourAgo) {
              cy.deleteHubRepository(repository);
            }
          }
        }
      });

      // should cleanup old e2e roles
      cy.queryHubRoles().then((response) => {
        for (const role of response.body.results) {
          if (role.name.startsWith('e2e_') || role.name.startsWith('hub_e2e_')) {
            if (new Date(role.pulp_created ?? '') < oneHourAgo) {
              cy.deleteHubRole(role);
            }
          }
        }
      });

      // cleanup old e2e remotes
      cy.queryHubRemotes().then((response) => {
        for (const remote of response.body.results) {
          if (remote.name.startsWith('e2e_') || remote.name.startsWith('hub_e2e_')) {
            if (new Date(remote.pulp_created ?? '') < oneHourAgo) {
              cy.deleteHubRemote(remote);
            }
          }
        }
      });
      break;
    }
    case '4103': // EDA E2E
      break;
  }
});

after(function () {
  const devBaseUrlPort = Cypress.config().baseUrl?.split(':').slice(-1).toString();
  switch (devBaseUrlPort) {
    case '4102': // HUB E2E
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

beforeEach(function () {
  const devBaseUrlPort = Cypress.config().baseUrl?.split(':').slice(-1).toString();
  switch (devBaseUrlPort) {
    case '4101': // AWX E2E
    case '4102': // HUB E2E
    case '4103': // EDA E2E
      // cy.visit('/'); we want this long term but it's causing issues with the current setup
      break;
    case '4201': // AWX Component
    case '4202': // HUB Component
    case '4203': // EDA Component
      break;
  }
});

Cypress.on('uncaught:exception', (_err, _runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  // fixes problems with monaco loading workers
  return false;
});

// Cypress.Keyboard.defaults({ keystrokeDelay: 0 });
