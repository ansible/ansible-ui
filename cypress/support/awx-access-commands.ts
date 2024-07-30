/// <reference types="cypress" />

import '@cypress/code-coverage/support';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Team } from '../../frontend/awx/interfaces/Team';
import { AwxUser } from '../../frontend/awx/interfaces/User';
import { PlatformOrganization } from '../../platform/interfaces/PlatformOrganization';
import { PlatformTeam } from '../../platform/interfaces/PlatformTeam';
import { awxAPI } from './formatApiPathForAwx';

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
  const {
    related: _related,
    description: _description,
    organization: awxOrganizationId,
    ...rest
  } = awxTeam ?? {};
  // Get the platform organization using the AWX organization ID
  cy.requestGet<Organization>(awxAPI`/organizations/${awxOrganizationId!.toString()}`).then(
    (awxOrganization) => {
      cy.getPlatformOrgByAnsibleId(awxOrganization.summary_fields.resource.ansible_id).then(
        (platformOrg) => {
          // Use the platform organization to create a platform team
          const platformTeam: Partial<PlatformTeam> = { ...rest, organization: platformOrg.id };
          cy.createPlatformTeam(platformTeam).then((platformTeam) =>
            cy.getAwxTeamByAnsibleId(platformTeam.summary_fields.resource.ansible_id)
          );
        }
      );
    }
  );
});

Cypress.Commands.add('deleteAwxTeam', (awxTeam: Team, options?: { failOnStatusCode?: boolean }) => {
  cy.getPlatformTeamByAnsibleId(awxTeam.summary_fields.resource.ansible_id).then((platformTeam) =>
    cy.deletePlatformTeam(platformTeam, options)
  );
});

Cypress.Commands.add('createAwxUser', (awxUser?: Partial<AwxUser>) => {
  const {
    related: _related,
    summary_fields: _summary_fields,
    organization: awxOrganizationId,
    ...rest
  } = awxUser ?? {};

  // Get the platform organization using the AWX organization ID
  cy.requestGet<Organization>(awxAPI`/organizations/${awxOrganizationId!.toString()}`).then(
    (awxOrganization) => {
      cy.getPlatformOrgByAnsibleId(awxOrganization.summary_fields.resource.ansible_id).then(
        (platformOrg) => {
          // Associate the created platform user with the platform organization
          cy.createPlatformUser(rest).then((platformUser) => {
            cy.associateUsersWithPlatformOrganization(platformOrg, [platformUser]).then(() => {
              //  Retrieve the created organization from AWX
              cy.getAwxUserByAnsibleId(platformUser.summary_fields.resource.ansible_id);
            });
          });
        }
      );
    }
  );
});

Cypress.Commands.add('deleteAwxUser', (user: AwxUser, options?: { failOnStatusCode?: boolean }) => {
  cy.getPlatformUserByAnsibleId(user.summary_fields.resource.ansible_id).then((platformUser) =>
    cy.deletePlatformUser(platformUser, options)
  );
});

Cypress.Commands.add('getCurrentUser', () => {
  cy.getCurrentPlatformUser().then((currentUser) =>
    cy.getAwxUserByAnsibleId(currentUser.summary_fields.resource.ansible_id)
  );
});
Cypress.Commands.add('addEERolesToUsersInOrganization', (organizationName: string) => {
  cy.navigateTo('platform', 'organizations');
  cy.verifyPageTitle('Organizations');
  cy.filterTableByTextFilter('name', organizationName, { disableFilterSelection: true });
  cy.clickTableRowLink('name', organizationName, { disableFilter: true });
  cy.clickTab(/^Users$/, true);
  cy.getByDataCy('manage-roles').click();
  cy.clickButton(/^Manage roles/);
  cy.getWizard().within(() => {
    cy.contains('h1', 'Select Automation Execution roles').should('be.visible');
    cy.filterTableByTextFilter('name', 'Organization ExecutionEnvironment Admin', {
      disableFilterSelection: true,
    });
    cy.selectTableRowByCheckbox('name', 'Organization ExecutionEnvironment Admin', {
      disableFilter: true,
    });
    cy.clickButton(/^Next/);
    cy.getByDataCy('select-all').click();
    cy.clickButton(/^Next/);
    cy.contains('h1', 'Review').should('be.visible');
    cy.clickButton(/^Finish/);
  });
  cy.getModal().within(() => {
    cy.clickButton(/^Close$/);
  });
});
Cypress.Commands.add('addEERolesToTeamsInOrganization', (organizationName: string) => {
  cy.navigateTo('platform', 'organizations');
  cy.verifyPageTitle('Organizations');
  cy.filterTableByTextFilter('name', organizationName, { disableFilterSelection: true });
  cy.clickTableRowLink('name', organizationName, { disableFilter: true });
  cy.clickTab(/^Teams$/, true);
  cy.getByDataCy('manage-roles').click();
  cy.clickButton(/^Manage roles/);
  cy.getWizard().within(() => {
    cy.contains('h1', 'Select Automation Execution roles').should('be.visible');
    cy.filterTableByTextFilter('name', 'Organization ExecutionEnvironment Admin', {
      disableFilterSelection: true,
    });
    cy.selectTableRowByCheckbox('name', 'Organization ExecutionEnvironment Admin', {
      disableFilter: true,
    });
    cy.clickButton(/^Next/);
    cy.getByDataCy('select-all').click();
    cy.clickButton(/^Next/);
    cy.contains('h1', 'Review').should('be.visible');
    cy.clickButton(/^Finish/);
  });
  cy.getModal().within(() => {
    cy.clickButton(/^Close$/);
  });
});
