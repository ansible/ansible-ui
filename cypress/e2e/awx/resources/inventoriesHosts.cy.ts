import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { User } from '../../../../frontend/awx/interfaces/User';

describe('inventory host', () => {
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
    const inventoryName = 'E2E Inventory host ' + randomString(4);
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
      `/infrastructure/inventories/inventory/${inventory.id}/hosts/?page=1&perPage=10&host=name`
    );
    cy.clickPageAction('delete-inventory');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete inventory/);
    cy.verifyPageTitle('Inventories');
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('can create and delete a inventory host', () => {
    const hostName = 'E2E Inventory host ' + randomString(4);
    cy.clickButton(/^Create host$/);
    cy.verifyPageTitle('Create Host');
    cy.get('[data-cy="name"]').type(hostName);
    cy.get('[data-cy="description"]').type('This is a description');
    cy.typeMonacoTextField('test: true');
    cy.clickButton(/^Create host/);
    cy.hasDetail(/^Name$/, hostName);
    cy.hasDetail(/^Description$/, 'This is a description');
    cy.hasDetail(/^Variables$/, 'test: true');
    cy.selectDetailsPageKebabAction('delete-host');
    cy.get('[data-cy="empty-state-title"]').contains(
      /^There are currently no hosts added to this inventory./
    );
  });
});
