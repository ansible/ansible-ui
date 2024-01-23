import { randomString } from '../../../framework/utils/random-string';
import { Role } from '../../../frontend/hub/access/roles/Role';
import { pulpAPI } from '../../support/formatApiPathForHub';
import { Roles } from './constants';

let role: Role;

describe('Hub roles', () => {
  before(() => {
    cy.hubLogin();
    // Create a custom role
    cy.createHubRole().then((createdRole: Role) => {
      role = createdRole;
    });
  });

  after(() => {
    cy.deleteHubRole(role);
  });

  it('render the roles list page', () => {
    cy.navigateTo('hub', 'roles');
    cy.verifyPageTitle(Roles.title);
  });

  it('navigate to the details page for a role', () => {
    cy.navigateTo('hub', 'roles');
    cy.clickTableRow(role?.name);
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
      cy.verifyPageTitle(role?.name).should('be.visible');
    });
  });

  it('create a custom role', () => {
    const roleName = 'galaxy.e2e' + randomString(4);
    const roleDescription = 'E2E test role';
    cy.navigateTo('hub', 'roles');
    cy.clickLink(/^Create role$/);
    cy.get('[data-cy="name"]').type(roleName);
    cy.get('[data-cy="description"]').type(roleDescription);
    cy.get('button[data-cy="permissioncategories-0-selectedpermissions"]').click();
    cy.get('li[data-cy="change-namespace"]').click();
    cy.get('li[data-cy="delete-namespace"]').click();
    cy.clickButton(/^Create role$/);
    cy.verifyPageTitle(roleName);
    cy.get('#name').should('have.text', roleName);
    cy.get('#description').should('have.text', roleDescription);
    cy.get('[data-cy="permissions"]').should('contain', 'Change namespace');
    cy.get('[data-cy="permissions"]').should('contain', 'Delete namespace');
    // Cleanup
    cy.clickPageAction('delete-role');
    cy.get('#confirm').click();
    cy.intercept('DELETE', pulpAPI`/roles/*`).as('delete');
    cy.clickButton(/^Delete role/);
    cy.wait('@delete');
    cy.verifyPageTitle(Roles.title);
  });

  it('edit a custom role', () => {
    cy.navigateTo('hub', 'roles');
    cy.clickTableRowPinnedAction(role.name, 'edit-role');
    // Remove a permission
    cy.contains('span.pf-v5-c-chip__content', 'Change containers')
      .siblings('.pf-v5-c-chip__actions')
      .within(() => {
        cy.get('button[data-ouia-component-id="close"]').click();
      });
    cy.clickButton(/^Save role$/);
    cy.verifyPageTitle(role.name);
    cy.get('[data-cy="permissions"]').should('not.contain', 'Change containers');
  });

  it('bulk deletion dialog shows warnings for built-in roles', () => {
    cy.navigateTo('hub', 'roles');
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.get('#select-all').click();
    cy.clickToolbarKebabAction('delete-selected-roles');
    cy.contains('of the selected roles cannot be deleted because they are built-in.').should(
      'be.visible'
    );
    cy.contains('button', 'Cancel').click();
    cy.get('input[data-cy=select-all]').click();
  });

  it('delete a role from the list row action', () => {
    cy.createHubRole().then((createdRole: Role) => {
      cy.navigateTo('hub', 'roles');
      cy.clickTableRowKebabAction(createdRole.name, 'delete-role', true);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete role/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
