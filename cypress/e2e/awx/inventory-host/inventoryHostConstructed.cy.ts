/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Inventory } from '@ansible/awx-ui/interfaces/Inventory';
import { InventoryGroup } from '@ansible/awx-ui/interfaces/InventoryGroup';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { checkHiddenButton, checkHiddenTab, launchHostJob } from '../../../support/hostsfunctions';
import { runCommand } from './runCommandFunction';
import { AwxHost } from '@ansible/awx-ui/interfaces/AwxHost';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';

// This function is used to get the hosts for a given inventory.
// It will keep retrying until it finds at least one host.
function getInventoryHosts(inventory: Inventory, retries = 60) {
  cy.requestGet<AwxItemsResponse<AwxHost>>(
    awxAPI`/inventories/${inventory.id.toString()}/hosts/`
  ).then((response) => {
    const { results } = response;
    if (results.length > 0) {
      cy.log('inventoryHost', JSON.stringify(results[0]));
      return;
    }
    cy.log('No hosts found, retrying...');
    if (retries > 0) {
      cy.wait(1000);
      getInventoryHosts(inventory, retries - 1);
    } else {
      cy.log('No inventory hosts found after 60 retries');
    }
  });
}

// This function is used to get the groups for a given inventory.
// It will keep retrying until it finds at least one host.
function getInventoryGroups(inventory: Inventory, retries = 60) {
  cy.requestGet<AwxItemsResponse<InventoryGroup>>(
    awxAPI`/inventories/${inventory.id.toString()}/groups/`
  ).then((response) => {
    const { results } = response;
    if (results.length > 0) {
      cy.log('inventoryGroup', JSON.stringify(results[0]));
      return;
    }
    cy.log('No groups found, retrying...');
    if (retries > 0) {
      cy.wait(1000);
      getInventoryGroups(inventory, retries - 1);
    } else {
      cy.log('No inventory groups found after 60 retries');
    }
  });
}

describe('Inventory Host Tab Tests for contructed inventory', () => {
  let organization: Organization;
  let inventory: Inventory;
  let group: InventoryGroup;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createInventoryHost(organization, 'constructed').then((result) => {
        const { inventory: inv, host } = result;
        cy.log('host', JSON.stringify(host));
        inventory = inv;
        cy.createInventoryHostGroup(organization).then((result2) => {
          const normalInventory = result2.inventory;
          group = result2.group;
          cy.requestPost<{ id: number }>(
            awxAPI`/inventories/${inventory.id.toString()}/input_inventories/`,
            {
              id: normalInventory.id,
            }
          );
        });
      });
    });
  });

  after(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it(`can run an ad-hoc command against a host on the inventory hosts tab`, () => {
    cy.navigateTo('awx', 'inventories');
    cy.filterTableBySearch(inventory.name);
    cy.contains('a', inventory.name).click();
    // Sometimes the host for the inventory is not available yet, so we need to wait for it to be created
    getInventoryHosts(inventory);
    cy.contains(`a[role="tab"]`, 'Hosts').click();
    cy.getByDataCy('run-command').click();

    runCommand({
      selections: 'all',
      module: 'shell',
      verbosity: '0',
      forks: 2,
      show_changes: true,
      become_enabled: true,
      organization,
    });
  });

  it('can run an ad-hoc command against the host on the groups tab of a host-inventory from the host details page', () => {
    cy.navigateTo('awx', 'inventories');
    cy.filterTableBySearch(inventory.name);
    cy.contains('a', inventory.name).click();
    cy.get('[data-cy="sync-inventory"]', { timeout: 60000 }).should('exist');
    cy.getByDataCy('sync-inventory').click();
    cy.contains(`[data-cy="last-job-status"]`, 'Success');
    // Sometimes the group for the inventory is not available yet, so we need to wait for it to be created
    getInventoryGroups(inventory);
    cy.contains(`a[role="tab"]`, 'Groups').click();
    cy.contains('a', group.name).click();
    // Sometimes the host for the inventory is not available yet, so we need to wait for it to be created
    getInventoryHosts(inventory);
    cy.contains(`a[role="tab"]`, 'Hosts').click();
    cy.getByDataCy('run-command').click();
    runCommand({
      selections: 'all',
      module: 'shell',
      verbosity: '0',
      forks: 2,
      show_changes: true,
      become_enabled: true,
      organization,
    });
  });

  it('can launch a job template that uses an inventory with a particular host and view the job on the host jobs tab inside the inventory', () => {
    cy.createAwxProject(organization).then((project) => {
      cy.createInventoryHost(organization, 'constructed').then((result) => {
        launchHostJob(result.inventory, result.host, organization.id, project.id, 'InventoryHost');
        cy.deleteAwxInventory(result.inventory, { failOnStatusCode: false });
        cy.deleteAwxProject(project, { failOnStatusCode: false });
      });
    });
  });

  it('test edit, delete buttons and facts tab are not present for constructed inventory host options', () => {
    checkHiddenButton('inventory_host', inventory, `[data-cy="edit-host"]`);
    const hiddenElement = `[data-cy="actions-column-cell"] [data-cy="actions-dropdown"]`;
    checkHiddenButton('inventory_host', inventory, hiddenElement);
    checkHiddenTab('inventory_host', inventory, 'Facts');
  });
});
