import { awxAPI } from '../../../../../frontend/awx/common/api/awx-utils';
import { Inventory } from '../../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../../frontend/awx/interfaces/User';
import { runCommand } from './runCommandFunction';
import { randomString } from '../../../../../framework/utils/random-string';
import { launchHostJob } from '../../../../support/hostsfunctions';

import {
  checkHostGroup,
  createAndEditAndDeleteHost,
  testHostBulkDelete,
  checkFactsInHost,
  createHost,
  createHostAndCancelJob,
} from '../../../../support/hostsfunctions';

describe('Inventory Host Tab Tests for regular inventory', () => {
  let organization: Organization;
  let inventory: Inventory;
  let user: AwxUser;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxInventory({ organization: organization.id }).then((inv) => {
        inventory = inv;
      });
      cy.createAwxProject({ organization: organization.id }).then((proj) => {
        project = proj;
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

  it('can create, edit, assosiat and disassosiate groups at inventory -> hosts -> groups tab', () => {
    // use checkHostGroup function in order to test inventory host group
    // the test is checking: create, verify, multi assosiate and disassosiate of groups (using bluk)
    // and single assosiate and disassosiate of group, edit and delete
    checkHostGroup('inventory_host', organization);
  });

  it('can create, edit and delete inventory host action from list view', () => {
    // use createAndEditAndDeleteHost function in order to test inventory hosts basic functions
    // after navigating to the right url
    // the test covers create, verify, edit and delete of hosts form inventory
    createAndEditAndDeleteHost('inventory_host', inventory, 'list');
  });

  it('can edit and delete inventory host action from details view', () => {
    //can and delete host from details view
    createAndEditAndDeleteHost('inventory_host', inventory, 'details');
  });

  it('can bulk delete multiple hosts from the hosts tab of an inventory', () => {
    //1) Use the inventory , access the host tab of that inventory
    //2) Create 2 hosts in this test for the purpose of delete
    //3) Verify 2 hosts exists in inventory
    //4) Bulk delete hosts from list view using select all option
    //5) Verify no hosts exists in inventory
    testHostBulkDelete('inventory_host', inventory);
  });

  it("can view a host's facts on the facts tab of a host inside an inventory", () => {
    //1) Use the inventory, access the host tab of that inventory
    //2) Visit the host details page, then navigate to the host Facts tab
    //3) Assert that no facts are showing
    //4) Create a JT designed to populate the facts for the host, launch the job template
    //5) Navigate back to the facts tab of that host and assert that the facts exist
    checkFactsInHost(inventory, 'inventory_host');
  });

  it('can launch a job template that uses an inventory with a particular host and view the job on the host jobs tab inside the inventory', () => {
    //1) Use inventory and host
    //2) create a job template that uses that inventory, launch the job template, wait for job to finish
    //3) Navigate back to inventory -> host tab -> jobs tab -> assert presence of job in that list
    cy.createAwxProject({ organization: organization.id }).then((project) => {
      cy.createInventoryHost(organization, '').then((result) => {
        launchHostJob(result.inventory, result.host, organization.id, project.id, 'InventoryHost');
        cy.deleteAwxInventory(result.inventory, { failOnStatusCode: false });
        cy.deleteAwxProject(project, { failOnStatusCode: false });
      });
    });
  });

  it('can cancel a currently running job from the host jobs tab inside an inventory', () => {
    //1) Use the inventory and host
    //2) create a job template that uses that inventory, utilize a playbook that will cause the job to be long running
    //3) Launch the job template
    //4) Navigate back to inventory -> host tab -> jobs tab -> assert presence of job in that list
    //5) Cancel the job and assert that it has been canceled
    createHostAndCancelJob(inventory, organization.id, project.id, true);
  });

  it(`can run an ad-hoc command against a host on the inventory hosts tab`, () => {
    //1) Use the inventory created in before, access the host tab of that inventory
    //2) Use a host, EE, and credential - these resources are needed to run a command against a host
    //3) Assert redirect to the job output screen
    //4) Navigate to the details page of the job and assert the values there match what was entered in the Run Command Wizard
    //5) Navigate back to the Inventory -> Jobs Tab to assert that the Run Command job shows up there
    createHost('inventory_host', inventory.id);

    cy.navigateTo('awx', 'inventories');
    cy.intercept('get', awxAPI`/inventories/?name=${inventory.name}*`).as('getInventories');
    cy.filterTableByMultiSelect('name', [inventory.name]);
    cy.wait('@getInventories');

    cy.contains('a', inventory.name).click();
    cy.contains(`a[role="tab"]`, 'Hosts').click();

    cy.getByDataCy('run-command').click();

    runCommand({
      selections: 'all',
      module: 'shell',
      verbosity: '0-(normal)',
      forks: 2,
      show_changes: true,
      become_enabled: true,
      organization,
    });
  });

  it('can run an ad-hoc command against the host on the groups tab of a host-inventory from the host details page', () => {
    //1) Use the inventory created in before, access the host tab of that inventory, visit the host details page
    //2) Use a host, EE, and credential - these resources are needed to run a command against a host
    //3) Assert redirect to the job output screen
    //4) Navigate to the details page of the job and assert the values there match what was entered in the Run Command Wizard
    //5) Navigate back to the Inventory -> Jobs Tab to assert that the Run Command job shows up there

    createHost('inventory_host', inventory.id);
    const groupName = 'E2E group ' + randomString(4);
    cy.createInventoryGroup(inventory, groupName);
    cy.log(`inv: ${inventory.name}, group: ${groupName}`);

    cy.navigateTo('awx', 'inventories');

    cy.intercept('get', awxAPI`/inventories/?name=${inventory.name}*`).as('getInventories');
    cy.filterTableByMultiSelect('name', [inventory.name]);
    cy.wait('@getInventories');

    cy.contains('a', inventory.name).click();

    cy.contains(`a[role="tab"]`, 'Groups').click();
    cy.reload();
    cy.contains('a', groupName).click();

    cy.contains(`a[role="tab"]`, 'Hosts').click();
    // add existing host
    cy.getByDataCy('add-existing-host').click();
    cy.getByDataCy('select-all').click();
    cy.clickModalButton('Add hosts');

    cy.getByDataCy('run-command').click();

    runCommand({
      selections: 'all',
      module: 'shell',
      verbosity: '0-(normal)',
      forks: 2,
      show_changes: true,
      become_enabled: true,
      organization,
    });
  });
});
