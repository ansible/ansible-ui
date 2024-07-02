/// <reference types="cypress" />

import '@cypress/code-coverage/support';
import { randomString } from '../../framework/utils/random-string';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Team } from '../../frontend/awx/interfaces/Team';
import { AwxUser } from '../../frontend/awx/interfaces/User';
import { awxAPI } from './formatApiPathForAwx';

// Base create and delete commands for AWX organizations, teams, and users

Cypress.Commands.add('createAwxOrganization', (orgName?: string, failOnStatusCode?: boolean) => {
  cy.requestPost<Pick<Organization, 'name'>, Organization>(
    awxAPI`/organizations/`,
    { name: orgName ? orgName : 'E2E Organization ' + randomString(4) },
    failOnStatusCode
  );
});

Cypress.Commands.add(
  'deleteAwxOrganization',
  (
    organization: Organization,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (!organization?.id) return;
    cy.requestDelete(awxAPI`/organizations/${organization?.id.toString()}/`, options);
  }
);

Cypress.Commands.add('createAwxTeam', (organization: Organization) => {
  cy.requestPost<Pick<Team, 'name' | 'organization'>, Team>(awxAPI`/teams/`, {
    name: 'E2E Team ' + randomString(4),
    organization: organization.id,
  });
});

Cypress.Commands.add(
  'deleteAwxTeam',
  (
    team: Team,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (team.id) {
      cy.requestDelete(awxAPI`/teams/${team.id.toString()}/`, options);
    }
  }
);

Cypress.Commands.add('createAwxUser', (organization: Organization) => {
  cy.requestPost<Omit<AwxUser, 'id' | 'auth' | 'summary_fields'>, AwxUser>(
    awxAPI`/organizations/${organization.id.toString()}/users/`,
    {
      username: 'e2e-user-' + randomString(4),
      is_superuser: false,
      is_system_auditor: false,
      password: 'pw',
      user_type: 'normal',
    }
  ).then((user) => user);
});

Cypress.Commands.add(
  'deleteAwxUser',
  (
    user: AwxUser,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (user?.id) {
      cy.requestDelete(awxAPI`/users/${user.id.toString()}/`, options);
    }
  }
);
