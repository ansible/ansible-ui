import { RemoteRegistry } from '../../../frontend/hub/administration/remote-registries/RemoteRegistry';
import { ExecutionEnvironment } from '../../../frontend/hub/execution-environments/ExecutionEnvironment';
import { hubAPI } from '../../support/formatApiPathForHub';
import { ExecutionEnvironments } from './constants';
import { randomString } from '../../../framework/utils/random-string';
import { ContentTypeEnum } from '../../../frontend/hub/interfaces/expanded/ContentType';
import { HubRbacRole } from '../../../frontend/hub/interfaces/expanded/HubRbacRole';

describe.skip('Execution Environment User Access tab', () => {
  let executionEnvironment: ExecutionEnvironment;
  let remoteRegistry: RemoteRegistry;
  let role: HubRbacRole;
  before(() => {
    const customRole = {
      roleName: 'galaxy.' + `${randomString(5)}`,
      roleDescription: 'Manage EE.',
      contentType: ContentTypeEnum.ExecutionEnvironment,
      permission: 'galaxy.view_containernamespace',
    };
    cy.createHubRoleAPI({
      roleName: customRole.roleName,
      description: customRole.roleDescription,
      content_type: customRole.contentType,
      permissions: [customRole.permission],
    }).then((createdRole) => {
      role = createdRole;
    });
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
    cy.deleteHubRoleAPI(role);
  });

  beforeEach(() => {
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.verifyPageTitle(ExecutionEnvironments.title);
    cy.filterTableBySingleText(executionEnvironment.name);
    cy.clickTableRowLink('name', executionEnvironment.name, { disableFilter: true });
    cy.verifyPageTitle(executionEnvironment.name);
  });

  function removeRoleFromListRow(roleName: string) {
    cy.clickTableRowPinnedAction(roleName, 'remove-role', false);
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.clickButton(/^Remove role/);
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
      cy.getWizard().within(() => {
        cy.selectTableRow(hubUser.username);
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Select roles to apply').should('be.visible');
        cy.filterTableByTextFilter('name', role.name, {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', role.name, {
          disableFilter: true,
        });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Review').should('be.visible');
        cy.verifyReviewStepWizardDetails('users', [hubUser.username], '1');
        cy.verifyReviewStepWizardDetails('hubRoles', [role.name, role.description], '1');
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
      cy.contains(role.name).should('be.visible');
      removeRoleFromListRow(role.name);
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
        cy.filterTableByTextFilter('name', role.name, {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', role.name, {
          disableFilter: true,
        });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Review').should('be.visible');
        cy.verifyReviewStepWizardDetails('teams', [hubTeam.name], '1');
        cy.verifyReviewStepWizardDetails('hubRoles', [role.name, role.description], '1');
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
      cy.contains(role.name).should('be.visible');
      removeRoleFromListRow(role.name);
      cy.deleteHubTeam(hubTeam, { failOnStatusCode: false });
    });
  });
});
