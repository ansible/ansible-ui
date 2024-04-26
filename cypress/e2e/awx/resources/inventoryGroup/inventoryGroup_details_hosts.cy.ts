import { Organization } from '../../../../../frontend/awx/interfaces/Organization';
import { Credential } from '../../../../../frontend/awx/interfaces/Credential';
import { ExecutionEnvironment } from '../../../../../frontend/awx/interfaces/ExecutionEnvironment';

describe.skip('Inventory Groups hosts', () => {
  let organization: Organization;
  let machineCredential: Credential;
  let executionEnvironment: ExecutionEnvironment;

  before(() => {
    cy.awxLogin();
  });

  afterEach(() => {
    cy.deleteAwxCredential(machineCredential, { failOnStatusCode: false });
    cy.deleteAwxExecutionEnvironment(executionEnvironment, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  describe('Inventory Groups- Hosts Tab', () => {
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
        });
      });
    });

    it.skip('can add and disassociate a new host to a group', () => {
      // cy.createInventoryHostGroup(organization).then((result) => {
      // const { inventory, host, group } = result;
      //1) Use the inventory created in beforeEach block, navigate to the groups tab of that inventory,
      //........................then to the details page of that group (use the group created in beforeEach block)
      //2) On the group details page, click the host tab.
      //3) After adding a new host, assert the presence of the host in the list, along with its details.
      //4) Delete the host and assert the deletion.
      // });
    });

    it.skip('can add and disassociate an existing host to a group', () => {
      // cy.createInventoryHostGroup(organization).then((result) => {
      // const { inventory, host, group } = result;
      //1) Use the inventory created in beforeEach block, navigate to the groups tab of that inventory,
      //........................then to the details page of that group (use the group created in beforeEach block)
      //2) On the group details page, click the host tab.
      //3) After adding the existing host, assert the presence of the host in the list, along with its details.
      //4) Delete the host and assert the deletion.
      // });
    });

    it.skip('can edit a related host from the host tab', () => {
      // cy.createInventoryHostGroup(organization).then((result) => {
      // const { inventory, host, group } = result;
      //1) Use the inventory created in beforeEach block, navigate to the groups tab of that inventory,
      //........................then to the details page of that group (use the group created in beforeEach block)
      //2) On the group details page, click the host tab. Assert the host's original attributes.
      //3) On that list, click on the host and edit it.
      //4) Intercept the edit call
      //5) Use the interception to assert the edited values
      // });
    });

    it.skip("can run an ad-hoc command against a group's host", () => {
      // cy.createInventoryHostGroup(organization).then((result) => {
      // const { inventory, host, group } = result;
      //1) Use the inventory created in beforeEach block, navigate to the groups tab of that inventory,
      //........................then to the details page of that group (use the group created in beforeEach block)
      //2) On the group details page, click the host tab.
      //3) Click the Run Command button.
      //4) Use the host, EE, and credential created in the beforeEach block- these resources are needed to run a command against a group
      //5) Assert redirect to the job output screen
      //6) Navigate to the details page of the job and assert the values there match what was entered in the Run Command Wizard
      //7) Navigate back to the Inventory -> Jobs Tab to assert that the Run Command job shows up there
      // });
    });
  });
});
