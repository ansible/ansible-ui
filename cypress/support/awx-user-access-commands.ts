import '@cypress/code-coverage/support';
import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { Credential } from '../../frontend/awx/interfaces/Credential';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';
import { Role } from '../../frontend/awx/interfaces/Role';
import { Team } from '../../frontend/awx/interfaces/Team';
import { WorkflowJobTemplate } from '../../frontend/awx/interfaces/WorkflowJobTemplate';
import { awxAPI } from '../support/formatApiPathForAwx';

Cypress.Commands.add('giveUserWfjtAccess', (wfjtName: string, userId: number, roleName: string) => {
  cy.requestGet<AwxItemsResponse<WorkflowJobTemplate>>(
    awxAPI`/workflow_job_templates/?name=${wfjtName}`
  )
    .its('results[0]')
    .then((resource: WorkflowJobTemplate) => {
      cy.requestGet<AwxItemsResponse<Role>>(
        awxAPI`/workflow_job_templates/${resource.id.toString()}/object_roles/`
      )
        .its('results')
        .then((rolesArray) => {
          const approveRole = rolesArray
            ? rolesArray.find((role) => role.name === roleName)
            : undefined;
          cy.requestPost<Partial<Role>>(awxAPI`awxAPI/users/${userId.toString()}/roles/`, {
            id: approveRole?.id,
          });
        });
    });
});

Cypress.Commands.add(
  'giveUserCredentialsAccess',
  (credentialName: string, userId: number, roleName: string) => {
    cy.requestGet<AwxItemsResponse<Credential>>(awxAPI`/credentials/?name=${credentialName}`)
      .its('results[0]')
      .then((resource: Credential) => {
        cy.requestGet<AwxItemsResponse<Role>>(
          awxAPI`/credentials/${resource.id.toString()}/object_roles/`
        )
          .its('results')
          .then((rolesArray) => {
            const approveRole = rolesArray
              ? rolesArray.find((role) => role.name === roleName)
              : undefined;
            cy.requestPost<Partial<Role>>(awxAPI`/users/${userId.toString()}/roles/`, {
              id: approveRole?.id,
            });
          });
      });
  }
);

Cypress.Commands.add(
  'giveUserProjectAccess',
  (projectName: string, userId: number, roleName: string) => {
    cy.requestGet<AwxItemsResponse<Project>>(awxAPI`/projects/?name=${projectName}`)
      .its('results[0]')
      .then((resource: Project) => {
        cy.requestGet<AwxItemsResponse<Role>>(
          awxAPI`/projects/${resource.id.toString()}/object_roles/`
        )
          .its('results')
          .then((rolesArray) => {
            const approveRole = rolesArray
              ? rolesArray.find((role) => role.name === roleName)
              : undefined;
            cy.requestPost<Partial<Role>>(awxAPI`/users/${userId.toString()}/roles/`, {
              id: approveRole?.id,
            });
          });
      });
  }
);

Cypress.Commands.add(
  'giveUserInventoryAccess',
  (inventoryName: string, userId: number, roleName: string) => {
    cy.requestGet<AwxItemsResponse<Inventory>>(awxAPI`/inventories/?name=${inventoryName}`)
      .its('results[0]')
      .then((resource: Inventory) => {
        cy.requestGet<AwxItemsResponse<Role>>(
          awxAPI`/inventories/${resource.id.toString()}/object_roles/`
        )
          .its('results')
          .then((rolesArray) => {
            const approveRole = rolesArray
              ? rolesArray.find((role) => role.name === roleName)
              : undefined;
            cy.requestPost<Partial<Role>>(awxAPI`/users/${userId.toString()}/roles/`, {
              id: approveRole?.id,
            });
          });
      });
  }
);

Cypress.Commands.add(
  'giveUserOrganizationAccess',
  (organizationName: string, userId: number, roleName: string) => {
    cy.requestGet<AwxItemsResponse<Organization>>(awxAPI`/organizations/?name=${organizationName}`)
      .its('results[0]')
      .then((resource: Organization) => {
        cy.requestGet<AwxItemsResponse<Role>>(
          awxAPI`/organizations/${resource.id.toString()}/object_roles/`
        )
          .its('results')
          .then((rolesArray) => {
            const approveRole = rolesArray
              ? rolesArray.find((role) => role.name === roleName)
              : undefined;
            cy.requestPost<Partial<Role>>(awxAPI`/users/${userId.toString()}/roles/`, {
              id: approveRole?.id,
            });
          });
      });
  }
);

Cypress.Commands.add('giveUserTeamAccess', (teamName: string, userId: number, roleName: string) => {
  cy.requestGet<AwxItemsResponse<Team>>(awxAPI`/teams/?name=${teamName}`)
    .its('results[0]')
    .then((resource: Team) => {
      cy.requestGet<AwxItemsResponse<Role>>(awxAPI`/teams/${resource.id.toString()}/object_roles/`)
        .its('results')
        .then((rolesArray) => {
          const approveRole = rolesArray
            ? rolesArray.find((role) => role.name === roleName)
            : undefined;
          cy.log('APPROVE', approveRole);
          cy.requestPost<Partial<Role>>(awxAPI`/users/${userId.toString()}/roles/`, {
            id: approveRole?.id,
          });
        });
    });
});
