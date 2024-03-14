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
    createAndEditAndDeleteHost(true, inventory.name);
  });

  it('can create, edit and delete a host', () => {
    cy.visit(`/infrastructure/hosts`);
    createAndEditAndDeleteHost(false, inventory.name);
  });
});

function createAndEditAndDeleteHost(inventory_host: boolean, inventory: string) {
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
      cy.searchAndDisplayResource(inventory);
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

  // edit
  cy.get(`[data-cy='edit-host']`).click();
  cy.get('[data-cy="description"]').clear().type('This is the description edited');

  cy.get(`[data-cy='Submit']`).click();
  cy.hasDetail(/^Description$/, 'This is the description edited');

  // delete
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
