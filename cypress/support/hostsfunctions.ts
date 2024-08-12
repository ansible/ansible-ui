import { randomString } from '../../framework/utils/random-string';
import { AwxHost } from '../../frontend/awx/interfaces/AwxHost';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { awxAPI } from './formatApiPathForAwx';

/////////////// Assisting functions ///////////////
// this functions will be used for stand alone hosts and inventory hosts test

export function createAndCheckHost(host_type: string, inventory: string) {
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

export function createHost(host_type: string, inventoryID: number) {
  const hostName = 'E2E Host ' + randomString(4);
  // create host with no verify
  if (host_type === 'inventory_host') {
    cy.requestPost<Partial<AwxHost>, AwxHost>(awxAPI`/hosts/`, {
      name: hostName,
      inventory: inventoryID,
    });
  } else {
    cy.requestPost<Partial<AwxHost>, AwxHost>(awxAPI`/hosts/`, {
      name: hostName,
    });
  }
  return hostName;
}

function editHost(invenotryName: string, host_type: string, hostName: string, view: string) {
  // function that editing host data from list or details views
  // this function cover both inventory host and stand alone host
  if (view === 'list') {
    navigateToBaseView(host_type, invenotryName);
    cy.filterTableByMultiSelect('name', [hostName]);
  } else {
    // for details view
    navigateToHost(host_type, hostName, '[data-cy="name-column-cell"] a', invenotryName);
  }

  cy.getByDataCy('edit-host').click();
  cy.verifyPageTitle('Edit host');
  cy.getByDataCy('description').clear().type('This is the description edited');
  cy.getByDataCy('Submit').click();
  cy.hasDetail(/^Description$/, 'This is the description edited');
}

function deleteHostListView(invenotryName: string, host_type: string, hostName: string) {
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

function deleteHostDetailsView(invenotryName: string, host_type: string, hostName: string) {
  // function for delete host
  // can use this for stand alon host and for invntory host
  // will delete and verify that all was deleted curectlly

  navigateToHost(host_type, hostName, '[data-cy="name-column-cell"] a', invenotryName);
  cy.getByDataCy('actions-dropdown').click();
  cy.getByDataCy('delete-host').click();
  cy.clickModalConfirmCheckbox();
  cy.clickModalButton('Delete hosts');
  cy.contains(/^There are currently no hosts added to this inventory./);
}

function deleteAllInventoryHosts(inventory: Inventory) {
  navigateToBaseView('inventory_host', inventory.name);
  cy.getByDataCy('select-all').click();
  cy.clickToolbarKebabAction('delete-hosts');
  cy.contains('Permanently delete hosts');
  cy.clickModalConfirmCheckbox();
  cy.clickButton(/^Delete hosts$/);
  cy.clickButton(/^Close$/);
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

export function navigateToBaseView(host_type: string, inventoryName: string) {
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
      cy.clickButton(/^Close$/);
      cy.contains(group.name);
      deleteAllInventoryHosts(inventory);
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
  cy.clickToolbarKebabAction('delete-hosts');
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

export function createHostAndCancelJob(
  inventory: Inventory,
  organizationId: number,
  projectId: number,
  hostInInventory?: boolean
) {
  cy.createAwxJobTemplate({
    inventory: inventory.id,
    organization: organizationId,
    project: projectId,
  }).then(() => {
    // go to inventory hosts
    cy.navigateTo('awx', 'inventories');
    cy.filterTableByMultiSelect('name', [inventory.name]);
    cy.get('[data-cy="name-column-cell"]').contains(inventory.name).click();
    cy.get('.pf-v5-c-tabs__item > a').contains('Hosts').click();
    // add a host
    const hostName = createHost('inventory_host', inventory.id);
    // go to inventory job templates
    cy.navigateTo('awx', 'inventories');
    cy.filterTableByMultiSelect('name', [inventory.name]);
    cy.get('[data-cy="name-column-cell"]').contains(inventory.name).click();
    cy.get('.pf-v5-c-tabs__item > a').contains('Job templates').click();
    // run  a template and wait for redirect to Job output
    cy.get('[data-cy="launch-template"]').first().click();
    cy.location('pathname').should('match', /\/output$/);
    if (hostInInventory) {
      // go to the Hosts under Inventory
      cy.navigateTo('awx', 'inventories');
      cy.filterTableByMultiSelect('name', [inventory.name]);
      cy.get('[data-cy="name-column-cell"]').contains(inventory.name).click();
      cy.get('.pf-v5-c-tabs__item > a').contains('Hosts').click();
    } else {
      // go to the Hosts
      cy.navigateTo('awx', 'hosts');
    }
    cy.filterTableByMultiSelect('name', [hostName]);
    cy.get('[data-cy="name-column-cell"]').contains(hostName).click();
    cy.intercept(
      { method: 'GET', url: awxAPI`/unified_jobs/*` },
      { fixture: 'awxRunningJobs.json' }
    );
    cy.get('.pf-v5-c-tabs__item > a').contains('Jobs').click();
    // there should be cancel job button when jon is running
    cy.get('[data-cy="cancel-job"]').should('be.enabled');
    cy.get('[data-cy="cancel-job"]').click();
    cy.clickModalConfirmCheckbox();
    cy.contains('button', 'Cancel job').click();
    // expect cancel to fail as the running job is mocked
    cy.contains('Error').should('exist');
  });
}

export function launchHostJob(
  inventory: Inventory,
  host: AwxHost,
  organizationId: number,
  projectId: number,
  type: 'Host' | 'InventoryHost'
) {
  cy.createAwxJobTemplate({
    inventory: inventory.id,
    organization: organizationId,
    project: projectId,
  }).then(() => {
    cy.navigateTo('awx', 'inventories');
    cy.filterTableByMultiSelect('name', [inventory.name]);
    cy.get('[data-cy="name-column-cell"]').contains(inventory.name).click();
    cy.contains(`[role='tab']`, 'Job templates').click();

    // run  a template and wait for request
    cy.intercept('POST', awxAPI`/job_templates/*/launch`).as('launch');
    cy.get('[data-cy="launch-template"]').click();
    cy.wait('@launch').should('exist');

    cy.contains('span', 'Failed', { timeout: 60000 });

    if (type === 'InventoryHost') {
      // go to the Hosts under Inventory
      cy.navigateTo('awx', 'inventories');
      cy.filterTableByMultiSelect('name', [inventory.name]);
      cy.get('[data-cy="name-column-cell"]').contains(inventory.name).click();
      cy.contains(`[role='tab']`, 'Jobs').click();
    } else {
      // go to the Hosts
      cy.navigateTo('awx', 'hosts');
      cy.filterTableByMultiSelect('name', [host.name]);
      cy.get('[data-cy="name-column-cell"]').contains(host.name).click();

      // go to Jobs tab
      cy.contains(`[role='tab']`, 'Jobs').click();
    }

    cy.get('[data-cy="relaunch-using-host-parameters"]').should('exist');
    cy.get('[data-cy="relaunch-using-host-parameters"]').click();
    cy.get('[data-cy="relaunch-on-all-hosts"]').should('exist');
    cy.get('[data-cy="relaunch-on-failed-hosts"]').should('exist');

    // relaunch job
    cy.intercept('POST', awxAPI`/jobs/*/relaunch`).as('relaunch');
    cy.get('[data-cy="relaunch-on-all-hosts"]').click();
    cy.wait('@relaunch').should('exist');
  });
}

export function checkFactsInHost(inventory: Inventory, host_type: string) {
  cy.navigateTo('awx', 'hosts');
  const hostName = createAndCheckHost('stand_alone_host', inventory.name);
  // mock ansible_fact
  cy.intercept(
    { method: 'GET', url: awxAPI`/hosts/*/ansible_facts/` },
    {
      ansible_dns: {
        search: ['dev-ui.svc.cluster.local', 'svc.cluster.local', 'cluster.local'],
        options: {
          ndots: '5',
        },
        nameservers: ['10.43.0.10'],
      },
    }
  );
  if (host_type === `inventory_host`) {
    // go to the Hosts under Inventory
    cy.navigateTo('awx', 'inventories');
    cy.filterTableByMultiSelect('name', [inventory.name]);
    cy.get('[data-cy="name-column-cell"]').contains(inventory.name).click();
    cy.get('.pf-v5-c-tabs__item > a').contains('Hosts').click();
    cy.filterTableByMultiSelect('name', [hostName]);
    cy.get('[data-cy="name-column-cell"]').contains(hostName).click();
  }
  cy.containsBy('a', 'Facts').click();
  cy.get('code').should('contain', 'ansible_dns');
}

export function checkHiddenButton(host_type: string, inventory: Inventory, missing: string) {
  //navigate to list view and check host existing
  //in case this should be done to detailes view the only thing needed is to add click on host name
  navigateToBaseView(host_type, inventory.name);
  cy.get(`[aria-label="Simple table"] tr`).its('length').should('be.gt', 1);
  cy.get(missing).should('not.exist');
}

export function checkHiddenTab(host_type: string, inventory: Inventory, missing: string) {
  //navigate to list view and check host existing
  //get to host to verify tab is missing
  navigateToBaseView(host_type, inventory.name);
  cy.get(`[aria-label="Simple table"] tr`).its('length').should('be.gt', 1);
  cy.getByDataCy('name-column-cell').contains('E2E Host').click();
  cy.contains('[role="tab"]', missing).should('not.exist');
}
