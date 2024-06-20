import { randomString } from '../../framework/utils/random-string';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { awxAPI } from './formatApiPathForAwx';
import { AwxHost } from '../../frontend/awx/interfaces/AwxHost';

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
    cy.getByDataCy('inventory').click();
    cy.contains('button', 'Browse').click();
    cy.getModal().within(() => {
      cy.filterTableBySingleSelect('name', inventory);
      cy.get(`[data-cy="checkbox-column-cell"] input`).click();
      cy.contains('button', 'Confirm').click();
    });
  }

  // after creation - verify data is currect
  cy.getByDataCy('variables').type('test: true');
  cy.clickButton(/^Create host/);
  cy.hasDetail(/^Name$/, hostName);
  cy.hasDetail(/^Description$/, 'This is the description');
  cy.get('[data-cy="code-block-value"]').should('contains.text', 'test: true');

  return hostName;
}

function createHost(host_type: string, inventoryID: number) {
  // create host with no verify
  if (host_type === 'inventory_host') {
    cy.awxRequestPost<Partial<AwxHost>, AwxHost>(awxAPI`/hosts/`, {
      name: 'E2E Host ' + randomString(4),
      inventory: inventoryID,
    });
  } else {
    cy.awxRequestPost<Partial<AwxHost>, AwxHost>(awxAPI`/hosts/`, {
      name: 'E2E Host ' + randomString(4),
    });
  }
}

function editHost(inventoryName: string, host_type: string, hostName: string, view: string) {
  // function that editing host data from list or details views
  // this function cover both inventory host and stand alone host
  if (view === 'list') {
    navigateToBaseView(host_type, inventoryName);
    cy.filterTableByMultiSelect('name', [hostName]);
  } else {
    // for details view
    navigateToHost(host_type, hostName, '[data-cy="name-column-cell"] a', inventoryName);
  }

  cy.getByDataCy('edit-host').click();
  cy.verifyPageTitle('Edit host');
  cy.getByDataCy('description').clear().type('This is the description edited');
  cy.getByDataCy('Submit').click();
  cy.hasDetail(/^Description$/, 'This is the description edited');
}

function deleteHostListView(inventoryName: string, host_type: string, hostName: string) {
  // function for delete host
  // can use this for stand alon host and for invntory host
  // will delete and verify that all was deleted curectlly
  navigateToBaseView(host_type, inventoryName);
  cy.filterTableByMultiSelect('name', [hostName]);
  cy.get(`[data-cy="actions-column-cell"] [data-cy="actions-dropdown"]`).click();
  cy.getByDataCy('delete-host').click();
  cy.clickModalConfirmCheckbox();
  cy.clickModalButton('Delete hosts');
  cy.contains('button', 'Close').click();
  cy.contains(/^No results found./);
}

function deleteHostDetailsView(inventoryName: string, host_type: string, hostName: string) {
  // function for delete host
  // can use this for stand alon host and for invntory host
  // will delete and verify that all was deleted curectlly

  navigateToHost(host_type, hostName, '[data-cy="name-column-cell"] a', inventoryName);
  cy.getByDataCy('actions-dropdown').click();
  cy.getByDataCy('delete-host').click();
  cy.clickModalConfirmCheckbox();
  cy.clickModalButton('Delete hosts');
  cy.contains(/^There are currently no hosts added to this inventory./);
}

function deleteInventoryHosts(inventory: Inventory) {
  //function to delete all hosts from inventory
  navigateToBaseView('inventory_host', inventory.name);
  cy.getByDataCy('select-all').click();
  cy.clickToolbarKebabAction('delete-selected-hosts');
  cy.contains('Permanently delete hosts');
  cy.clickModalConfirmCheckbox();
  cy.contains('button', 'Delete hosts').click();
  cy.contains('button', 'Close').click();
  cy.getByDataCy('empty-state-title').contains(
    /^There are currently no hosts added to this inventory./
  );
}

function navigateToHost(host_type: string, name: string, data: string, inventoryName: string) {
  // navigate to specific host - stand alone or inventory host
  navigateToBaseView(host_type, inventoryName);
  cy.filterTableBySingleSelect('name', name || '');
  cy.get(data).click();
}

