import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
import { hubAPI } from '../../support/formatApiPathForHub';

describe.skip('Namespace - team and user access', () => {
  let namespace: HubNamespace;
  before(() => {
    cy.createHubNamespace().then((namespaceResult) => {
      namespace = namespaceResult;
    });
  });

  after(() => {
    cy.deleteHubNamespace({ ...namespace, failOnStatusCode: false });
  });

  beforeEach(() => {
    cy.navigateTo('hub', 'namespaces');
    cy.verifyPageTitle('Namespaces');
    cy.setTableView('table');
    cy.filterTableByTextFilter('name', namespace.name, { disableFilterSelection: true });
    cy.clickTableRowLink('name', namespace.name, { disableFilter: true });
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
    });
  }

  it('create a new namespace, from the user access tab assign a user and apply role(s) to the user of the namespace', () => {
    cy.intercept('POST', hubAPI`/_ui/v2/role_user_assignments/`).as('userRoleAssignment');
    cy.createHubUser().then((hubUser) => {
      cy.clickTab('User Access', true);
      cy.getByDataCy('add-roles').click();
      cy.verifyPageTitle('Add roles');
      cy.getWizard().within(() => {
        cy.contains('h1', 'Select user(s)').should('be.visible');
        cy.selectTableRowByCheckbox('username', hubUser.username, { disableFilter: true });

        cy.clickButton(/^Next/);
        cy.contains('h1', 'Select roles to apply').should('be.visible');
        cy.filterTableByTextFilter('name', 'galaxy.collection_namespace_owner', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.collection_namespace_owner', {
          disableFilter: true,
        });
        cy.filterTableByTextFilter('name', 'galaxy.collection_publisher', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.collection_publisher', {
          disableFilter: true,
        });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Review').should('be.visible');
        cy.verifyReviewStepWizardDetails('users', [hubUser.username], '1');
        cy.verifyReviewStepWizardDetails(
          'hubRoles',
          [
            'galaxy.collection_namespace_owner',
            'Change and upload collections to namespaces.',
            'galaxy.collection_publisher',
            'Upload and modify collections.',
          ],
          '2'
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
      cy.verifyPageTitle(namespace.name);
      cy.selectTableRowByCheckbox('username', hubUser.username, {
        disableFilter: true,
      });
      removeRoleFromListRow('galaxy.collection_namespace_owner', 'user');
      cy.selectTableRowByCheckbox('username', hubUser.username, {
        disableFilter: true,
      });
      removeRoleFromListRow('galaxy.collection_publisher', 'user');
    });
  });

  it('create a new namespace, from the team access tab assign a user and apply role(s) to the team of the namespace', () => {
    cy.intercept('POST', hubAPI`/_ui/v2/role_team_assignments/`).as('teamRoleAssignment');
    cy.createHubTeam().then((hubTeam) => {
      cy.clickTab('Team Access', true);
      cy.getByDataCy('add-roles').click();
      cy.verifyPageTitle('Add roles');
      cy.getWizard().within(() => {
        cy.contains('h1', 'Select teams(s)').should('be.visible');
        cy.selectTableRowByCheckbox('name', hubTeam.name, { disableFilter: true });

        cy.clickButton(/^Next/);
        cy.contains('h1', 'Select roles to apply').should('be.visible');
        cy.filterTableByTextFilter('name', 'galaxy.collection_namespace_owner', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.collection_namespace_owner', {
          disableFilter: true,
        });
        cy.filterTableByTextFilter('name', 'galaxy.collection_publisher', {
          disableFilterSelection: true,
        });
        cy.selectTableRowByCheckbox('name', 'galaxy.collection_publisher', {
          disableFilter: true,
        });
        cy.clickButton(/^Next/);
        cy.contains('h1', 'Review').should('be.visible');
        cy.verifyReviewStepWizardDetails('teams', [hubTeam.name], '1');
        cy.verifyReviewStepWizardDetails(
          'hubRoles',
          [
            'galaxy.collection_namespace_owner',
            'Change and upload collections to namespaces.',
            'galaxy.collection_publisher',
            'Upload and modify collections.',
          ],
          '2'
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
      cy.verifyPageTitle(namespace.name);
      cy.selectTableRowByCheckbox('name', hubTeam.name, {
        disableFilter: true,
      });
      removeRoleFromListRow('galaxy.collection_namespace_owner', 'team');
      cy.selectTableRowByCheckbox('name', hubTeam.name, {
        disableFilter: true,
      });
      removeRoleFromListRow('galaxy.collection_publisher', 'team');
    });
  });
});
