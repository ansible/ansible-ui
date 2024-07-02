import '@cypress/code-coverage/support';
import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { Credential } from '../../frontend/awx/interfaces/Credential';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';
import { Role } from '../../frontend/awx/interfaces/Role';
import { Team } from '../../frontend/awx/interfaces/Team';
import { WorkflowJobTemplate } from '../../frontend/awx/interfaces/WorkflowJobTemplate';

Cypress.Commands.add(
  'giveUserCredentialsAccess',
  (credentialName: string, userId: number, roleName: string) => {
    cy.requestGet<AwxItemsResponse<Credential>>(`/api/v2/credentials/?name=${credentialName}`)
      .its('results[0]')
      .then((resource: Credential) => {
        cy.requestGet<AwxItemsResponse<Role>>(`/api/v2/credentials/${resource.id}/object_roles/`)
          .its('results')
          .then((rolesArray) => {
            const approveRole = rolesArray
              ? rolesArray.find((role) => role.name === roleName)
              : undefined;
            cy.requestPost<Partial<Role>>(`/api/v2/users/${userId}/roles/`, {
              id: approveRole?.id,
            });
          });
      });
  }
);

Cypress.Commands.add(
  'giveUserProjectAccess',
  (projectName: string, userId: number, roleName: string) => {
    cy.requestGet<AwxItemsResponse<Project>>(`/api/v2/projects/?name=${projectName}`)
      .its('results[0]')
      .then((resource: Project) => {
        cy.requestGet<AwxItemsResponse<Role>>(`/api/v2/projects/${resource.id}/object_roles/`)
          .its('results')
          .then((rolesArray) => {
            const approveRole = rolesArray
              ? rolesArray.find((role) => role.name === roleName)
              : undefined;
            cy.requestPost<Partial<Role>>(`/api/v2/users/${userId}/roles/`, {
              id: approveRole?.id,
            });
          });
      });
  }
);

Cypress.Commands.add(
  'giveUserInventoryAccess',
  (inventoryName: string, userId: number, roleName: string) => {
    cy.requestGet<AwxItemsResponse<Inventory>>(`/api/v2/inventories/?name=${inventoryName}`)
      .its('results[0]')
      .then((resource: Inventory) => {
        cy.requestGet<AwxItemsResponse<Role>>(`/api/v2/inventories/${resource.id}/object_roles/`)
          .its('results')
          .then((rolesArray) => {
            const approveRole = rolesArray
              ? rolesArray.find((role) => role.name === roleName)
              : undefined;
            cy.requestPost<Partial<Role>>(`/api/v2/users/${userId}/roles/`, {
              id: approveRole?.id,
            });
          });
      });
  }
);

Cypress.Commands.add(
  'giveUserOrganizationAccess',
  (organizationName: string, userId: number, roleName: string) => {
    cy.requestGet<AwxItemsResponse<Organization>>(`/api/v2/organizations/?name=${organizationName}`)
      .its('results[0]')
      .then((resource: Organization) => {
        cy.requestGet<AwxItemsResponse<Role>>(`/api/v2/organizations/${resource.id}/object_roles/`)
          .its('results')
          .then((rolesArray) => {
            const approveRole = rolesArray
              ? rolesArray.find((role) => role.name === roleName)
              : undefined;
            cy.requestPost<Partial<Role>>(`/api/v2/users/${userId}/roles/`, {
              id: approveRole?.id,
            });
          });
      });
  }
);

Cypress.Commands.add('giveUserTeamAccess', (teamName: string, userId: number, roleName: string) => {
  cy.requestGet<AwxItemsResponse<Team>>(`/api/v2/teams/?name=${teamName}`)
    .its('results[0]')
    .then((resource: Team) => {
      cy.requestGet<AwxItemsResponse<Role>>(`/api/v2/teams/${resource.id}/object_roles/`)
        .its('results')
        .then((rolesArray) => {
          const approveRole = rolesArray
            ? rolesArray.find((role) => role.name === roleName)
            : undefined;
          cy.log('APPROVE', approveRole);
          cy.requestPost<Partial<Role>>(`/api/v2/users/${userId}/roles/`, {
            id: approveRole?.id,
          });
        });
    });
});
