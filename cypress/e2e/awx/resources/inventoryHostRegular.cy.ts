import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { createAndEditAndDeleteHost, checkHostGroup } from '../../../support/hostsfunctions';

describe('Inventory Host Tab Tests for regular inventory', () => {
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
    cy.visit(`/infrastructure/inventories/inventory/${inventory.id}/details`);
    cy.clickTab(/^Hosts$/, true);
    createAndEditAndDeleteHost('inventory_host', inventory);
  });

  it('can edit and delete inventory host action from details view', () => {
    //can and delete host from details view
  });

  it.skip('can bulk delete multiple hosts from the hosts tab of an inventory', () => {
    //1) Use the inventory , access the host tab of that inventory
    //2) Create 2 hosts in this test for the purpose of delete
    //3) Assert the existence of the hosts
    //4) Delete the hosts, intercept the Delete call
    //5) Assert that the hosts are not found in a search; assert the statusCode of the Delete call
  });

  it.skip("can view a host's facts on the facts tab of a host inside an inventory", () => {
    //1) Use the inventory, access the host tab of that inventory
    //2) Visit the host details page, then navigate to the host Facts tab
    //3) Assert that no facts are showing
    //4) Create a JT designed to populate the facts for the host, launch the job template
    //5) Navigate back to the facts tab of that host and assert that the facts exist
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
});
