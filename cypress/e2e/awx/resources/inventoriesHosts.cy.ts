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
    cy.visit(`/infrastructure/inventories/inventory/${inventory.id}/details`);
    cy.clickTab(/^Hosts$/, true);
  });

  after(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('can create and delete a inventory host', () => {
    createAndDeleteHost(true);
  });
});

describe('standalone host', () => {});

function createAndDeleteHost(inventory_host: boolean) {
  const hostName = 'E2E Inventory host ' + randomString(4);
  cy.get('[data-cy="empty-state-title"]').contains(
    /^There are currently no hosts added to this inventory./
  );
  cy.clickButton(/^Create host$/);
  cy.verifyPageTitle('Create Host');
  cy.get('[data-cy="name"]').type(hostName);
  cy.get('[data-cy="description"]').type('This is the description');
  cy.getByDataCy('variables').type('test: true');
  cy.clickButton(/^Create host/);
  cy.hasDetail(/^Name$/, hostName);
  //cy.hasDetail(/^Description$/, 'This is a description'); TODO: add after when description is fixed
  cy.hasDetail(/^Variables$/, 'test: true');
  cy.selectDetailsPageKebabAction('delete-host');
  cy.get('[data-cy="empty-state-title"]').contains(
    /^There are currently no hosts added to this inventory./
  );
}
