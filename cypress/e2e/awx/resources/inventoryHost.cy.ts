import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { ExecutionEnvironment } from '../../../../frontend/awx/interfaces/ExecutionEnvironment';

describe('Inventory Host Tab Tests', () => {
  let organization: Organization;
  let inventory: Inventory;
  let machineCredential: Credential;
  let executionEnvironment: ExecutionEnvironment;
  const kinds: Array<'' | 'smart' | 'constructed'> = ['', 'smart', 'constructed'];

  before(() => {
    cy.awxLogin();
  });

  afterEach(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxCredential(machineCredential, { failOnStatusCode: false });
    cy.deleteAwxExecutionEnvironment(executionEnvironment, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  kinds.forEach((kind) => {
    describe(`Inventory Host List Tests (${kind === '' ? 'regular' : kind})`, () => {
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
            cy.createInventoryHost(organization, kind).then((result) => {
              const { inventory: inv, host } = result;
              inventory = inv;
              cy.log(kind);
              cy.log('Inventory', inventory); //remove this once it is written into the tests below
              cy.log('Host', host); //remove this once it is written into the tests below
              cy.log('EE', ee); //remove this once it is written into the tests below
              cy.log('Machine Cred', machineCredential); //remove this once it is written into the tests below
            });
          });
        });
      });

      if (kind === '') {
        it.skip('can create a host from the inventory hosts tab and verify that it is associated with that inventory', () => {
          //1) Use the inventory created in beforeEach block, access the host tab of that inventory
          //2) Use the host created in the beforeEach block
          //3) When redirected to the details page after creation, assert the info displayed there matches what was entered in the form
          //4) Specifically assert that the original inventory is displayed for the newly created host
        });

        it.skip('can edit a host in the hosts tab list of an inventory', () => {
          //1) Use the inventory created in beforeEach block, navigate to the host tab of that inventory
          //........................(use the host created in beforeEach block)
          //2) On the host list, assert the original values the host shows on its details page. Edit the host.
          //3) Intercept the edit call
          //4) Use the interception to assert the edited values
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
      }

      it.skip(`can run an ad-hoc command against a host on the inventory hosts tab`, () => {
        //1) Use the inventory created in beforeEach block, access the host tab of that inventory
        //2) Use the host, EE, and credential created in the beforeEach block- these resources are needed to run a command against a host
        //3) Assert redirect to the job output screen
        //4) Navigate to the details page of the job and assert the values there match what was entered in the Run Command Wizard
        //5) Navigate back to the Inventory -> Jobs Tab to assert that the Run Command job shows up there
      });
    });
  });

  kinds.forEach((kind) => {
    describe(`Inventory Host Details Page Tests (${kind === '' ? 'regular' : kind})`, () => {
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
            cy.createInventoryHost(organization, kind).then((result) => {
              const { inventory: inv, host } = result;
              inventory = inv;
              cy.log('Inventory', inventory); //remove this once it is written into the tests below
              cy.log('Host', host); //remove this once it is written into the tests below
              cy.log('EE', ee); //remove this once it is written into the tests below
              cy.log('Machine Cred', machineCredential); //remove this once it is written into the tests below
            });
          });
        });
      });

      if (kind === '') {
        it.skip('can edit a host from the details screen by navigating from the host tab list of an inventory', () => {
          //1) If constructed or smart inventory, ensure there is no edit button and complete test
          //2) Use the inventory created in beforeEach block, navigate to the host tab of that inventory,
          //........................then to the details page of that host (use the host created in beforeEach block)
          //3) On the host details page, assert the original values the host shows on its details page. Edit the host.
          //4) Intercept the edit call
          //5) Use the interception to assert the edited values
        });

        it.skip('can delete a host from the details screen by navigating from the host tab list of an inventory', () => {
          //1) If constructed or smart inventory, ensure there is no delete button and complete test
          //2) Use the inventory created in beforeEach block, access the host tab of that inventory, then visit the host details page
          //3) Use the host created in the beforeEach block
          //4) Assert the details on the host details page
          //5) Delete the host, intercept the Delete call
          //6) Assert that the host is not found in a search; assert the statusCode of the Delete call
        });

        it.skip("can view a host's facts on the facts tab of a host inside an inventory", () => {
          //1) If constructed or smart inventory, ensure there is no facts tab and complete test
          //1) Use the inventory created in beforeEach block, access the host tab of that inventory
          //2) Visit the host details page, then navigate to the host Facts tab
          //3) Assert that no facts are showing
          //4) Create a JT designed to populate the facts for the host, launch the job template
          //5) Navigate back to the facts tab of that host and assert that the facts exist
        });
      }

      if (kind === 'constructed') {
        it.skip('confirm that edit host button is missing from the host tab list of an inventory', () => {});

        it.skip('confirm that delete host button is missing from the host tab list of an inventory', () => {});

        it.skip('confirm that facts tab is missing from a host inside an inventory', () => {});
      }

      if (kind === 'smart') {
        it.skip('confirm that edit host button is missing from the host tab list of an inventory', () => {});

        it.skip('confirm that delete host button is missing from the host tab list of an inventory', () => {});

        it.skip('confirm that facts tab is missing from a host inside an inventory', () => {});
      }
    });
  });

  describe('Inventory Host Groups Tab Tests (Only for regular inventory)', () => {
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
          cy.createInventoryHostGroup(organization).then((result) => {
            const { inventory, host, group } = result;
            cy.log('Inventory', inventory); //remove this once it is written into the tests below
            cy.log('Host', host); //remove this once it is written into the tests below
            cy.log('Group', group); //remove this once it is written into the tests below
            cy.log('EE', ee); //remove this once it is written into the tests below
            cy.log('Machine Cred', machineCredential); //remove this once it is written into the tests below
          });
        });
      });
    });

    it.skip('can view a list of all group(s) associated with the host on the groups host tab of an inventory', () => {
      //1) Utilize the inventory, host, and group that were created in the beforeEach block- they are linked together
      //2) Navigate to the host details page, then navigate to the Groups tab of that host
      //3) Assert the presence of the expected group in the list
    });

    it.skip('can associate a group to the host on the host tab of an inventory', () => {
      //1) Utilize the inventory, host, and group that were created in the beforeEach block- they are linked together
      //2) Navigate to the host details tab, then the groups tab. Assert that only one group is showing
      //3) Inside the inventory, create an additional group
      //4) Associate the host and new group with each other
      //5) Assert the presence of that new group on the Groups tab inside of the Host, assert that 2 groups are now showing
    });

    it.skip('can disassociate a single group from the host on the host tab of an inventory', () => {
      //1) Utilize the inventory, host, and group that were created in the beforeEach block- they are linked together
      //2) Navigate to the host details tab, then the groups tab. Assert the one group showing there
      //3) Disassociate that group from the host
      //4) Assert that the groups tab inside the host now shows an empty list
    });

    it.skip('can bulk disassociate multiple groups from the host on the host tab of an inventory', () => {
      //1) Utilize the inventory, host, and group that were created in the beforeEach block- they are linked together
      //2) Have the test create 2 additional groups and associate them to the host
      //3) Navigate to the host details tab, then the groups tab. Assert the three groups showing there
      //4) Disassociate all groups from the host
      //5) Assert that the groups tab inside the host now shows an empty list
    });

    it.skip('can run an ad-hoc command against the host on the groups tab of a host-inventory from the host details page', () => {
      //1) Use the inventory created in beforeEach block, access the host tab of that inventory, visit the host details page
      //2) Use the host, EE, and credential created in the beforeEach block- these resources are needed to run a command against a host
      //3) Assert redirect to the job output screen
      //4) Navigate to the details page of the job and assert the values there match what was entered in the Run Command Wizard
      //5) Navigate back to the Inventory -> Jobs Tab to assert that the Run Command job shows up there
    });
  });

  describe('Inventory Host Jobs Tab Tests (Only for regular inventory)', () => {
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
          cy.createInventoryHostGroup(organization).then((result) => {
            const { inventory, host, group } = result;
            cy.log('Inventory', inventory); //remove this once it is written into the tests below
            cy.log('Host', host); //remove this once it is written into the tests below
            cy.log('Group', group); //remove this once it is written into the tests below
            cy.log('EE', ee); //remove this once it is written into the tests below
            cy.log('Machine Cred', machineCredential); //remove this once it is written into the tests below
          });
        });
      });
    });

    it.skip('can launch a job template that uses an inventory with a particular host and view the job on the host jobs tab inside the inventory', () => {
      //1) Use the inventory and host created in beforeEach block
      //2) Have the test create a job template that uses that inventory, launch the job template, wait for job to finish
      //3) Navigate back to inventory -> host tab -> jobs tab -> assert presence of job in that list
    });

    it.skip('can cancel a currently running job from the host jobs tab inside an inventory', () => {
      //1) Use the inventory and host created in beforeEach block
      //2) Have the test create a job template that uses that inventory, utilize a playbook that will cause the job to be long running
      //3) Launch the job template
      //4) Navigate back to inventory -> host tab -> jobs tab -> assert presence of job in that list
      //5) Cancel the job and assert that it has been canceled
    });
  });
});
