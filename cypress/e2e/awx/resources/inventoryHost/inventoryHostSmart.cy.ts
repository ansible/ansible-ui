/* eslint-disable @typescript-eslint/no-unsafe-call */
import { awxAPI } from '../../../../../frontend/awx/common/api/awx-utils';
import { Inventory } from '../../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../../frontend/awx/interfaces/User';
import {
  checkHiddenButton,
  checkHiddenTab,
  launchHostJob,
} from '../../../../support/hostsfunctions';
import { runCommand } from './runCommandFunction';

describe('Inventory Host Tab Tests for smart inventory', () => {
  let organization: Organization;
  let inventory: Inventory;
  let user: AwxUser;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createInventoryHost(organization, 'smart').then((result) => {
        const { inventory: inv } = result;
        inventory = inv;
      });

      cy.createAwxUser({ organization: organization.id }).then((testUser) => {
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
  it(`can run an ad-hoc command against a host on the inventory hosts tab`, () => {
    //1) Use the inventory created in before, access the host tab of that inventory
    //2) Use a host, EE, and credential - these resources are needed to run a command against a host
    //3) Assert redirect to the job output screen
    //4) Navigate to the details page of the job and assert the values there match what was entered in the Run Command Wizard
    //5) Navigate back to the Inventory -> Jobs Tab to assert that the Run Command job shows up there
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

  //there is NO group tab in smart inventory -> host
  it.skip('can run an ad-hoc command against the host on the groups tab of a host-inventory from the host details page', () => {
    //1) Use the inventory created in before, access the host tab of that inventory, visit the host details page
    //2) Use a host, EE, and credential - these resources are needed to run a command against a host
    //3) Assert redirect to the job output screen
    //4) Navigate to the details page of the job and assert the values there match what was entered in the Run Command Wizard
    //5) Navigate back to the Inventory -> Jobs Tab to assert that the Run Command job shows up there
  });

  it('can launch a job template that uses an inventory with a particular host and view the job on the host jobs tab inside the inventory', () => {
    //1) Use inventory and host
    //2) create a job template that uses that inventory, launch the job template, wait for job to finish
    //3) Navigate back to inventory -> host tab -> jobs tab -> assert presence of job in that list
    cy.createAwxProject({ organization: organization.id }).then((project) => {
      cy.createInventoryHost(organization, 'smart').then((result) => {
        launchHostJob(result.inventory, result.host, organization.id, project.id, 'InventoryHost');
        cy.deleteAwxInventory(result.inventory, { failOnStatusCode: false });
        cy.deleteAwxProject(project, { failOnStatusCode: false });
      });
    });
  });

  //there is NO jobs tab in smart inventory -> host
  it.skip('can cancel a currently running job from the host jobs tab inside an inventory', () => {
    //1) Use the inventory and host
    //2) create a job template that uses that inventory, utilize a playbook that will cause the job to be long running
    //3) Launch the job template
    //4) Navigate back to inventory -> host tab -> jobs tab -> assert presence of job in that list
    //5) Cancel the job and assert that it has been canceled
  });

  it('test edit, delete and facts are not part of constracted inventory host options', () => {
    //'confirm that edit host button is missing from the host tab list of an inventory'
    //navigate to smart inventory host list
    //verify edit button is missing
    checkHiddenButton('inventory_host', inventory, `[data-cy="edit-host"]`);

    //'confirm that delete host button is missing from the host tab list of an inventory', () => {
    //navigate to smart inventory host list
    //verify action dropdown contain only delete host button is missing
    const hiddenElement = `[data-cy="actions-column-cell"] [data-cy="actions-dropdown"]`;
    checkHiddenButton('inventory_host', inventory, hiddenElement);

    //'confirm that facts tab is missing from a host inside an inventory', () => {
    //navigate to constructed inventory host list, get to host
    //verify facts tab is missing
    checkHiddenTab('inventory_host', inventory, 'Facts');
  });
});
