/// <reference types="cypress" />
// import 'cypress-axe';
import '@4tw/cypress-drag-drop';
import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { HubUser } from '@ansible/hub-ui/interfaces/expanded/HubUser';
import '@cypress/code-coverage/support';
import './auth';
import './awx-access-commands';
import './awx-commands';
import './awx-user-access-commands';
import './common-commands';
import './core-commands';
import './e2e';
import './eda-access-commands';
import './eda-commands';
import { hubAPI } from './formatApiPathForHub';
import './hub-access-commands';
import './hub-commands';
import './input-commands';
import './rest-commands';
import './table-commands';

// Platform Imports
import { gatewayAPI } from './formatApiPathForPlatform';
import './platform-commands';

export const galaxykitUsername: string = `e2e_${randomString(4)}`;
export const galaxykitPassword: string = randomString(9);
export let galaxyE2EUserID: string = '';

export const SAAS_URL: string = 'aws.ansiblecloud.com';

function hubCleanup() {
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
}

before(function () {
  cy.login();
  const devBaseUrlPort = Cypress.config().baseUrl?.split(':').slice(-1).toString();
  switch (devBaseUrlPort) {
    // Platform E2E
    case '4100': {
      cy.requestPost<unknown>(gatewayAPI`/users/`, {
        username: galaxykitUsername,
        password: galaxykitPassword,
      });

      hubCleanup();
      break;
    }
    // HUB E2E
    case '4102': {
      cy.requestPost<{ id: string }, HubUser>(hubAPI`/_ui/v1/users/`, {
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

      hubCleanup();
      break;
    }
  }
});

after(function () {
  const devBaseUrlPort = Cypress.config().baseUrl?.split(':').slice(-1).toString();
  switch (devBaseUrlPort) {
    case '4100': // Platform E2E
      cy.requestDelete(gatewayAPI`/users/${galaxykitUsername}/`, { failOnStatusCode: false });
      break;
    case '4102': // HUB E2E
      cy.requestGet<HubUser>(hubAPI`/_ui/v1/users/${galaxyE2EUserID}/`).then((user) => {
        user.is_superuser = false;
        cy.requestPut(hubAPI`/_ui/v1/users/${galaxyE2EUserID}/`, user).then(() => {
          cy.requestDelete(hubAPI`/_ui/v1/users/${galaxyE2EUserID}/`, {
            failOnStatusCode: false,
          });
        });
      });
      break;
  }
});

beforeEach(function () {
  cy.login();
});

Cypress.on('uncaught:exception', (_err, _runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  // fixes problems with monaco loading workers
  return false;
});

// Cypress.Keyboard.defaults({ keystrokeDelay: 0 });
