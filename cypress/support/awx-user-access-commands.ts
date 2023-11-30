import '@cypress/code-coverage/support';
import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { Credential } from '../../frontend/awx/interfaces/Credential';
import { Role } from '../../frontend/awx/interfaces/Role';
import { WorkflowJobTemplate } from '../../frontend/awx/interfaces/WorkflowJobTemplate';
import './auth';
import './commands';
import './rest-commands';
import { Project } from '../../frontend/awx/interfaces/Project';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';

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
            cy.log('APPROVE', approveRole);
            cy.awxRequestPost<Partial<Role>>(`/api/v2/users/${userId}/roles/`, {
              id: approveRole?.id,
            });
          });
      });
  }
);
