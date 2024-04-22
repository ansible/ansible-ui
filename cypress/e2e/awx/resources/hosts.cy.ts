import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('host and inventory host', () => {
  let organization: Organization;
  let inventory: Inventory;
  let user: AwxUser;

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

  //tests
  it.skip('can create, edit and delete a inventory host', () => {
    cy.visit(`/infrastructure/inventories/inventory/${inventory.id}/details`);
    cy.clickTab(/^Hosts$/, true);
    createAndEditAndDeleteHost(true, inventory);
  });

  it.skip('can create, edit and delete a host', () => {
    cy.visit(`/infrastructure/hosts`);
    createAndEditAndDeleteHost(false, inventory);
  });

  it.skip('can create, edit, assosiat and disassosiate groups at inventory -> hosts -> groups tab', () => {
    // create host and groups at inventory
    // test edit group from inventory -> hosts -> groups tab
    // test dissasositate and assosiate of singal group or multipale groups at
    // invenotry -> hosts -> groups tab
  });

  it('can create, edit, assosiat and disassosiate groups at stand alone host groups tab', () => {
    const url = '/infrastructure/hosts?page=1&perPage=10&sort=name';
    cy.createInventoryHostGroup(organization).then((result) => {
      const { inventory, host, group } = result;
      // TODO: unsafe assignment, find a better way to retrieve host id it doesn't return always
      const hostid = host.id ? host.id.toString() : '';
      navigateToHost(url, host.name, '[data-cy="name-column-cell"] a');
      expect(host.inventory).to.eq(inventory.id);
      expect(group.inventory).to.eq(inventory.id);
      cy.clickLink(/^Groups$/);
      //check edit group
      cy.getByDataCy('edit-group').click();
      cy.verifyPageTitle('Edit group');
      cy.getByDataCy('name-form-group').type('-changed');
      cy.getByDataCy('Submit').click();
      cy.verifyPageTitle(group.name + '-changed');
      cy.requestPost<{ name: string; inventory: number; id: number }>(
        awxAPI`/hosts/${hostid}/groups/`,
        {
          name: 'E2E Group ' + randomString(5),
          inventory: host.inventory,
        }
      ).then((group: { name: string; id: number }) => {
        /// check multiple associate and disassociate
        // disassociate
        navigateToHost(url, host.name, '[data-cy="name-column-cell"] a');
        cy.clickLink(/^Groups$/);
        cy.getByDataCy('select-all').click();
        disassociate();
        cy.getByDataCy('empty-state-title').contains(
          /^There are currently no groups associated with this host/
        );
        // Add - multi groups
        cy.clickButton(/^Associate groups$/);
        cy.getByDataCy('select-all').click();
        cy.clickModalButton('Confirm');
        cy.contains('button', 'Close').click();
        cy.contains(group.name);
        /// single disassociate
        // TODO: need to change this when
        // https://issues.redhat.com/browse/AAP-22914 change will applyed
        cy.filterTableByMultiSelect('name', [group.name]);
        cy.get(`[data-cy="row-id-${group.id}"] [data-cy="checkbox-column-cell"]`).click();
        disassociate();
        navigateToHost(url, host.name, '[data-cy="name-column-cell"] a');
        cy.clickLink(/^Groups$/);
        cy.contains(group.name).should('not.exist');
        //check single associate
        cy.getByDataCy('associate').click();
        cy.get(`[data-cy="row-id-${group.id}"] [data-cy="checkbox-column-cell"]`).click();
        cy.clickModalButton('Confirm');
        cy.contains('button', 'Close').click();
        cy.contains(group.name);
      });
    });
  });

  it.skip('can see, launch and cancel jobs from inventory -> hosts -> jobs tab', () => {
    // create new host at inventory
    // create job template with the current inventory
    // job type must be run.
    // TODO: check if there is a function for that
    // launch job
    // got to inventory hosts tab - make sure job is visible in jobs tab
    // launch it for all hosts
    // verify
    // lanuch it for all failed hosts
    // cancel launch
  });

  it.skip('can view host facts in inventory host tab', () => {
    // create host at invenotry create facts for host
    // TODO: check if there is some function that creating facts
    // make sure facts are visibule to the user at inventory -> hosts -> facts tab
  });

  it.skip('can see, launch and cancel jobs from host jobs tab', () => {
    // create new host
    // create job template with the current inventory
    // job type must be run.
    // TODO: check if there is a function for that
    // launch job
    // got to host - make sure job is visible
    // launch it for all hosts
    // verify
    // lanuch it for all failed hosts
    // cancel launch
  });

  it.skip('can view host facts in stand alone host', () => {
    // create stand alone host with facts
    // TODO: check if there is some function that creates facts
    // make sure facts are visible to the user
  });

  // assisting functions
  function createAndCheckHost(inventory_host: boolean, inventory: string) {
    const hostName = 'E2E Inventory host ' + randomString(4);

    if (inventory_host) {
      cy.getByDataCy('empty-state-title').contains(
        /^There are currently no hosts added to this inventory./
      );
    }

    // create
    cy.clickButton(/^Create host$/);
    cy.verifyPageTitle('Create Host');
    cy.getByDataCy('name').type(hostName);
    cy.getByDataCy('description').type('This is the description');

    if (!inventory_host) {
      cy.getByDataCy('inventory-id').click();
      cy.contains('button', 'Browse').click();
      cy.contains('Select Inventory');
      cy.get(`[aria-label="Select Inventory"]`).within(() => {
        cy.filterTableBySingleSelect('name', inventory);
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
    cy.filterTableByMultiSelect('name', [hostName]);

    cy.getByDataCy('edit-host').click();
    cy.verifyPageTitle('Edit host');
    cy.getByDataCy('description').clear().type('This is the description edited');
    cy.getByDataCy('Submit').click();

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

    cy.filterTableByMultiSelect('name', [hostName]);
    cy.get(`[data-cy="actions-column-cell"] [data-cy="actions-dropdown"]`).click();
    cy.getByDataCy('delete-host').click();
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Delete hosts');
    cy.contains('button', 'Close').click();
    cy.contains(/^No results found./);
  }

  function navigateToHost(url: string, name: string, data: string) {
    cy.visit(url);
    cy.filterTableBySingleSelect('name', name || '');
    cy.get(data).click();
  }

  function disassociate() {
    cy.getByDataCy('disassociate').click();
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Disassociate groups');
    cy.assertModalSuccess();
    cy.clickModalButton('Close');
  }

  function createAndEditAndDeleteHost(inventory_host: boolean, inventory: Inventory) {
    //create
    const hostName = createAndCheckHost(inventory_host, inventory.name);

    // edit
    editHost(inventory.id, inventory_host, hostName);
    // delete
    deleteHost(inventory.id, inventory_host, hostName);
  }
});
