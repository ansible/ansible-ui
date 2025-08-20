import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { HubRemote } from '@ansible/hub-ui/administration/remotes/Remotes';
import { ContentTypeEnum } from '@ansible/hub-ui/interfaces/expanded/ContentType';
import { Remotes } from './constants';
import { PlatformRole } from '@ansible/platform-ui/interfaces/PlatformRole';
import { gatewayAPI } from '@ansible/platform-ui/utils/gateway-api-utils';
import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';

describe('Remotes User Access tab', () => {
  let remote: HubRemote;
  let role: PlatformRole;
  let organization: PlatformOrganization;
  const customRole = {
    roleName: 'galaxy.' + `${randomString(5)}`,
    roleDescription: 'Manage collection remotes.',
    contentType: ContentTypeEnum.CollectionRemote,
    permission: 'galaxy.view_collectionremote',
  };

  before(() => {
    cy.createPlatformRole(
      customRole.roleName,
      customRole.roleDescription,
      ContentTypeEnum.CollectionRemote,
      [customRole.permission]
    ).then((createdRole) => {
      role = createdRole as PlatformRole;
    });
    cy.createHubRemote().then((createdRemote) => {
      remote = createdRemote;
    });
    cy.createPlatformOrganization().then((org) => {
      organization = org;
    });
  });

  after(() => {
    cy.deleteHubRemote(remote);
    cy.deletePlatformRole(role);
    cy.deletePlatformOrganization(organization);
  });

  beforeEach(() => {
    cy.navigateTo('hub', 'remotes');
    cy.verifyPageTitle(Remotes.title);
    cy.filterTableBySingleText(remote.name);
    cy.clickTableRowLink('name', remote.name, { disableFilter: true });
    cy.verifyPageTitle(remote.name);
  });

  it('create a new remote, from the user access tab assign a user and apply role(s) to the user of the remote', () => {
    cy.intercept('POST', gatewayAPI`/role_user_assignments/`).as('userRoleAssignment');
    cy.createHubUser().then((hubUser) => {
      cy.intercept('GET', gatewayAPI`/role_user_assignments/*`).as('userRoleAssignments');
      cy.clickTab('User Access', true);
      cy.getByDataCy('assign-users').click();
      cy.verifyPageTitle('Assign users');
      cy.getWizard().within(() => {
        cy.contains('h1', 'Select user(s)').should('be.visible');
        cy.filterTableByTextFilter('name', hubUser.username, { disableFilterSelection: true });
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
      cy.verifyPageTitle(remote.name);
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
  it('create a new remote, from the team access tab assign a user and apply role(s) to the team of the remote', () => {
    cy.intercept('POST', gatewayAPI`/role_team_assignments/`).as('teamRoleAssignment');
    cy.createPlatformTeam({ organization: organization?.id }).then((hubTeam) => {
      cy.intercept('GET', gatewayAPI`/role_team_assignments/*`).as('teamRoleAssignment');
      cy.clickTab('Team Access', true);
      cy.wait('@teamRoleAssignment');
      cy.getByDataCy('assign-teams').click();
      cy.verifyPageTitle('Assign teams');

      cy.getWizard().within(() => {
        cy.contains('h1', 'Select team(s)').should('be.visible');
        cy.filterTableByTextFilter('name', hubTeam.name, {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', hubTeam.name, {
          disableFilter: true,
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
      cy.verifyPageTitle(remote.name);
      cy.selectTableRowByCheckbox('team-name', hubTeam.name, {
        disableFilter: false,
      });
      cy.contains(role.name).should('be.visible');
      removeRoleFromListRow(role.name);
      cy.deletePlatformTeam(hubTeam, { failOnStatusCode: false });
    });
  });
});
