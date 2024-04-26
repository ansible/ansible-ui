import { Inventory } from '../../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../../frontend/awx/interfaces/Organization';
import { Credential } from '../../../../../frontend/awx/interfaces/Credential';
import { ExecutionEnvironment } from '../../../../../frontend/awx/interfaces/ExecutionEnvironment';

describe('Inventory Groups details', () => {
  let organization: Organization;
  let inventory: Inventory;
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

  

  describe('Inventory Groups- Details View', () => {
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

    it('can edit an inventory group from the group details view', () => {
      cy.createInventoryHostGroup(organization).then((result) => {
        const { inventory, host, group } = result;

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
        cy.get('[data-cy="edit-group"]').click();
        cy.verifyPageTitle('Edit group');
        cy.get('[data-cy="name-form-group"]').type('-changed');
        cy.get('[data-cy="Submit"]').click();
        cy.verifyPageTitle(group.name + '-changed');

        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      });
    });

    it.skip('can delete an inventory group from the group details view', () => {
      // cy.createInventoryHostGroup(organization).then((result) => {
      // const { inventory, host, group } = result;
      //1) Use the inventory created in beforeEach block, access the groups tab of that inventory, then visit the group details page
      //2) Use the group created in the beforeEach block
      //3) Assert the details on the group details page
      //4) Delete the group, intercept the Delete call
      //5) Assert that the group is not found in a search; assert the statusCode of the Delete call
      //});
    });
  });
});
