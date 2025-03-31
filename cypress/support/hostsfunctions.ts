import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { AwxHost } from '@ansible/awx-ui/interfaces/AwxHost';
import { Inventory } from '@ansible/awx-ui/interfaces/Inventory';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { awxAPI } from './formatApiPathForAwx';

export function createAndCheckHost(host_type: string, inventory: string) {
  const hostName = 'E2E Inventory host ' + randomString(4);
  cy.contains('Create host').click();
  cy.verifyPageTitle('Create host');
  cy.getByDataCy('name').type(hostName);
  cy.getByDataCy('description').type('This is the description');
  if (host_type === 'stand_alone_host') {
    cy.singleSelectByDataCy('inventory', inventory);
  }
  cy.getByDataCy('variables').type('test: true');
  cy.clickButton(/^Create host/);
  cy.hasDetail(/^Name$/, hostName);
  cy.hasDetail(/^Description$/, 'This is the description');
  cy.get('[data-cy="code-block-value"]').should('contains.text', 'test: true');
  return hostName;
}

export function createHost(host_type: string, inventoryID: number) {
  const hostName = 'E2E Host ' + randomString(4);
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

function editHost(inventoryName: string, host_type: string, hostName: string, view: string) {
  if (view === 'list') {
    navigateToBaseView(host_type, inventoryName);
    cy.filterTableBySearch(hostName);
  } else {
    navigateToHost(host_type, hostName, '[data-cy="name-column-cell"] a', inventoryName);
  }
  cy.getByDataCy('edit-host').click();
  cy.verifyPageTitle(`Edit ${hostName}`);
  cy.getByDataCy('description').clear().type('This is the description edited');
  cy.getByDataCy('Submit').click();
  cy.hasDetail(/^Description$/, 'This is the description edited');
}

function deleteHostListView(invenotryName: string, host_type: string, hostName: string) {
  navigateToBaseView(host_type, invenotryName);
  cy.filterTableBySearch(hostName);
  cy.get('td[data-cy="actions-column-cell"]').within(() => {
    cy.get('button[data-cy="actions-dropdown"]').click();
  });
  cy.getByDataCy('delete-host').click();
  cy.clickModalConfirmCheckbox();
  cy.clickModalButton('Delete hosts');
  cy.contains(/^No results found./);
}

function deleteHostDetailsView(invenotryName: string, host_type: string, hostName: string) {
  navigateToHost(host_type, hostName, '[data-cy="name-column-cell"] a', invenotryName);
  cy.getByDataCy('actions-dropdown').click();
  cy.getByDataCy('delete-host').click();
  cy.clickModalConfirmCheckbox();
  cy.clickModalButton('Delete hosts');
  cy.contains(/^There are currently no hosts added to this inventory./);
}

function deleteAllInventoryHosts(inventory: Inventory) {
  navigateToBaseView('inventory_host', inventory.name);
  cy.getByDataCy('select-all').check();
  cy.clickToolbarKebabAction('delete-hosts');
  cy.contains('Permanently delete hosts');
  cy.clickModalConfirmCheckbox();
  cy.clickButton(/^Delete hosts$/);
  cy.contains('There are currently no hosts added to this inventory.').should('be.visible');
}

function navigateToHost(host_type: string, name: string, data: string, inventoryName: string) {
  navigateToBaseView(host_type, inventoryName);
  cy.filterTableBySingleSelect('name', name || '');
  cy.get(data).click();
}

export function navigateToBaseView(host_type: string, inventoryName: string) {
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
  cy.getByDataCy('disassociate-groups').click();
  cy.clickModalConfirmCheckbox();
  cy.clickModalButton('Disassociate groups');
  cy.assertModalSuccess();
}

export function checkHostGroup(host_type: string, organization: Organization) {
  cy.createInventoryHostGroup(organization).then((result) => {
    const { inventory, host, group } = result;
    const hostid = host.id ? host.id.toString() : '';
    navigateToHost(host_type, host.name, '[data-cy="name-column-cell"] a', inventory.name);
    expect(host.inventory).to.eq(inventory.id);
    expect(group.inventory).to.eq(inventory.id);
    cy.clickLink(/^Groups$/);
    cy.getByDataCy('edit-group').click();
    cy.verifyPageTitle(`Edit ${group.name}`);
    cy.getByDataCy('name-form-group').type('-changed');
    cy.getByDataCy('Submit').click();
    cy.verifyPageTitle(group.name + '-changed');
    cy.requestPost<{ name: string; inventory: number; id: number }>(
      awxAPI`/hosts/${hostid}/groups/`,
      {
        name: 'E2E Group ' + randomString(5),
        inventory: host.inventory,
      }
    ).then((group2: { name: string; id: number }) => {
      navigateToHost(host_type, host.name, '[data-cy="name-column-cell"] a', inventory.name);
      cy.clickLink(/^Groups$/);
      cy.contains(group2.name);
      cy.getByDataCy('select-all').check();
      disassociate();
      cy.contains('There are currently no groups associated with this host').should('be.visible');
      cy.clickButton(/^Associate groups$/);
      cy.getByDataCy('select-all').check();
      cy.clickModalButton('Confirm');
      cy.contains(group.name);
      cy.contains(group2.name);
      /// single disassociate
      // TODO: need to change this when
      // https://issues.redhat.com/browse/AAP-22914 change will applyed
      // multi select will be changed in the future
      cy.filterTableBySearch(group.name);
      cy.get(`[data-cy="row-id-${group.id}"] [data-cy="checkbox-column-cell"]`).click();
      disassociate();
      navigateToHost(host_type, host.name, '[data-cy="name-column-cell"] a', inventory.name);
      cy.clickLink(/^Groups$/);
      cy.contains(group.name).should('not.exist');
      cy.getByDataCy('associate-group').click();
      cy.get(`[data-cy="row-id-${group.id}"] [data-cy="checkbox-column-cell"]`).click();
      cy.clickModalButton('Confirm');
      cy.contains(group.name);
      deleteAllInventoryHosts(inventory);
    });
  });
}

export function createAndEditAndDeleteHost(host_type: string, inventory: Inventory, view: string) {
  navigateToBaseView(host_type, inventory.name);
  const hostName = createAndCheckHost(host_type, inventory.name);
  editHost(inventory.name, host_type, hostName, view);
  if (view === 'list') {
    deleteHostListView(inventory.name, host_type, hostName);
  } else {
    deleteHostDetailsView(inventory.name, host_type, hostName);
  }
}

export function testHostBulkDelete(host_type: string, inventory: Inventory) {
  createHost(host_type, inventory.id);
  createHost(host_type, inventory.id);
  navigateToBaseView(host_type, inventory.name);
  cy.get(`[aria-label="Simple table"] tr`).should('have.length.gte', 3);
  cy.getByDataCy('select-all').check();
  cy.clickToolbarKebabAction('delete-hosts');
  cy.contains('Permanently delete hosts');
  cy.clickModalConfirmCheckbox();
  cy.contains('button', 'Delete hosts').click();
  if (host_type === 'inventory_host') {
    cy.contains('There are currently no hosts added to this inventory.').should('be.visible');
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
  }).then((jobTemplate) => {
    cy.navigateTo('awx', 'inventories');
    cy.filterTableBySearch(inventory.name);
    cy.get('[data-cy="name-column-cell"]').contains(inventory.name).click();
    cy.get('.pf-v5-c-tabs__item > a').contains('Hosts').click();
    const hostName = createHost('inventory_host', inventory.id);
    cy.navigateTo('awx', 'inventories');
    cy.filterTableBySearch(inventory.name);
    cy.get('[data-cy="name-column-cell"]').contains(inventory.name).click();
    cy.get('.pf-v5-c-tabs__item > a').contains('Job Templates').click();
    // run  a template and wait for redirect to Job output
    cy.get('[data-cy="launch-template"]').first().click();
    cy.getBy('[data-cy="Output"]').should('be.visible');
    cy.url().should('contain', '/output');
    cy.verifyPageTitle(jobTemplate.name);
    if (hostInInventory) {
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySearch(inventory.name);
      cy.get('[data-cy="name-column-cell"]').contains(inventory.name).click();
      cy.get('.pf-v5-c-tabs__item > a').contains('Hosts').click();
    } else {
      cy.navigateTo('awx', 'hosts');
    }
    cy.filterTableBySearch(hostName);
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
    cy.filterTableBySearch(inventory.name);
    cy.get('[data-cy="name-column-cell"]').contains(inventory.name).click();
    cy.contains(`[role='tab']`, 'Job Templates').click();
    cy.intercept('POST', awxAPI`/job_templates/*/launch`).as('launch');
    cy.get('[data-cy="launch-template"]').click();
    cy.wait('@launch').should('exist');
    cy.contains('span', 'Failed', { timeout: 60000 });
    if (type === 'InventoryHost') {
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySearch(inventory.name);
      cy.get('[data-cy="name-column-cell"]').contains(inventory.name).click();
      cy.contains(`[role='tab']`, 'Jobs').click();
    } else {
      cy.navigateTo('awx', 'hosts');
      cy.filterTableBySearch(host.name);
      cy.get('[data-cy="name-column-cell"]').contains(host.name).click();
      cy.contains(`[role='tab']`, 'Jobs').click();
    }
    cy.get('[data-cy="relaunch-using-host-parameters"]').should('exist');
    cy.get('[data-cy="relaunch-using-host-parameters"]').click();
    cy.get('[data-cy="relaunch-on-all-hosts"]').should('exist');
    cy.get('[data-cy="relaunch-on-failed-hosts"]').should('exist');
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
    cy.navigateTo('awx', 'inventories');
    cy.filterTableBySearch(inventory.name);
    cy.get('[data-cy="name-column-cell"]').contains(inventory.name).click();
    cy.get('.pf-v5-c-tabs__item > a').contains('Hosts').click();
    cy.filterTableBySearch(hostName);
    cy.get('[data-cy="name-column-cell"]').contains(hostName).click();
  }
  cy.containsBy('a', 'Facts').click();
  cy.get('code').should('contain', 'ansible_dns');
}

export function checkHiddenButton(host_type: string, inventory: Inventory, missing: string) {
  navigateToBaseView(host_type, inventory.name);
  cy.get(`[aria-label="Simple table"] tr`).its('length').should('be.gt', 1);
  cy.get(missing).should('not.exist');
}

export function checkHiddenTab(host_type: string, inventory: Inventory, missing: string) {
  navigateToBaseView(host_type, inventory.name);
  cy.get(`[aria-label="Simple table"] tr`).its('length').should('be.gte', 1);
  cy.getByDataCy('name-column-cell').contains('E2E Host').click();
  cy.contains('[role="tab"]', missing).should('not.exist');
}
