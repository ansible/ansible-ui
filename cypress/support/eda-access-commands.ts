/// <reference types="cypress" />

import '@cypress/code-coverage/support';
import { randomString } from '../../framework/utils/random-string';
import { EdaUser, EdaUserCreateUpdate } from '../../frontend/eda/interfaces/EdaUser';
import { EdaTeam } from '../../frontend/eda/interfaces/EdaTeam';
import { EdaResult } from '../../frontend/eda/interfaces/EdaResult';
import { EdaOrganization } from '../../frontend/eda/interfaces/EdaOrganization';
import { edaAPI } from './formatApiPathForEDA';
import { SetOptional } from 'type-fest';
import { PlatformOrganization } from '../../platform/interfaces/PlatformOrganization';

// Base create and delete commands for EDA organizations, teams, and users
Cypress.Commands.add('createEdaOrganization', () => {
  const platformOrg: Partial<PlatformOrganization> = {
    name: 'E2E Organization ' + randomString(4),
  };
  cy.createPlatformOrganization(platformOrg).then((platformOrg) => {
    cy.getEdaOrgByAnsibleId(platformOrg.summary_fields.resource?.ansible_id);
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
    cy.getPlatformOrgByAnsibleId(organization?.resource?.ansible_id as string).then((platformOrg) =>
      cy.deletePlatformOrganization(platformOrg, options)
    );
  }
);

Cypress.Commands.add('createEdaTeam', () => {
  cy.createPlatformTeam({
    name: 'E2E Team ' + randomString(4),
    description: 'This is a team',
    organization: 1, // Use default organization
  }).then((platformTeam) =>
    // Retrieve the created team from EDA
    cy.getEdaTeamByAnsibleId(platformTeam.summary_fields.resource.ansible_id)
  );
});

Cypress.Commands.add('deleteEdaTeam', (team: EdaTeam) => {
  cy.wrap(team).should('not.be.undefined');
  cy.getPlatformTeamByAnsibleId(team?.resource?.ansible_id as string).then((platformTeam) =>
    cy.deletePlatformTeam(platformTeam, {
      failOnStatusCode: false,
    })
  );
});

Cypress.Commands.add(
  'createEdaUser',
  (user?: SetOptional<EdaUserCreateUpdate, 'username' | 'password'>) => {
    cy.createPlatformUser({
      username: `E2EUser${randomString(4)}`,
      password: `${randomString(4)}`,
      ...user,
    }).then((platformUser) => {
      // Retrieve the created user from EDA
      cy.getEdaUserByAnsibleId(platformUser.summary_fields.resource.ansible_id);
    });
  }
);

Cypress.Commands.add('deleteEdaUser', (user: EdaUser) => {
  cy.wrap(user).should('not.be.undefined');
  cy.wrap(user.id).should('not.equal', 1);
  if (user.id === 1) return; // DO NOT DELETE ADMIN USER
  cy.getPlatformUserByAnsibleId(user?.resource?.ansible_id as string).then((platformUser) =>
    cy.deletePlatformUser(platformUser, {
      failOnStatusCode: false,
    })
  );
});

Cypress.Commands.add('getEdaActiveUser', () => {
  cy.getCurrentPlatformUser().then((currentUser) =>
    cy.getEdaUserByAnsibleId(currentUser.summary_fields.resource.ansible_id)
  );
});
