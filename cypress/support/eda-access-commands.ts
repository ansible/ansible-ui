/// <reference types="cypress" />

import '@cypress/code-coverage/support';
import { randomString } from '../../framework/utils/random-string';
import { EdaUser, EdaUserCreateUpdate } from '../../frontend/eda/interfaces/EdaUser';
import { EdaTeam } from '../../frontend/eda/interfaces/EdaTeam';
import { EdaResult } from '../../frontend/eda/interfaces/EdaResult';
import { EdaOrganization } from '../../frontend/eda/interfaces/EdaOrganization';
import { edaAPI } from './formatApiPathForEDA';
import { SetOptional } from 'type-fest';

// Base create and delete commands for EDA organizations, teams, and users

Cypress.Commands.add('createEdaOrganization', () => {
  cy.requestPost<EdaOrganization>(edaAPI`/organizations/`, {
    name: 'E2E Organization ' + randomString(4),
  }).then((edaOrg) => {
    Cypress.log({
      displayName: 'EDA ORGANIZATION CREATION :',
      message: [`Created 👉  ${edaOrg.name}`],
    });
    return edaOrg;
  });
});

Cypress.Commands.add('getEdaOrganizationByName', (edaOrgName: string) => {
  cy.requestGet<EdaResult<EdaOrganization>>(edaAPI`/organizations/?name=${edaOrgName}`).then(
    (result) => {
      if (Array.isArray(result?.results) && result.results.length === 1) {
        return result.results[0];
      } else {
        return undefined;
      }
    }
  );
});

Cypress.Commands.add(
  'deleteEdaOrganization',
  (
    organization: EdaOrganization,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    cy.requestDelete(edaAPI`/organizations/${organization.id.toString()}/`, options).then(() => {
      Cypress.log({
        displayName: 'EDA ORGANIZATION DELETION :',
        message: [`Deleted 👉  ${organization.name}`],
      });
    });
  }
);

Cypress.Commands.add('createEdaTeam', () => {
  cy.requestPost<EdaTeam>(edaAPI`/teams/`, {
    name: 'E2E Team ' + randomString(4),
    organization_id: 1,
    description: 'This is a team',
  }).then((edaTeam) => {
    Cypress.log({
      displayName: 'EDA Team CREATION :',
      message: [`Created 👉  ${edaTeam.name}`],
    });
    return edaTeam;
  });
});

Cypress.Commands.add('deleteEdaTeam', (team: EdaTeam) => {
  cy.wrap(team).should('not.be.undefined');
  cy.requestDelete(edaAPI`/teams/${team.id.toString()}/`, {
    failOnStatusCode: false,
  }).then(() => {
    Cypress.log({
      displayName: 'EDA TEAM DELETION :',
      message: [`Deleted 👉  ${team.name}`],
    });
  });
});

Cypress.Commands.add(
  'createEdaUser',
  (user?: SetOptional<EdaUserCreateUpdate, 'username' | 'password'>) => {
    cy.requestPost<EdaUser, SetOptional<EdaUserCreateUpdate, 'username' | 'password'>>(
      edaAPI`/users/`,
      {
        username: `E2EUser${randomString(4)}`,
        password: `${randomString(4)}`,
        ...user,
      }
    ).then((edaUser) => {
      Cypress.log({
        displayName: 'EDA USER CREATION :',
        message: [`Created 👉  ${edaUser.username}`],
      });
      return edaUser;
    });
  }
);

Cypress.Commands.add('deleteEdaUser', (user: EdaUser) => {
  cy.wrap(user).should('not.be.undefined');
  cy.wrap(user.id).should('not.equal', 1);
  if (user.id === 1) return; // DO NOT DELETE ADMIN USER
  cy.requestDelete(edaAPI`/users/${user.id.toString()}/`, {
    failOnStatusCode: false,
  }).then(() => {
    Cypress.log({
      displayName: 'EDA USER DELETION :',
      message: [`Deleted 👉  ${user.username}`],
    });
  });
});

Cypress.Commands.add('getEdaActiveUser', () => {
  cy.requestGet<EdaResult<EdaUser>>(edaAPI`/users/me/`).then((response) => {
    if (Array.isArray(response?.results) && response?.results.length > 1) {
      Cypress.log({
        displayName: 'Username:',
        message: [response?.results[0].username],
      });
      return response?.results[0];
    } else {
      return undefined;
    }
  });
});
