import { hubAPI } from '../../support/formatApiPathForHub';
import { Remotes } from './constants';
import { HubRemote } from '../../../frontend/hub/administration/remotes/Remotes';
import { randomString } from '../../../framework/utils/random-string';
import { ContentTypeEnum } from '../../../frontend/hub/interfaces/expanded/ContentType';
import { HubRbacRole } from '../../../frontend/hub/interfaces/expanded/HubRbacRole';

describe('Remotes User Access tab', () => {
  let remote: HubRemote;
  let role: HubRbacRole;
  const customRole = {
    roleName: 'galaxy.' + `${randomString(5)}`,
    roleDescription: 'Manage collection remotes.',
    contentType: ContentTypeEnum.CollectionRemote,
    permission: 'galaxy.view_collectionremote',
  };

  before(() => {
    cy.createHubRoleAPI({
      roleName: customRole.roleName,
      description: customRole.roleDescription,
      content_type: ContentTypeEnum.CollectionRemote,
      permissions: [customRole.permission],
    }).then((createdRole) => {
      role = createdRole;
    });
    cy.createHubRemote().then((createdRemote) => {
      remote = createdRemote;
    });
  });

  after(() => {
    cy.deleteHubRemote(remote);
    cy.deleteHubRoleAPI(role);
  });

  beforeEach(() => {
    cy.navigateTo('hub', 'remotes');
    cy.verifyPageTitle(Remotes.title);
    cy.filterTableBySingleText(remote.name);
    cy.clickTableRowLink('name', remote.name, { disableFilter: true });
    cy.verifyPageTitle(remote.name);
  });

  function removeRoleFromListRow(roleName: string) {
    cy.clickTableRowPinnedAction(roleName, 'remove-role', false);
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.clickButton(/^Remove role/);
      cy.contains(/^Success$/).should('be.visible');
      cy.containsBy('button', /^Close$/).click();
    });
  }

  it('create a new remote, from the user access tab assign a user and apply role(s) to the user of the remote', () => {
    cy.intercept('POST', hubAPI`/_ui/v2/role_user_assignments/`).as('userRoleAssignment');
    cy.createHubUser().then((hubUser) => {
      cy.clickTab('User Access', true);
      cy.getByDataCy('add-roles').click();
      cy.verifyPageTitle('Add roles');

      cy.getWizard().within(() => {
        cy.contains('h1', 'Select user(s)').should('be.visible');
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
      cy.verifyPageTitle(remote.name);
      cy.selectTableRowByCheckbox('username', hubUser.username, {
        disableFilter: true,
      });
      cy.contains(role.name).should('be.visible');
      removeRoleFromListRow(role.name);
      cy.deleteHubUser(hubUser, { failOnStatusCode: false });
    });
  });

  it('create a new remote, from the team access tab assign a user and apply role(s) to the team of the remote', () => {
    cy.intercept('POST', hubAPI`/_ui/v2/role_team_assignments/`).as('teamRoleAssignment');
    cy.createHubTeam().then((hubTeam) => {
      cy.clickTab('Team Access', true);
      cy.getByDataCy('add-roles').click();
      cy.verifyPageTitle('Add roles');

      cy.getWizard().within(() => {
        cy.contains('h1', 'Select team(s)').should('be.visible');
        cy.selectTableRow(hubTeam.name);
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
      cy.verifyPageTitle(remote.name);
      cy.selectTableRowByCheckbox('team-name', hubTeam.name, {
        disableFilter: false,
      });
      cy.contains(role.name).should('be.visible');
      removeRoleFromListRow(role.name);
      cy.deleteHubTeam(hubTeam, { failOnStatusCode: false });
    });
  });
});
