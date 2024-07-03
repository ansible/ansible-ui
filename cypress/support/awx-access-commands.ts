/// <reference types="cypress" />

import '@cypress/code-coverage/support';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Team } from '../../frontend/awx/interfaces/Team';
import { AwxUser } from '../../frontend/awx/interfaces/User';
import { PlatformOrganization } from '../../platform/interfaces/PlatformOrganization';
import { PlatformTeam } from '../../platform/interfaces/PlatformTeam';

// Base create and delete commands for AWX organizations, teams, and users

Cypress.Commands.add('createAwxOrganization', (awxOrganization?: Partial<Organization>) => {
  const { related: _related, description: _description, ...rest } = awxOrganization ?? {};
  const platformOrg: Partial<PlatformOrganization> = { ...rest };
  cy.createPlatformOrganization(platformOrg).then((platformOrg) => {
    cy.getAwxOrgByAnsibleId(platformOrg.summary_fields.resource?.ansible_id);
  });
});

Cypress.Commands.add(
  'deleteAwxOrganization',
  (awxOrganization: Organization, options?: { failOnStatusCode?: boolean }) => {
    cy.getPlatformOrgByAnsibleId(awxOrganization.summary_fields.resource.ansible_id).then(
      (platformOrg) => cy.deletePlatformOrganization(platformOrg, options)
    );
  }
);

Cypress.Commands.add('createAwxTeam', (awxTeam?: Partial<Team>) => {
  const { related: _related, description: _description, ...rest } = awxTeam ?? {};
  const platformTeam: Partial<PlatformTeam> = { ...rest };
  cy.createPlatformTeam(platformTeam).then((platformTeam) =>
    cy.getAwxTeamByAnsibleId(platformTeam.summary_fields.resource.ansible_id)
  );
});

Cypress.Commands.add('deleteAwxTeam', (awxTeam: Team, options?: { failOnStatusCode?: boolean }) => {
  cy.getPlatformTeamByAnsibleId(awxTeam.summary_fields.resource.ansible_id).then((platformTeam) =>
    cy.deletePlatformTeam(platformTeam, options)
  );
});

Cypress.Commands.add('createAwxUser', (awxUser?: Partial<AwxUser>) => {
  const { related: _related, summary_fields: _summary_fields, ...rest } = awxUser ?? {};
  cy.createPlatformUser(rest).then((platformUser) =>
    cy.getAwxUserByAnsibleId(platformUser.summary_fields.resource.ansible_id)
  );
});

Cypress.Commands.add('deleteAwxUser', (user: AwxUser, options?: { failOnStatusCode?: boolean }) => {
  cy.getPlatformUserByAnsibleId(user.summary_fields.resource.ansible_id).then((platformUser) =>
    cy.deletePlatformUser(platformUser, options)
  );
});
