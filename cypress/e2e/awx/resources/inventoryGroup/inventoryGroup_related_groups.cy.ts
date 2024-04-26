import { randomString } from '../../../../../framework/utils/random-string';
import { Inventory } from '../../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../../frontend/awx/interfaces/Organization';
import { Credential } from '../../../../../frontend/awx/interfaces/Credential';
import { ExecutionEnvironment } from '../../../../../frontend/awx/interfaces/ExecutionEnvironment';

describe('Inventory Groups related groups', () => {
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

  describe('Inventory Groups- Related Groups Tab', () => {
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

    it('can add and disassociate new related groups', () => {
      cy.createInventoryHostGroup(organization).then((result) => {
        const { inventory, host, group } = result;
        const newRelatedGroup = 'New test group' + randomString(4);

        cy.navigateTo('awx', 'inventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.verifyPageTitle(inventory.name);
        cy.get(`[href*="/infrastructure/inventories/inventory/${inventory.id}/hosts?"]`).click();
        cy.getByDataCy('name-column-cell').should('contain', host.name);
        cy.clickLink(/^Groups$/);
        cy.filterTableByMultiSelect('name', [group.name]);
        cy.clickTableRowLink('name', group.name, { disableFilter: true });
        cy.verifyPageTitle(group.name);
        cy.clickLink(/^Related Groups/);
        cy.clickButton(/^New group/);
        cy.verifyPageTitle('Create new group');
        cy.get('[data-cy="name-form-group"]').type(newRelatedGroup);
        cy.get('[data-cy="Submit"]').click();
        cy.contains(newRelatedGroup);
        cy.filterTableByMultiSelect('name', [newRelatedGroup]);
        cy.selectTableRow(newRelatedGroup, false);
        cy.clickToolbarKebabAction('disassociate-selected-groups');
        cy.get('#confirm').click();
        cy.clickButton(/^Disassociate groups/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close/);
        cy.clickButton(/^Clear all filters$/);

        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      });
    });

    it('can add and disassociate existing related groups', () => {
      cy.createInventoryHostGroup(organization).then((result) => {
        const { inventory, host, group } = result;
        const newGroup = 'New test group' + randomString(4);

        cy.navigateTo('awx', 'inventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.get(`[href*="/infrastructure/inventories/inventory/${inventory.id}/hosts?"]`).click();
        cy.getByDataCy('name-column-cell').should('contain', host.name);
        cy.clickLink(/^Groups$/);
        cy.clickButton(/^Create group/);
        cy.get('[data-cy="name-form-group"]').type(newGroup);
        cy.get('[data-cy="Submit"]').click();
        cy.clickLink(/^Back to Groups/);
        cy.filterTableByMultiSelect('name', [group.name]);
        cy.clickTableRowLink('name', group.name, { disableFilter: true });
        cy.verifyPageTitle(group.name);
        cy.clickLink(/^Related Groups/);
        cy.clickButton(/^Existing group/);
        cy.filterTableByMultiSelect('name', [newGroup]);
        cy.selectTableRow(newGroup, false);
        cy.clickButton(/^Add groups/);
        cy.contains(newGroup);
        cy.filterTableByMultiSelect('name', [newGroup]);
        cy.selectTableRow(newGroup, false);
        cy.clickToolbarKebabAction('disassociate-selected-groups');
        cy.get('#confirm').click();
        cy.clickButton(/^Disassociate groups/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close/);
        cy.clickButton(/^Clear all filters$/);

        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      });
    });

    it.skip('can edit a related group from the related group tab', () => {
      // cy.createInventoryHostGroup(organization).then((result) => {
      // const { inventory, host, group } = result;
      //1) Use the inventory created in beforeEach block, navigate to the groups tab of that inventory,
      //........................then to the details page of that group (use the group created in beforeEach block)
      //2) On the group details page, click the related groups tab. Assert the group's original attributes.
      //3) On that list, click on the group and edit it.
      //4) Intercept the edit call
      //5) Use the interception to assert the edited values
      //});
    });

    it.skip("can run an ad-hoc command against a group's related group", () => {
      // cy.createInventoryHostGroup(organization).then((result) => {
      // const { inventory, host, group } = result;
      //1) Use the inventory created in beforeEach block, navigate to the groups tab of that inventory,
      //........................then to the details page of that group (use the group created in beforeEach block)
      //2) On the group details page, click the related groups tab.
      //3) Click the Run Command button.
      //4) Use the group, EE, and credential created in the beforeEach block- these resources are needed to run a command against a group
      //5) Assert redirect to the job output screen
      //6) Navigate to the details page of the job and assert the values there match what was entered in the Run Command Wizard
      //7) Navigate back to the Inventory -> Jobs Tab to assert that the Run Command job shows up there
      //});
    });
  });
});
