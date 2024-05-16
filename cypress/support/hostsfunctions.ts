import { randomString } from '../../framework/utils/random-string';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { awxAPI } from './formatApiPathForAwx';

/////////////// Assisting functions ///////////////
// this functions will be used for stand alone hosts and inventory hosts test

function createAndCheckHost(host_type: string, inventory: string) {
  // assisting functions that will create host using UI to verify UI elements are working
  // the function will also verify all values contain currect data
  // this function cover both inventory host and stand alone host
  const hostName = 'E2E Inventory host ' + randomString(4);

  if (host_type === 'inventory_host') {
    cy.getByDataCy('empty-state-title').contains(
      /^There are currently no hosts added to this inventory./
    );
  }

  // create host
  cy.clickButton(/^Create host$/);
  cy.verifyPageTitle('Create Host');
  cy.getByDataCy('name').type(hostName);
  cy.getByDataCy('description').type('This is the description');

  if (host_type === 'stand_alone_host') {
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

  // after creation - verify data is currect
  cy.getByDataCy('variables').type('test: true');
  cy.clickButton(/^Create host/);
  cy.hasDetail(/^Name$/, hostName);
  cy.hasDetail(/^Description$/, 'This is the description');
  cy.hasDetail(/^Variables$/, 'test: true');

  return hostName;
}

function editHost(inventoryID: number, host_type: string, hostName: string) {
  // function that editing host data
  // this function cover both inventory host and stand alone host
  if (host_type === 'inventory_host') {
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

function deleteHost(inventoryID: number, host_type: string, hostName: string) {
  // function for delete host
  // can use this for stand alon host and for invntory host
  // will delete and verify that all was deleted curectlly
  if (host_type === 'inventory_host') {
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
  // navigate to specific host - stand alone or inventory host
  cy.visit(url);
  cy.filterTableBySingleSelect('name', name || '');
  cy.get(data).click();
}

function disassociate() {
  //this function will disassociate a group from given host
  // this is for stand alone or invntory host
  cy.getByDataCy('disassociate').click();
  cy.clickModalConfirmCheckbox();
  cy.clickModalButton('Disassociate groups');
  cy.assertModalSuccess();
  cy.clickModalButton('Close');
}

export function checkHostGroup(host_type: string, organization: Organization) {
  // this function will get string and organization value and test host group option
  // both for inventory host and stand alone hosts
  cy.createInventoryHostGroup(organization).then((result) => {
    const { inventory, host, group } = result;
    let url = '';
    if (host_type === 'inventory_host') {
      url = `/infrastructure/inventories/inventory/${inventory.id}/hosts/?page=1&perPage=10&sort=name`;
    } else {
      url = '/infrastructure/hosts?page=1&perPage=10&sort=name';
    }
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
      // multi select will be changed in the future
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
      deleteHost(inventory.id, host_type, host.name);
    });
  });
}

export function createAndEditAndDeleteHost(host_type: string, inventory: Inventory) {
  //create
  const hostName = createAndCheckHost(host_type, inventory.name);

  // edit
  editHost(inventory.id, host_type, hostName);
  // delete
  deleteHost(inventory.id, host_type, hostName);
}
