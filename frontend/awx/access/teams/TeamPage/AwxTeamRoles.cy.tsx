import { awxAPI } from '../../../common/api/awx-utils';
import { AwxTeamRoles } from './AwxTeamRoles';

describe('AWX team roles', () => {
  const component = <AwxTeamRoles />;
  const path = '/teams/:id/roles';
  const initialEntries = [`/teams/1/roles`];
  const params = {
    path,
    initialEntries,
  };
  describe('Roles', () => {
    beforeEach(() => {
      cy.intercept('GET', awxAPI`/role_team_assignments/*`, {
        fixture: 'awxTeamRoles.json',
      });
      cy.intercept('OPTIONS', awxAPI`/role_definitions*`, {
        fixture: 'awxRoleDefinitionsOptions.json',
      });
      cy.mount(component, params);
    });
    it('Renders the list of role assignments for the team', () => {
      cy.get('table tbody').find('tr').should('have.length', 3);
    });
    it('Renders the correct columns and action buttons', () => {
      cy.get('a[data-cy="add-roles"]').should('contain', 'Add roles');
      cy.contains('th', 'Resource name');
      cy.contains('th', 'Role');
      cy.contains('th', 'Type');
    });
    it('Can remove role', () => {
      cy.intercept(
        { method: 'DELETE', url: awxAPI`/role_team_assignments/10/` },
        {
          statusCode: 204,
        }
      );
      cy.clickTableRowAction('resource-name', 'Demo Inventory', 'remove-role', {
        inKebab: false,
        disableFilter: true,
      });
      cy.get('div[role="dialog"]').within(() => {
        cy.contains('Demo Inventory');
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains('Remove role').click();
      });
      cy.get('[data-cy="status-column-cell"] > span').contains('Success');
      cy.clickButton(/^Close$/);
    });
  });
  describe('AWX team roles - empty list', () => {
    beforeEach(() => {
      cy.intercept('GET', awxAPI`/role_team_assignments/*`, {
        fixture: 'emptyList.json',
      });
      cy.intercept('OPTIONS', awxAPI`/role_definitions*`, {
        fixture: 'awxRoleDefinitionsOptions.json',
      });
      cy.mount(component, params);
    });
    it('Empty state is displayed correctly', () => {
      cy.contains(/^There are currently no roles assigned to this team.$/);
      cy.contains(/^Add a role by clicking the button below.$/);
      cy.contains('a[data-cy="add-roles"]', /^Add roles$/).should('be.visible');
    });
  });
});