function navigateToBaseView(host_type: string, inventoryName: string) {
  //function for navigeate to host list view or inventory host list view
  if (host_type === 'inventory_host') {
    cy.navigateTo('awx', 'inventories');
    cy.filterTableBySingleSelect('name', inventoryName);
    cy.clickTableRowLink('name', inventoryName, { disableFilter: true });
    cy.verifyPageTitle(inventoryName);
    cy.contains(`[role="tablist"] [role="tab"]`, 'Hosts').click();
  } else {
    cy.navigateTo('awx', 'hosts');
  }
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
    const hostid = host.id ? host.id.toString() : '';
    navigateToHost(host_type, host.name, '[data-cy="name-column-cell"] a', inventory.name);
    expect(host.inventory).to.eq(inventory.id);
    expect(group.inventory).to.eq(inventory.id);
    cy.clickLink(/^Groups$/);
    //check edit group
    cy.getByDataCy('edit-group').click();
    cy.verifyPageTitle('Edit group');
    cy.getByDataCy('name-form-group').type('-changed');
    cy.getByDataCy('Submit').click();
    cy.verifyPageTitle(group.name + '-changed');
    //create 2nd group
    cy.requestPost<{ name: string; inventory: number; id: number }>(
      awxAPI`/hosts/${hostid}/groups/`,
      {
        name: 'E2E Group ' + randomString(5),
        inventory: host.inventory,
      }
    ).then((group2: { name: string; id: number }) => {
      /// check multiple associate and disassociate
      // disassociate
      navigateToHost(host_type, host.name, '[data-cy="name-column-cell"] a', inventory.name);
      cy.clickLink(/^Groups$/);
      cy.contains(group2.name);
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
      cy.contains(group2.name);
      /// single disassociate
      // TODO: need to change this when
      // https://issues.redhat.com/browse/AAP-22914 change will applyed
      // multi select will be changed in the future
      cy.filterTableByMultiSelect('name', [group.name]);
      cy.get(`[data-cy="row-id-${group.id}"] [data-cy="checkbox-column-cell"]`).click();
      disassociate();
      navigateToHost(host_type, host.name, '[data-cy="name-column-cell"] a', inventory.name);
      cy.clickLink(/^Groups$/);
      cy.contains(group.name).should('not.exist');
      //check single associate
      cy.getByDataCy('associate').click();
      cy.get(`[data-cy="row-id-${group.id}"] [data-cy="checkbox-column-cell"]`).click();
      cy.clickModalButton('Confirm');
      cy.contains('button', 'Close').click();
      cy.contains(group.name);
      deleteInventoryHosts(inventory);
    });
  });
}

export function createAndEditAndDeleteHost(host_type: string, inventory: Inventory, view: string) {
  //this function will call create host and verify function
  //base on view - list or details will call the right function to edit and delete the host

  //navigate to base view
  navigateToBaseView(host_type, inventory.name);

  //create host
  const hostName = createAndCheckHost(host_type, inventory.name);
  //
  editHost(inventory.name, host_type, hostName, view);

  if (view === 'list') {
    // delete
    deleteHostListView(inventory.name, host_type, hostName);
  } else {
    // delete
    deleteHostDetailsView(inventory.name, host_type, hostName);
  }
}

export function testHostBulkDelete(host_type: string, inventory: Inventory) {
  //create 2 hosts
  createHost(host_type, inventory.id);
  createHost(host_type, inventory.id);

  navigateToBaseView(host_type, inventory.name);
  // wait for 3 rows in the table - header and 2 hosts
  cy.get(`[aria-label="Simple table"] tr`).should('have.length', 3);

  cy.getByDataCy('select-all').click();
  cy.contains('2 selected');
  cy.clickToolbarKebabAction('delete-selected-hosts');
  cy.contains('Permanently delete hosts');
  cy.clickModalConfirmCheckbox();
  cy.contains('button', 'Delete hosts').click();
  cy.contains('button', 'Close').click();
  if (host_type === 'inventory_host') {
    cy.getByDataCy('empty-state-title').contains(
      /^There are currently no hosts added to this inventory./
    );
  }
}

export function testMissingButton(
  host_type: string,
  inventory: Inventory,
  view: string,
  missing: string
) {
  //navigate to list view and check host existing
  //in case this should be done to detailes view the only thing needed is to add click on host name
  navigateToBaseView(host_type, inventory.name);
  cy.get(`[aria-label="Simple table"] tr`).should('have.length', 2);
  cy.contains('button', missing).should('not.exist');
}

export function testMissingTab(
  host_type: string,
  inventory: Inventory,
  view: string,
  missing: string
) {
  //navigate to list view and check host existing
  //get to host to verify tab is missing
  navigateToBaseView(host_type, inventory.name);
  cy.get(`[aria-label="Simple table"] tr`).should('have.length', 2);
  cy.getByDataCy('name-column-cell').contains('E2E Host').click();
  cy.contains('tab', missing).should('not.exist');
}
