import { awxAPI } from '../../../common/api/awx-utils';
import { UserRoles } from './UserRoles';

describe('AWX user roles', () => {
  const component = <UserRoles />;
  const path = '/users/:id/roles';
  const initialEntries = [`/users/1/roles`];
  const params = {
    path,
    initialEntries,
  };
  describe('Roles', () => {
    beforeEach(() => {
      cy.intercept('GET', awxAPI`/role_user_assignments/*`, {
        fixture: 'awxUserRoles.json',
      });
      cy.intercept('OPTIONS', awxAPI`/role_definitions*`, {
        fixture: 'awxRoleDefinitionsOptions.json',
      });
      cy.mount(component, params);
    });
    it('Renders the list of role assignments for the user', () => {
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
        { method: 'DELETE', url: awxAPI`/role_user_assignments/249/` },
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
  describe('AWX user roles - empty list', () => {
    beforeEach(() => {
      cy.intercept('GET', awxAPI`/role_user_assignments/*`, {
        fixture: 'emptyList.json',
      });
      cy.intercept('OPTIONS', awxAPI`/role_definitions*`, {
        fixture: 'awxRoleDefinitionsOptions.json',
      });
      cy.mount(component, params);
    });
    it('Empty state is displayed correctly', () => {
      cy.contains(/^There are currently no roles assigned to this user.$/);
      cy.contains(/^Add a role by clicking the button below.$/);
      cy.contains('a[data-cy="add-roles"]', /^Add roles$/).should('be.visible');
    });
  });
});
