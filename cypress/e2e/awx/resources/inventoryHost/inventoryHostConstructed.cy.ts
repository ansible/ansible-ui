/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Inventory } from '../../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../../frontend/awx/interfaces/User';
import { testMissingButton, testMissingTab } from '../../../../support/hostsfunctions';

describe('Inventory Host Tab Tests for contructed inventory', () => {
  let organization: Organization;
  let inventory: Inventory;
  let user: AwxUser;

  before(() => {
    cy.awxLogin();
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createInventoryHost(organization, 'constructed').then((result) => {
        const { inventory: inv } = result;
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
  it.skip(`can run an ad-hoc command against a host on the inventory hosts tab`, () => {
    //1) Use the inventory created in before, access the host tab of that inventory
    //2) Use a host, EE, and credential - these resources are needed to run a command against a host
    //3) Assert redirect to the job output screen
    //4) Navigate to the details page of the job and assert the values there match what was entered in the Run Command Wizard
    //5) Navigate back to the Inventory -> Jobs Tab to assert that the Run Command job shows up there
  });

  it.skip('can run an ad-hoc command against the host on the groups tab of a host-inventory from the host details page', () => {
    //1) Use the inventory created in before, access the host tab of that inventory, visit the host details page
    //2) Use a host, EE, and credential - these resources are needed to run a command against a host
    //3) Assert redirect to the job output screen
    //4) Navigate to the details page of the job and assert the values there match what was entered in the Run Command Wizard
    //5) Navigate back to the Inventory -> Jobs Tab to assert that the Run Command job shows up there
  });

  it.skip('can launch a job template that uses an inventory with a particular host and view the job on the host jobs tab inside the inventory', () => {
    //1) Use inventory and host
    //2) create a job template that uses that inventory, launch the job template, wait for job to finish
    //3) Navigate back to inventory -> host tab -> jobs tab -> assert presence of job in that list
  });

  it.skip('can cancel a currently running job from the host jobs tab inside an inventory', () => {
    //1) Use the inventory and host
    //2) create a job template that uses that inventory, utilize a playbook that will cause the job to be long running
    //3) Launch the job template
    //4) Navigate back to inventory -> host tab -> jobs tab -> assert presence of job in that list
    //5) Cancel the job and assert that it has been canceled
  });

  it('test edit, delete and facts are not part of constracted inventory host options', () => {
    //'confirm that edit host button is missing from the host tab list of an inventory'
    //navigate to constructed inventory host list
    //verify edit button is missing
    testMissingButton('inventory_host', inventory, 'list', `[data-cy="edit-host"]`);

    //'confirm that delete host button is missing from the host tab list of an inventory'
    //navigate to constructed inventory host list
    //verify action dropdown contain only delete host button is missing
    const missingValue = `[data-cy="actions-column-cell"] [data-cy="actions-dropdown"]`;
    testMissingButton('inventory_host', inventory, 'list', missingValue);

    //'confirm that facts tab is missing from a host inside an inventory'
    //navigate to constructed inventory host list, get to host
    //verify facts tab is missing
    testMissingTab('inventory_host', inventory, 'list', 'Facts');
  });
});
