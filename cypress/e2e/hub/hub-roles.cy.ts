import { randomString } from '../../../framework/utils/random-string';
import { Roles } from './constants';

const roleName = `galaxy.e2erole${randomString(4)}`;

describe('Hub roles', () => {
  before(() => {
    cy.hubLogin();
    // Create a custom role
    cy.createHubRole({
      name: roleName,
      description: `Description for ${roleName}`,
      permissions: ['galaxy.add_namespace', 'container.namespace_change_containerdistribution'],
    });
  });

  after(() => {
    cy.deleteHubRole(roleName);
  });

  it('render the roles list page', () => {
    cy.navigateTo('hub', 'roles');
    cy.verifyPageTitle(Roles.title);
  });

  it('navigate to the details page for a role', () => {
    cy.navigateTo('hub', 'roles');
    cy.clickTableRow(roleName);
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
    const testRoleName = `galaxy.e2erole${randomString(4)}`;
    cy.createHubRole({
      name: testRoleName,
      description: `Description for ${testRoleName}`,
      permissions: ['galaxy.add_namespace', 'container.namespace_change_containerdistribution'],
    });
    cy.navigateTo('hub', 'roles');
    cy.clickTableRowKebabAction(testRoleName, /^Delete role$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete role/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
