import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { ExecutionEnvironment } from '../../../../frontend/awx/interfaces/ExecutionEnvironment';

describe('Inventory Host Tab Tests', () => {
  let organization: Organization;
  let project: Project;
  let inventory: Inventory;
  let inventorySource: InventorySource;
  let machineCredential: Credential;
  let executionEnvironment: ExecutionEnvironment;

  before(() => {
    cy.awxLogin();
  });

  afterEach(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxCredential(machineCredential, { failOnStatusCode: false });
    cy.deleteAwxExecutionEnvironment(executionEnvironment, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  describe('Inventory Host List Tests', () => {
    beforeEach(() => {
      cy.createAwxOrganization().then((org) => {
        organization = org;
        cy.createAWXCredential({
          kind: 'machine',
          organization: organization.id,
          credential_type: 1,
        }).then((cred) => {
          machineCredential = cred;
        });
        cy.createAwxExecutionEnvironment({ organization: organization.id }).then((ee) => {
          executionEnvironment = ee;
          cy.createInventoryHost(organization).then((result) => {
            const { inventory, host } = result;
            cy.log('Inventory', inventory); //remove this once it is written into the tests below
            cy.log('Host', host); //remove this once it is written into the tests below
            cy.log('EE', ee); //remove this once it is written into the tests below
            cy.log('Machine Cred', machineCredential); //remove this once it is written into the tests below
          });
        });
      });
    });

    it.skip('can create a host from the inventory hosts tab and verify that it is associated with that inventory', () => {
      //1) Use the inventory created in beforeEach block, access the host tab of that inventory
      //2) Use the host created in the beforeEach block
      //3) When redirected to the details page after creation, assert the info displayed there matches what was entered in the form
      //4) Specifically assert that the original inventory is displayed for the newly created host
    });

    it.skip('can run an ad-hoc command against a host on the inventory hosts tab', () => {
      //1) Use the inventory created in beforeEach block, access the host tab of that inventory
      //2) Use the host, EE, and credential created in the beforeEach block- these resources are needed to run a command against a host
      //3) Assert redirect to the job output screen
      //4) Navigate to the details page of the job and assert the values there match what was entered in the Run Command Wizard
      //5) Navigate back to the Inventory -> Jobs Tab to assert that the Run Command job shows up there
    });

    it.skip('can edit a host in the hosts tab list of an inventory', () => {
      //1) Use the inventory created in beforeEach block, access the host tab of that inventory
      //2) Use the host created in the beforeEach block
      //3) Assert the original values the host shows on its details page
      //4) Intercept the edit call
      //5) Use the interception to assert the edited values
    });

    it.skip('can delete a single host from the hosts list tab of an inventory', () => {
      //1) Use the inventory created in beforeEach block, access the host tab of that inventory
      //2) Use the host created in the beforeEach block
      //3) Assert the existence of the host
      //4) Delete the host, intercept the Delete call
      //5) Assert that the host is not found in a search; assert the statusCode of the Delete call
    });

    it.skip('can bulk delete multiple hosts from the hosts tab of an inventory', () => {
      //1) Use the inventory created in beforeEach block, access the host tab of that inventory
      //2) Create 2 hosts in this test for the purpose of delete
      //3) Assert the existence of the hosts
      //4) Delete the hosts, intercept the Delete call
      //5) Assert that the hosts are not found in a search; assert the statusCode of the Delete call
    });
  });

  describe('Inventory Host Details Page Tests', () => {
    it.skip('can edit a host from the details screen by navigating from the host tab list of an inventory', () => {});

    it.skip('can delete a host from the details screen by navigating from the host tab list of an inventory', () => {});
  });

  describe('Inventory Host Facts Tab Tests', () => {
    it.skip("can view a host's facts on the facts tab of a host inside an inventory", () => {});
  });

  describe('Inventory Host Groups Tab Tests', () => {
    it.skip('can view a list of all groups associated with the host on the groups host tab of an inventory', () => {});

    it.skip('can associate a group to the host on the host tab of an inventory', () => {});

    it.skip('can disassociate a single group from the host on the host tab of an inventory', () => {});

    it.skip('can bulk disassociate multiple groups from the host on the host tab of an inventory', () => {});

    it.skip('can run an ad-hoc command against the host on the groups tab of a host-inventory', () => {});
  });

  describe('Inventory Host Jobs Tab Tests', () => {
    it.skip('can launch a job template that uses an inventory with a particular host and view the job on the host jobs tab inside the inventory', () => {});

    it.skip('can cancel a currently running job from the host jobs tab inside an inventory', () => {});
  });
});
