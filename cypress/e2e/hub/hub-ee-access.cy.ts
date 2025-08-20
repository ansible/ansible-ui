import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { RemoteRegistry } from '@ansible/hub-ui/administration/remote-registries/RemoteRegistry';
import { ExecutionEnvironment } from '@ansible/hub-ui/execution-environments/ExecutionEnvironment';
import { ContentTypeEnum } from '@ansible/hub-ui/interfaces/expanded/ContentType';
import { ExecutionEnvironments } from './constants';
import { PlatformRole } from '@ansible/platform-ui/interfaces/PlatformRole';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';

describe('Execution Environment User Access tab', () => {
  let executionEnvironment: ExecutionEnvironment;
  let remoteRegistry: RemoteRegistry;
  let role: PlatformRole;
  let organization: PlatformOrganization;

  before(() => {
    const customRole = {
      roleName: 'galaxy.' + `${randomString(5)}`,
      roleDescription: 'Manage EE.',
      contentType: ContentTypeEnum.ExecutionEnvironment,
      permission: 'galaxy.view_containernamespace',
    };
    cy.createPlatformRole(customRole.roleName, customRole.roleDescription, customRole.contentType, [
      customRole.permission,
    ]).then((createdRole) => {
      role = createdRole as PlatformRole;
    });
    cy.createPlatformOrganization().then((org) => {
      organization = org;
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
    cy.deletePlatformRole(role);
    cy.deletePlatformOrganization(organization);
  });

  beforeEach(() => {
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.verifyPageTitle(ExecutionEnvironments.title);
    cy.filterTableBySingleText(executionEnvironment.name);
    cy.clickTableRowLink('name', executionEnvironment.name, { disableFilter: true });
    cy.verifyPageTitle(executionEnvironment.name);
  });

  it('create a new ee, from the user access tab assign a user and apply role(s) to the user of the ee', () => {
    cy.intercept('POST', gatewayAPI`/role_user_assignments/`).as('userRoleAssignment');
    cy.createHubUser().then((hubUser) => {
      cy.clickTab(/^Details$/, true);
      cy.clickTab(/^User Access$/, true);
      cy.getByDataCy('assign-users').click();
      cy.getWizard().within(() => {
        cy.getTableRowByText(hubUser.username, true).within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.intercept('GET', gatewayAPI`/role_definitions/*`).as('roleDefinitions');
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
        cy.verifyReviewStepWizardDetails(
          'platformRoles',
          [role.name, role.description, 'Automation Content'],
          '1'
        );
        cy.clickButton(/^Finish/);
        cy.wait('@userRoleAssignment')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(201);
          });
      });
      cy.getModal().should('not.exist');
      cy.verifyPageTitle(executionEnvironment.name);
    });
  });

  function removeRoleFromListRow(roleName: string) {
    cy.clickTableRowPinnedAction(roleName, 'remove-role', false);
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.clickButton(/^Remove role/);
      //cy.contains(/^Success$/).should('be.visible');
    });
  }
  it('create a new ee, from the team access tab assign a user and apply role(s) to the team of the ee', () => {
    cy.intercept('POST', gatewayAPI`/role_team_assignments/`).as('teamRoleAssignment');
    cy.createPlatformTeam({ organization: organization?.id }).then((hubTeam) => {
      cy.clickTab(/^Details$/, true);
      cy.clickTab(/^Team Access$/, true);
      cy.getByDataCy('assign-teams').click();
      cy.verifyPageTitle('Assign teams');
      cy.getWizard().within(() => {
        cy.contains('h1', 'Select team(s)').should('be.visible');
        cy.getTableRowByText(hubTeam.name, true).within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.intercept('GET', gatewayAPI`/role_definitions/*`).as('roleDefinitions');
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
        cy.verifyReviewStepWizardDetails(
          'platformRoles',
          [role.name, role.description, 'Automation Content'],
          '1'
        );
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
        disableFilter: false,
      });
      cy.contains(role.name).should('be.visible');
      removeRoleFromListRow(role.name);
      cy.deletePlatformTeam(hubTeam, { failOnStatusCode: false });
    });
  });
});
