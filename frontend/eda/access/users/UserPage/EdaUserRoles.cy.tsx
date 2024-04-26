import { edaAPI } from '../../../common/eda-utils';
import { EdaUserRoles } from './EdaUserRoles';

describe('EDA user roles', () => {
  const component = <EdaUserRoles />;
  const path = '/users/:id/roles';
  const initialEntries = [`/users/1/roles`];
  const params = {
    path,
    initialEntries,
  };
  describe('Roles', () => {
    beforeEach(() => {
      cy.intercept('GET', edaAPI`/role_user_assignments/*`, {
        fixture: 'edaUserRoles.json',
      });
      cy.intercept('OPTIONS', edaAPI`/role_definitions*`, {
        fixture: 'edaRoleDefinitionsOptions.json',
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
    it('can remove role', () => {
      cy.intercept(
        { method: 'DELETE', url: edaAPI`/role_user_assignments/10/` },
        {
          statusCode: 204,
        }
      );
      cy.clickTableRowAction('resource-name', 'Project VN', 'remove-role', {
        inKebab: false,
        disableFilter: true,
      });
      cy.get('div[role="dialog"]').within(() => {
        cy.contains('Project VN');
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains('Remove role').click();
      });
      cy.get('[data-cy="status-column-cell"] > span').contains('Success');
      cy.clickButton(/^Close$/);
    });
  });
  describe('EDA user roles - empty list', () => {
    beforeEach(() => {
      cy.intercept('GET', edaAPI`/role_user_assignments/*`, {
        fixture: 'emptyList.json',
      });
      cy.intercept('OPTIONS', edaAPI`/role_definitions*`, {
        fixture: 'edaRoleDefinitionsOptions.json',
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
