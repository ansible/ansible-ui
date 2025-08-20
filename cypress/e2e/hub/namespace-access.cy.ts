import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { ContentTypeEnum } from '@ansible/hub-ui/interfaces/expanded/ContentType';
import { HubNamespace } from '@ansible/hub-ui/namespaces/HubNamespace';
import { PlatformRole } from '@ansible/platform-ui/interfaces/PlatformRole';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';

describe('Namespace - team and user access', () => {
  let namespace: HubNamespace;
  let role: PlatformRole;
  let organization: PlatformOrganization;

  const customRole = {
    roleName: 'galaxy.' + `${randomString(5)}`,
    roleDescription: 'Manage Namespaces.',
    contentType: ContentTypeEnum.Namespace,
    permission: 'galaxy.view_namespace',
  };
  before(() => {
    cy.createPlatformRole(customRole.roleName, customRole.roleDescription, customRole.contentType, [
      customRole.permission,
    ]).then((createdRole) => {
      role = createdRole as PlatformRole;
    });
    cy.createHubNamespace().then((namespaceResult) => {
      namespace = namespaceResult;
    });
    cy.createPlatformOrganization().then((org) => {
      organization = org;
    });
  });

  after(() => {
    cy.deleteHubNamespace({ ...namespace, failOnStatusCode: false });
    cy.deletePlatformRole(role);
    cy.deletePlatformOrganization(organization);
  });

  beforeEach(() => {
    cy.navigateTo('hub', 'namespaces');
    cy.verifyPageTitle('Namespaces');
    cy.setTableView('table');
    cy.filterTableByTextFilter('name', namespace.name, { disableFilterSelection: true });
    cy.clickTableRowLink('name', namespace.name, { disableFilter: true });
  });

  function removeRoleFromListRow(roleName: string) {
    cy.clickTableRowPinnedAction(roleName, 'remove-role', false);
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.clickButton(/^Remove role/);
      //cy.contains(/^Success$/).should('be.visible');
    });
  }

  it('create a new namespace, from the user access tab assign a user and apply role(s) to the user of the namespace', () => {
    cy.intercept('POST', gatewayAPI`/role_user_assignments/`).as('userRoleAssignment');
    cy.createHubUser().then((hubUser) => {
      cy.intercept('GET', gatewayAPI`/role_user_assignments/*`).as('userRoleAssignments');
      cy.clickTab('User Access', true);
      cy.getByDataCy('assign-users').click();
      cy.getWizard().within(() => {
        cy.contains('h1', 'Select user(s)').should('be.visible');
        cy.filterTableByTextFilter('name', hubUser.username, {
          disableFilterSelection: true,
        });
        cy.getTableRowByText(hubUser.username, false).within(() => {
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
      cy.verifyPageTitle(namespace.name);
    });
  });

  it('create a new namespace, from the team access tab assign a user and apply role(s) to the team of the namespace', () => {
    cy.intercept('POST', gatewayAPI`/role_team_assignments/`).as('teamRoleAssignment');
    cy.createPlatformTeam({ organization: organization?.id }).then((hubTeam) => {
      cy.intercept('GET', gatewayAPI`/role_team_assignments/*`).as('teamRoleAssignment');
      cy.clickTab('Team Access', true);
      cy.wait('@teamRoleAssignment');
      cy.getByDataCy('assign-teams').click();
      cy.getWizard().within(() => {
        cy.filterTableByTextFilter('name', hubTeam.name, {
          disableFilterSelection: true,
        });
        cy.getTableRowByText(hubTeam.name, false).within(() => {
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
      cy.verifyPageTitle(namespace.name);
      cy.selectTableRowByCheckbox('team-name', hubTeam.name, {
        disableFilter: false,
      });
      cy.contains(role.name).should('be.visible');
      removeRoleFromListRow(role.name);
      cy.deletePlatformTeam(hubTeam, { failOnStatusCode: false });
    });
  });
});
