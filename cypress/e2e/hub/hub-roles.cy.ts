import { Role } from '../../../frontend/hub/access/roles/Role';
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
      // TODO: Uncomment when roles details page is implemented
      // cy.verifyPageTitle(roleName).should('be.visible');
    });
  });

  it('bulk deletion dialog shows warnings for built-in roles', () => {
    cy.navigateTo('hub', 'roles');
    cy.get('#select-all').click();
    cy.clickToolbarKebabAction(/^Delete selected roles$/);
    cy.contains('of the selected roles cannot be deleted because they are built-in.').should(
      'be.visible'
    );
    cy.contains('button', 'Cancel').click();
    cy.get('input[data-cy=select-all]').click();
  });

  it('delete a role from the list row action', () => {
    cy.createHubRole().then((createdRole: Role) => {
      cy.navigateTo('hub', 'roles');
      cy.clickTableRowKebabAction(createdRole.name, /^Delete role$/, true);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete role/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
