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

function create2ndHost(host_type: string, inventory: string) {
  const hostName = 'E2E Inventory host ' + randomString(4);

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
  cy.hasDetail(/^Variables$/, 'test: true');

  return hostName;
}

function editHost(invenotryName: string, host_type: string, hostName: string) {
  // function that editing host data
  // this function cover both inventory host and stand alone host
  navigateToBaseView(host_type, invenotryName);
  cy.filterTableByMultiSelect('name', [hostName]);

  cy.getByDataCy('edit-host').click();
  cy.verifyPageTitle('Edit host');
  cy.getByDataCy('description').clear().type('This is the description edited');
  cy.getByDataCy('Submit').click();

  cy.hasDetail(/^Description$/, 'This is the description edited');
}

function deleteHost(invenotryName: string, host_type: string, hostName: string) {
  // function for delete host
  // can use this for stand alon host and for invntory host
  // will delete and verify that all was deleted curectlly
  navigateToBaseView(host_type, invenotryName);

  cy.filterTableByMultiSelect('name', [hostName]);
  cy.get(`[data-cy="actions-column-cell"] [data-cy="actions-dropdown"]`).click();
  cy.getByDataCy('delete-host').click();
  cy.clickModalConfirmCheckbox();
  cy.clickModalButton('Delete hosts');
  cy.contains('button', 'Close').click();
  cy.contains(/^No results found./);
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
    // TODO: unsafe assignment, find a better way to retrieve host id it doesn't return always
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
      deleteHost(inventory.name, host_type, host.name);
    });
  });
}

export function createAndEditAndDeleteHost(host_type: string, inventory: Inventory) {
  //create
  const hostName = createAndCheckHost(host_type, inventory.name);

  // edit
  editHost(inventory.name, host_type, hostName);
  // delete
  deleteHost(inventory.name, host_type, hostName);
}

export function testHostBulkDelete(host_type: string, inventory: Inventory) {
  //navigate to base screen
  navigateToBaseView(host_type, inventory.name);
  //create
  const hostName1 = createAndCheckHost(host_type, inventory.name);
  navigateToBaseView(host_type, inventory.name);
  const hostName2 = create2ndHost(host_type, inventory.name);
  navigateToBaseView(host_type, inventory.name);
  cy.filterTableBySingleSelect('name', hostName1);
  cy.contains(hostName1);
  navigateToBaseView(host_type, inventory.name);
  cy.filterTableBySingleSelect('name', hostName2);
  navigateToBaseView(host_type, inventory.name);
  cy.contains(hostName2);
  cy.getByDataCy('select-all').click();
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
