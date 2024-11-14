import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { Credential } from '@ansible/awx-ui/interfaces/Credential';
import { Inventory } from '@ansible/awx-ui/interfaces/Inventory';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { Project } from '@ansible/awx-ui/interfaces/Project';
import { Role } from '@ansible/awx-ui/interfaces/Role';
import { Team } from '@ansible/awx-ui/interfaces/Team';
import { WorkflowJobTemplate } from '@ansible/awx-ui/interfaces/WorkflowJobTemplate';
import '@cypress/code-coverage/support';
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
