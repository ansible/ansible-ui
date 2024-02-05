import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { User } from '../../../../frontend/awx/interfaces/User';

describe('inventory group', () => {
  let organization: Organization;
  let inventory: Inventory;
  let user: User;

  before(() => {
    cy.awxLogin();
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxInventory({ organization: organization.id }).then((inv) => {
        inventory = inv;
      });
      cy.createAwxUser(organization).then((testUser) => {
        user = testUser;
      });
    });
  });

  beforeEach(() => {
    const inventoryName = 'E2E Inventory group ' + randomString(4);
    cy.navigateTo('awx', 'inventories');
    cy.verifyPageTitle('Inventories');
    cy.clickButton(/^Create inventory$/);
    cy.clickLink(/^Create inventory$/);
    cy.get('[data-cy="name"]').type(inventoryName);
    cy.selectDropdownOptionByResourceName('organization', organization.name);
    cy.get('[data-cy="prevent_instance_group_fallback"]').click();
    cy.clickButton(/^Create inventory$/);
    cy.verifyPageTitle(inventoryName);
    cy.hasDetail(/^Organization$/, organization.name);
    cy.clickLink(/^Groups$/);
  });

  afterEach(() => {
    cy.visit(
      `/infrastructure/inventories/inventory/${inventory.id}/groups?page=1&perPage=10&sort=name`
    );
    cy.clickPageAction('delete-inventory');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete inventory/);
    cy.verifyPageTitle('Inventories');
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('can create and delete a group', () => {
    const groupName = 'E2E Inventory group ' + randomString(4);
    cy.clickButton(/^Create group$/);
    cy.verifyPageTitle('Create new group');
    cy.get('[data-cy="name"]').type(groupName);
    cy.get('[data-cy="description"]').type('This is a description');
    cy.typeMonacoTextField('test: true');
    cy.clickButton(/^Save/);
    cy.hasDetail(/^Name$/, groupName);
    cy.hasDetail(/^Description$/, 'This is a description');
    cy.hasDetail(/^Variables$/, 'test: true');
    cy.selectDetailsPageKebabAction('delete-group');
    cy.get('[data-cy="empty-state-title"]').contains(
      /^There are currently no groups added to this inventory./
    );
  });
});
