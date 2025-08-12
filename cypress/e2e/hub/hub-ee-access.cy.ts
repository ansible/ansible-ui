import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { RemoteRegistry } from '@ansible/hub-ui/administration/remote-registries/RemoteRegistry';
import { ExecutionEnvironment } from '@ansible/hub-ui/execution-environments/ExecutionEnvironment';
import { ContentTypeEnum } from '@ansible/hub-ui/interfaces/expanded/ContentType';
import { HubRbacRole } from '@ansible/hub-ui/interfaces/expanded/HubRbacRole';
import { hubAPI } from '../../support/formatApiPathForHub';
import { ExecutionEnvironments } from './constants';

describe('Execution Environment User Access tab', () => {
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
    cy.createHubRemoteRegistry().then((remoteRegistryData) => {
      remoteRegistry = remoteRegistryData;
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
    });
  }

  it.skip('create a new ee, from the user access tab assign a user and apply role(s) to the user of the ee', () => {
    //https://issues.redhat.com/browse/AAP-51476
    cy.intercept('POST', hubAPI`/_ui/v2/role_user_assignments/`).as('userRoleAssignment');
    cy.createHubUser().then((hubUser) => {
      cy.clickTab(/^Details$/, true);
      cy.clickTab(/^User Access$/, true);
      cy.getByDataCy('assign-users').click();
      cy.getWizard().within(() => {
        cy.getTableRowByText(hubUser.username, true).within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.intercept('GET', hubAPI`/_ui/v2/role_definitions/*`).as('roleDefinitions');
        cy.clickButton(/^Next/);
        cy.wait('@roleDefinitions');
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

  it.skip('create a new ee, from the team access tab assign a user and apply role(s) to the team of the ee', () => {
    //https://issues.redhat.com/browse/AAP-51476
    cy.intercept('POST', hubAPI`/_ui/v2/role_team_assignments/`).as('teamRoleAssignment');
    cy.createHubTeam().then((hubTeam) => {
      cy.clickTab(/^Details$/, true);
      cy.clickTab(/^Team Access$/, true);
      cy.getByDataCy('assign-teams').click();
      cy.verifyPageTitle('Assign teams');
      cy.getWizard().within(() => {
        cy.contains('h1', 'Select team(s)').should('be.visible');
        cy.getTableRowByText(hubTeam.name, true).within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.intercept('GET', hubAPI`/_ui/v2/role_definitions/*`).as('roleDefinitions');
        cy.clickButton(/^Next/);
        cy.wait('@roleDefinitions');
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
      cy.getModal().should('not.exist');
      cy.verifyPageTitle(executionEnvironment.name);
      cy.selectTableRowByCheckbox('team-name', hubTeam.name, {
        disableFilter: true,
      });
      cy.contains(role.name).should('be.visible');
      removeRoleFromListRow(role.name);
      cy.deleteHubTeam(hubTeam, { failOnStatusCode: false });
    });
  });
});
