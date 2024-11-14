import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { ContentTypeEnum } from '@ansible/hub-ui/interfaces/expanded/ContentType';
import { HubRbacRole } from '@ansible/hub-ui/interfaces/expanded/HubRbacRole';
import { HubNamespace } from '@ansible/hub-ui/namespaces/HubNamespace';
import { hubAPI } from '../../support/formatApiPathForHub';

describe('Namespace - team and user access', () => {
  let namespace: HubNamespace;
  let role: HubRbacRole;
  const customRole = {
    roleName: 'galaxy.' + `${randomString(5)}`,
    roleDescription: 'Manage Namespaces.',
    contentType: ContentTypeEnum.Namespace,
    permission: 'galaxy.view_namespace',
  };
  before(() => {
    cy.createHubRoleAPI({
      roleName: customRole.roleName,
      description: customRole.roleDescription,
      content_type: customRole.contentType,
      permissions: [customRole.permission],
    }).then((createdRole) => {
      role = createdRole;
    });
    cy.createHubNamespace().then((namespaceResult) => {
      namespace = namespaceResult;
    });
  });

  after(() => {
    cy.deleteHubNamespace({ ...namespace, failOnStatusCode: false });
    cy.deleteHubRoleAPI(role);
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
      cy.contains(/^Success$/).should('be.visible');
      cy.containsBy('button', /^Close$/).click();
    });
  }

  it('create a new namespace, from the user access tab assign a user and apply role(s) to the user of the namespace', () => {
    cy.intercept('POST', hubAPI`/_ui/v2/role_user_assignments/`).as('userRoleAssignment');
    cy.createHubUser().then((hubUser) => {
      cy.intercept('GET', hubAPI`/_ui/v2/role_user_assignments/*`).as('userRoleAssignments');
      cy.clickTab('User Access', true);
      cy.wait('@userRoleAssignments');
      cy.getByDataCy('add-roles').click();
      cy.getWizard().within(() => {
        cy.contains('h1', 'Select user(s)').should('be.visible');
        cy.selectTableRow(hubUser.username);
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
      cy.getModal().within(() => {
        cy.clickButton(/^Close$/);
      });
      cy.getModal().should('not.exist');
      cy.verifyPageTitle(namespace.name);
      cy.selectTableRowByCheckbox('username', hubUser.username, {
        disableFilter: true,
      });
      cy.contains(role.name).should('be.visible');
      removeRoleFromListRow(role.name);
      cy.deleteHubUser(hubUser, { failOnStatusCode: false });
    });
  });

  it('create a new namespace, from the team access tab assign a user and apply role(s) to the team of the namespace', () => {
    cy.intercept('POST', hubAPI`/_ui/v2/role_team_assignments/`).as('teamRoleAssignment');
    cy.createHubTeam().then((hubTeam) => {
      cy.intercept('GET', hubAPI`/_ui/v2/role_team_assignments/*`).as('teamRoleAssignment');
      cy.clickTab('Team Access', true);
      cy.wait('@teamRoleAssignment');
      cy.getByDataCy('add-roles').click();
      cy.getWizard().within(() => {
        cy.selectTableRow(hubTeam.name);
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
      cy.getModal().within(() => {
        cy.clickButton(/^Close$/);
      });
      cy.getModal().should('not.exist');
      cy.verifyPageTitle(namespace.name);
      cy.selectTableRowByCheckbox('team-name', hubTeam.name, {
        disableFilter: false,
      });
      cy.contains(role.name).should('be.visible');
      removeRoleFromListRow(role.name);
      cy.deleteHubTeam(hubTeam, { failOnStatusCode: false });
    });
  });
});
