import { hubAPI } from '../../../common/api/formatPath';
import { HubUserRoles } from './HubUserRoles';

describe('Hub user roles', () => {
  const component = <HubUserRoles />;
  const path = '/access/users/:id/roles';
  const initialEntries = [`/access/users/1/roles`];
  const params = {
    path,
    initialEntries,
  };
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept('GET', hubAPI`/_ui/v2/role_user_assignments/?user_id=1&page=1&page_size=10`, {
        fixture: 'hubUserRoles.json',
      });
      cy.intercept('OPTIONS', hubAPI`/_ui/v2/role_definitions/`, {
        fixture: 'hubRoleDefinitionsOptions.json',
      });
    });
    it('Renders the list of role assignments for the user', () => {
      cy.mount(component, params);
      cy.get('table tbody').find('tr').should('have.length', 4);
    });
    it('Renders the correct columns and action buttons', () => {
      cy.mount(component, params);
      cy.get('a[data-cy="add-roles"]').should('contain', 'Add roles');
      cy.contains('th', 'Resource name');
      cy.contains('th', 'Role');
      cy.contains('th', 'Type');
    });
    it('can remove role', () => {
      cy.intercept(
        { method: 'DELETE', url: hubAPI`/_ui/v2/role_user_assignments/33/` },
        {
          statusCode: 204,
        }
      );
      cy.mount(component, params);
      cy.clickTableRowAction('resource-name', 'published', 'remove-role', {
        inKebab: false,
        disableFilter: true,
      });
      cy.get('div[role="dialog"]').within(() => {
        cy.contains('published');
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains('Remove role').click();
      });
      cy.get('[data-cy="status-column-cell"] > span').contains('Success');
      cy.clickButton(/^Close$/);
    });
  });
  describe('Empty list', () => {
    it('Empty state is displayed correctly', () => {
      cy.intercept('GET', hubAPI`/_ui/v2/role_user_assignments/?user_id=1&page=1&page_size=10`, {
        fixture: 'emptyList.json',
      });
      cy.intercept('OPTIONS', hubAPI`/_ui/v2/role_definitions/`, {
        fixture: 'hubRoleDefinitionsOptions.json',
      });
      cy.mount(component, params);
      cy.contains(/^There are currently no roles assigned to this user.$/);
      cy.contains(/^Add a role by clicking the button below.$/);
      cy.contains('a[data-cy="add-roles"]', /^Add roles$/).should('be.visible');
    });
  });
});
