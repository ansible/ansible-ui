import { RemoteRegistry } from '../../../frontend/hub/administration/remote-registries/RemoteRegistry';
import { ExecutionEnvironment } from '../../../frontend/hub/execution-environments/ExecutionEnvironment';
import { hubAPI } from '../../support/formatApiPathForHub';
import { ExecutionEnvironments } from './constants';

describe.skip('Execution Environment User Access tab', () => {
  let executionEnvironment: ExecutionEnvironment;
  let remoteRegistry: RemoteRegistry;
  before(() => {
    cy.createHubRemoteRegistry().then((remoteRegistry) => {
      cy.createHubExecutionEnvironment({
        executionEnvironment: { registry: remoteRegistry.id },
      }).then((execution_Environment) => {
        executionEnvironment = execution_Environment;
      });
    });
  });

  after(() => {
    cy.deleteHubExecutionEnvironment(executionEnvironment);
    cy.deleteHubRemoteRegistry(remoteRegistry);
  });

  beforeEach(() => {
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.verifyPageTitle(ExecutionEnvironments.title);
    cy.filterTableBySingleText(executionEnvironment.name);
    cy.clickTableRowLink('name', executionEnvironment.name, { disableFilter: true });
    cy.verifyPageTitle(executionEnvironment.name);
  });

  function removeRoleFromListRow(roleName: string, assignmentType: string) {
    cy.intercept('DELETE', hubAPI`/role_${assignmentType}_assignments/*`).as('deleteRole');
    cy.clickTableRowPinnedAction(roleName, 'remove-role', false);
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.clickButton(/^Remove role/);
      cy.wait('@deleteRole')
        .its('response')
        .then((deleted) => {
          expect(deleted?.statusCode).to.eql(204);
          cy.contains(/^Success$/).should('be.visible');
          cy.containsBy('button', /^Close$/).click();
        });
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clearAllFilters();
    });
  }

  it('create a new ee, from the user access tab assign a user and apply role(s) to the user of the ee', () => {
    cy.intercept('POST', hubAPI`/_ui/v2/role_user_assignments/`).as('userRoleAssignment');
    cy.createHubUser().then((hubUser) => {
      cy.clickTab('User Access', true);
      cy.getByDataCy('add-roles').click();
      cy.verifyPageTitle('Add roles');

      cy.getWizard().within(() => {
        cy.contains('h1', 'Select user(s)').should('be.visible');
        cy.setTablePageSize('100');
        cy.selectTableRowByCheckbox('username', hubUser.username, { disableFilter: true });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Select roles to apply').should('be.visible');
        cy.filterTableByTextFilter('name', 'galaxy.execution_environment_collaborator', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.execution_environment_collaborator', {
          disableFilter: true,
        });
        cy.filterTableByTextFilter('name', 'galaxy.execution_environment_namespace_owner', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.execution_environment_namespace_owner', {
          disableFilter: true,
        });
        cy.filterTableByTextFilter('name', 'galaxy.execution_environment_publisher', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.execution_environment_publisher', {
          disableFilter: true,
        });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Review').should('be.visible');
        cy.verifyReviewStepWizardDetails('users', [hubUser.username], '1');
        cy.verifyReviewStepWizardDetails(
          'hubRoles',
          [
            'galaxy.execution_environment_collaborator',
            'Change existing execution environments.',
            'galaxy.execution_environment_namespace_owner',
            'Create and update execution environments under existing container namespaces.',
            'galaxy.execution_environment_publisher',
            'Push and change execution environments.',
          ],
          '3'
        );
        cy.clickButton(/^Finish/);
        cy.wait('@userRoleAssignment')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(201);
          });
      });
      cy.getModal().within(() => {
        cy.clickButton(/^Close$/);
      });
      cy.getModal().should('not.exist');
      cy.verifyPageTitle(executionEnvironment.name);
      cy.selectTableRowByCheckbox('username', hubUser.username, {
        disableFilter: true,
      });
      removeRoleFromListRow('galaxy.execution_environment_publisher', 'user');
      cy.selectTableRowByCheckbox('username', hubUser.username, {
        disableFilter: true,
      });
      removeRoleFromListRow('galaxy.execution_environment_namespace_owner', 'user');
      cy.deleteHubUser(hubUser, { failOnStatusCode: false });
    });
  });

  it('create a new ee, from the team access tab assign a user and apply role(s) to the team of the ee', () => {
    cy.intercept('POST', hubAPI`/_ui/v2/role_team_assignments/`).as('teamRoleAssignment');
    cy.createHubTeam().then((hubTeam) => {
      cy.clickTab('Team Access', true);
      cy.getByDataCy('add-roles').click();
      cy.verifyPageTitle('Add roles');

      cy.getWizard().within(() => {
        cy.contains('h1', 'Select team(s)').should('be.visible');
        cy.selectTableRowByCheckbox('name', hubTeam.name, { disableFilter: true });

        cy.clickButton(/^Next/);
        cy.contains('h1', 'Select roles to apply').should('be.visible');
        cy.filterTableByTextFilter('name', 'galaxy.execution_environment_collaborator', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.execution_environment_collaborator', {
          disableFilter: true,
        });
        cy.filterTableByTextFilter('name', 'galaxy.execution_environment_namespace_owner', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.execution_environment_namespace_owner', {
          disableFilter: true,
        });
        cy.filterTableByTextFilter('name', 'galaxy.execution_environment_publisher', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.execution_environment_publisher', {
          disableFilter: true,
        });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Review').should('be.visible');
        cy.verifyReviewStepWizardDetails('teams', [hubTeam.name], '1');
        cy.verifyReviewStepWizardDetails(
          'hubRoles',
          [
            'galaxy.execution_environment_collaborator',
            'Change existing execution environments.',
            'galaxy.execution_environment_namespace_owner',
            'Create and update execution environments under existing container namespaces.',
            'galaxy.execution_environment_publisher',
            'Push and change execution environments.',
          ],
          '3'
        );
        cy.clickButton(/^Finish/);
        cy.wait('@teamRoleAssignment')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(201);
          });
      });
      cy.getModal().within(() => {
        cy.clickButton(/^Close$/);
      });
      cy.getModal().should('not.exist');
      cy.verifyPageTitle(executionEnvironment.name);
      cy.selectTableRowByCheckbox('name', hubTeam.name, {
        disableFilter: true,
      });
      removeRoleFromListRow('galaxy.execution_environment_publisher', 'team');
      cy.selectTableRowByCheckbox('name', hubTeam.name, {
        disableFilter: true,
      });
      removeRoleFromListRow('galaxy.execution_environment_namespace_owner', 'team');
      cy.deleteHubTeam(hubTeam, { failOnStatusCode: false });
    });
  });
});
