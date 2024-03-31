import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { User } from '../../../../frontend/awx/interfaces/User';

describe('host and inventory host', () => {
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

  after(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('can create, edit and delete a inventory host', () => {
    cy.visit(`/infrastructure/inventories/inventory/${inventory.id}/details`);
    cy.clickTab(/^Hosts$/, true);
    createAndEditAndDeleteHost(true, inventory);
  });

  it('can create, edit and delete a host', () => {
    cy.visit(`/infrastructure/hosts`);
    createAndEditAndDeleteHost(false, inventory);
  });

  it('can work with groups tab', () => {
    cy.createInventoryHostGroup(organization).then((result) => {
      const { inventory, host, group } = result;
      cy.visit('/infrastructure/hosts?page=1&perPage=10&sort=name');
      cy.searchAndDisplayResource(host.name || '');
      cy.contains(host.name || '').click();
      expect(host.inventory).to.eq(inventory.id);
      expect(group.inventory).to.eq(inventory.id);
      cy.clickLink(/^Groups$/);
      cy.get('[data-cy="edit-group"]').click();
      cy.verifyPageTitle('Edit group');
      cy.get('[data-cy="name-form-group"]').type('-changed name');
      cy.get('[data-cy="Submit"]').click();
      cy.verifyPageTitle(group.name + '-changed name');
    });
  });

  function createAndCheckHost(inventory_host: boolean, inventory: Inventory) {
    const hostName = 'E2E Inventory host ' + randomString(4);

    if (inventory_host) {
      cy.get('[data-cy="empty-state-title"]').contains(
        /^There are currently no hosts added to this inventory./
      );
    }

    // create
    cy.clickButton(/^Create host$/);
    cy.verifyPageTitle('Create Host');
    cy.get('[data-cy="name"]').type(hostName);
    cy.get('[data-cy="description"]').type('This is the description');

    if (!inventory_host) {
      cy.get(`[data-cy="inventory-id"]`).click();
      cy.contains('button', 'Browse').click();
      cy.contains('Select Inventory');
      cy.get(`[aria-label="Select Inventory"]`).within(() => {
        cy.searchAndDisplayResource(inventory.name);
        cy.get(`[data-cy="checkbox-column-cell"] input`).click();
        cy.contains('button', 'Confirm').click();
      });
      cy.get(`[aria-label="Select Inventory"]`).should('not.exist');
    }

    cy.getByDataCy('variables').type('test: true');
    cy.clickButton(/^Create host/);
    cy.hasDetail(/^Name$/, hostName);
    cy.hasDetail(/^Description$/, 'This is the description');
    cy.hasDetail(/^Variables$/, 'test: true');

    return hostName;
  }

  function editHost(inventoryID: number, inventory_host: boolean, hostName: string) {
    if (inventory_host) {
      cy.visit(
        `/infrastructure/inventories/inventory/${inventoryID}/hosts/?page=1&perPage=10&sort=name`
      );
    } else {
      cy.visit('/infrastructure/hosts?page=1&perPage=10&sort=name');
    }
    cy.searchAndDisplayResource(hostName);

    cy.get(`[data-cy='edit-host']`).click();
    cy.verifyPageTitle('Edit host');
    cy.get('[data-cy="description"]').clear().type('This is the description edited');
    cy.get(`[data-cy='Submit']`).click();

    cy.hasDetail(/^Description$/, 'This is the description edited');
  }

  function deleteHost(inventoryID: number, inventory_host: boolean, hostName: string) {
    if (inventory_host) {
      cy.visit(
        `/infrastructure/inventories/inventory/${inventoryID}/hosts/?page=1&perPage=10&sort=name`
      );
    } else {
      cy.visit('/infrastructure/hosts?page=1&perPage=10&sort=name');
    }
    cy.searchAndDisplayResource(hostName);
    cy.contains(hostName).click();
    cy.selectDetailsPageKebabAction('delete-host');

    if (inventory_host) {
      cy.get('[data-cy="empty-state-title"]').contains(
        /^There are currently no hosts added to this inventory./
      );
    } else {
      cy.searchAndDisplayResource(hostName);
      cy.contains('No results found');
    }
  }

  function createAndEditAndDeleteHost(inventory_host: boolean, inventory: Inventory) {
    //create
    const hostName = createAndCheckHost(inventory_host, inventory);

    // edit
    editHost(inventory.id, inventory_host, hostName);
    // delete
    deleteHost(inventory.id, inventory_host, hostName);
  }
});
