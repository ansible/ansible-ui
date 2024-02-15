import '@cypress/code-coverage/support';
import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { Credential } from '../../frontend/awx/interfaces/Credential';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';
import { Role } from '../../frontend/awx/interfaces/Role';
import { Team } from '../../frontend/awx/interfaces/Team';
import { WorkflowJobTemplate } from '../../frontend/awx/interfaces/WorkflowJobTemplate';

Cypress.Commands.add('giveUserWfjtAccess', (wfjtName: string, userId: number, roleName: string) => {
  cy.awxRequestGet<AwxItemsResponse<WorkflowJobTemplate>>(
    `/api/v2/workflow_job_templates/?name=${wfjtName}`
  )
    .its('results[0]')
    .then((resource: WorkflowJobTemplate) => {
      cy.awxRequestGet<AwxItemsResponse<Role>>(
        `/api/v2/workflow_job_templates/${resource.id}/object_roles/`
      )
        .its('results')
        .then((rolesArray) => {
          const approveRole = rolesArray
            ? rolesArray.find((role) => role.name === roleName)
            : undefined;
          cy.awxRequestPost<Partial<Role>>(`/api/v2/users/${userId}/roles/`, {
            id: approveRole?.id,
          });
        });
    });
});

Cypress.Commands.add(
  'giveUserCredentialsAccess',
  (credentialName: string, userId: number, roleName: string) => {
    cy.awxRequestGet<AwxItemsResponse<Credential>>(`/api/v2/credentials/?name=${credentialName}`)
      .its('results[0]')
      .then((resource: Credential) => {
        cy.awxRequestGet<AwxItemsResponse<Role>>(`/api/v2/credentials/${resource.id}/object_roles/`)
          .its('results')
          .then((rolesArray) => {
            const approveRole = rolesArray
              ? rolesArray.find((role) => role.name === roleName)
              : undefined;
            cy.awxRequestPost<Partial<Role>>(`/api/v2/users/${userId}/roles/`, {
              id: approveRole?.id,
            });
          });
      });
  }
);

Cypress.Commands.add(
  'giveUserProjectAccess',
  (projectName: string, userId: number, roleName: string) => {
    cy.awxRequestGet<AwxItemsResponse<Project>>(`/api/v2/projects/?name=${projectName}`)
      .its('results[0]')
      .then((resource: Project) => {
        cy.awxRequestGet<AwxItemsResponse<Role>>(`/api/v2/projects/${resource.id}/object_roles/`)
          .its('results')
          .then((rolesArray) => {
            const approveRole = rolesArray
              ? rolesArray.find((role) => role.name === roleName)
              : undefined;
            cy.awxRequestPost<Partial<Role>>(`/api/v2/users/${userId}/roles/`, {
              id: approveRole?.id,
            });
          });
      });
  }
);

Cypress.Commands.add(
  'giveUserInventoryAccess',
  (inventoryName: string, userId: number, roleName: string) => {
    cy.awxRequestGet<AwxItemsResponse<Inventory>>(`/api/v2/inventories/?name=${inventoryName}`)
      .its('results[0]')
      .then((resource: Inventory) => {
        cy.awxRequestGet<AwxItemsResponse<Role>>(`/api/v2/inventories/${resource.id}/object_roles/`)
          .its('results')
          .then((rolesArray) => {
            const approveRole = rolesArray
              ? rolesArray.find((role) => role.name === roleName)
              : undefined;
            cy.awxRequestPost<Partial<Role>>(`/api/v2/users/${userId}/roles/`, {
              id: approveRole?.id,
            });
          });
      });
  }
);

Cypress.Commands.add(
  'giveUserOrganizationAccess',
  (organizationName: string, userId: number, roleName: string) => {
    cy.awxRequestGet<AwxItemsResponse<Organization>>(
      `/api/v2/organizations/?name=${organizationName}`
    )
      .its('results[0]')
      .then((resource: Organization) => {
        cy.awxRequestGet<AwxItemsResponse<Role>>(
          `/api/v2/organizations/${resource.id}/object_roles/`
        )
          .its('results')
          .then((rolesArray) => {
            const approveRole = rolesArray
              ? rolesArray.find((role) => role.name === roleName)
              : undefined;
            cy.awxRequestPost<Partial<Role>>(`/api/v2/users/${userId}/roles/`, {
              id: approveRole?.id,
            });
          });
      });
  }
);

Cypress.Commands.add('giveUserTeamAccess', (teamName: string, userId: number, roleName: string) => {
  cy.awxRequestGet<AwxItemsResponse<Team>>(`/api/v2/teams/?name=${teamName}`)
    .its('results[0]')
    .then((resource: Team) => {
      cy.awxRequestGet<AwxItemsResponse<Role>>(`/api/v2/teams/${resource.id}/object_roles/`)
        .its('results')
        .then((rolesArray) => {
          const approveRole = rolesArray
            ? rolesArray.find((role) => role.name === roleName)
            : undefined;
          cy.log('APPROVE', approveRole);
          cy.awxRequestPost<Partial<Role>>(`/api/v2/users/${userId}/roles/`, {
            id: approveRole?.id,
          });
        });
    });
});
