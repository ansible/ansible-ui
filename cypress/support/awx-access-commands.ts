/// <reference types="cypress" />

import '@cypress/code-coverage/support';
import { randomString } from '../../framework/utils/random-string';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Team } from '../../frontend/awx/interfaces/Team';
import { AwxUser } from '../../frontend/awx/interfaces/User';
import { awxAPI } from './formatApiPathForAwx';

// Base create and delete commands for AWX organizations, teams, and users

Cypress.Commands.add('createAwxOrganization', (awxOrganization?: Partial<Organization>) => {
  if (!awxOrganization) {
    awxOrganization = {};
  }

  if (!awxOrganization.name) {
    awxOrganization.name = 'E2E Organization ' + randomString(4);
  }

  cy.requestPost<Pick<Organization, 'name'>, Organization>(
    awxAPI`/organizations/`,
    awxOrganization
  );
});

Cypress.Commands.add(
  'deleteAwxOrganization',
  (awxOrganization: Organization, options?: { failOnStatusCode?: boolean }) => {
    cy.requestDelete(awxAPI`/organizations/${awxOrganization?.id.toString()}/`, options);
  }
);

Cypress.Commands.add('createAwxTeam', (awxTeam?: Partial<Team>) => {
  if (!awxTeam) {
    awxTeam = {};
  }
  if (!awxTeam.name) {
    awxTeam.name = 'E2E Team ' + randomString(4);
  }

  cy.requestPost<Pick<Team, 'name' | 'organization'>, Team>(awxAPI`/teams/`, awxTeam);
});

Cypress.Commands.add('deleteAwxTeam', (team: Team, options?: { failOnStatusCode?: boolean }) => {
  cy.requestDelete(awxAPI`/teams/${team.id.toString()}/`, options);
});

Cypress.Commands.add('createAwxUser', (awxUser?: Partial<AwxUser>) => {
  const newUser: Partial<AwxUser> = {
    ...{
      username: 'e2e-user-' + randomString(4),
      is_superuser: false,
      is_system_auditor: false,
      password: 'pw',
      user_type: 'normal',
    },
    ...awxUser,
  };

  if (newUser.organization !== undefined) {
    cy.requestPost<AwxUser>(
      awxAPI`/organizations/${newUser.organization.toString()}/users/`,
      newUser
    );
  } else {
    cy.requestPost<AwxUser>(awxAPI`/users/`, newUser);
  }
});

Cypress.Commands.add('deleteAwxUser', (user: AwxUser, options?: { failOnStatusCode?: boolean }) => {
  cy.requestDelete(awxAPI`/users/${user.id.toString()}/`, options);
});

Cypress.Commands.add('getCurrentUser', () => {
  const url = awxAPI`/me/`;
  cy.pollAWXResults<AwxUser>(url).then((user) => {
    return user[0];
  });
});

Cypress.Commands.add('addEERolesToUsersInOrganization', (_organizationName: string) => {});
Cypress.Commands.add('addEERolesToTeamsInOrganization', (_organizationName?: string) => {});
