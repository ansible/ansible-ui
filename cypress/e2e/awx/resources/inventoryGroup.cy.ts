import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
//<<<<<<< HEAD
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { ExecutionEnvironment } from '../../../../frontend/awx/interfaces/ExecutionEnvironment';

describe('Inventory Groups', () => {
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

  describe('Inventory Groups- List View', () => {
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

    it('can create a group, assert info on details page, then delete group from the details page', () => {
      cy.createAwxInventory().then((inv) => {
        inventory = inv;
        const newGroupName = 'E2E Group ' + randomString(4);

        cy.visit(`/infrastructure/inventories/inventory/${inventory.id}/groups?`);
        cy.clickButton(/^Create group$/);
        cy.verifyPageTitle('Create new group');
        cy.get('[data-cy="name"]').type(newGroupName);
        cy.get('[data-cy="description"]').type('This is a description');
        cy.dataEditorTypeByDataCy('variables', 'test: true');
        cy.clickButton(/^Save/);
        cy.hasDetail(/^Name$/, newGroupName);
        cy.hasDetail(/^Description$/, 'This is a description');
        cy.hasDetail(/^Variables$/, 'test: true');
        cy.get('[data-cy="actions-dropdown"]').click();
        cy.get('[data-cy="delete-group"]').click();
        cy.get('[data-cy="delete-groups-dialog-radio-delete"]').click();
        cy.get('[data-cy="delete-group-modal-delete-button"]').click();
        cy.getByDataCy('empty-state-title').should(
          'contain',
          'There are currently no groups added to this inventory.'
        );

        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      });
    });

    it('can edit an inventory group from the groups list view', () => {
      cy.createInventoryHostGroup(organization).then((result) => {
        const { inventory, host, group } = result;

        cy.navigateTo('awx', 'inventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.verifyPageTitle(inventory.name);
        cy.get(`[href*="/infrastructure/inventories/inventory/${inventory.id}/hosts?"]`).click();
        cy.getByDataCy('name-column-cell').should('contain', host.name);
        cy.clickLink(/^Groups$/);
        cy.clickTableRowKebabAction(group.name, 'edit-group', true);
        cy.verifyPageTitle('Edit group');
        cy.get('[data-cy="name-form-group"]').type('-changed');
        cy.get('[data-cy="Submit"]').click();
        cy.verifyPageTitle(group.name + '-changed');

        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      });
    });

    it.skip('can run an ad-hoc command against a group', () => {
      // cy.createInventoryHostGroup(organization).then((result) => {
      // const { inventory, host, group } = result;
      //1) Use the inventory created in beforeEach block, access the groups tab of that inventory
      //2) Use the group, EE, and credential created in the beforeEach block- these resources are needed to run a command against a group
      //3) Assert redirect to the job output screen
      //4) Navigate to the details page of the job and assert the values there match what was entered in the Run Command Wizard
      //5) Navigate back to the Inventory -> Jobs Tab to assert that the Run Command job shows up there
      //});
    });

    it.skip('can delete a group from the group list view', () => {
      // cy.createInventoryHostGroup(organization).then((result) => {
      // const { inventory, host, group } = result;
      //1) Use the inventory created in beforeEach block, access the groups tab of that inventory
      //2) Use the group created in the beforeEach block
      //3) Assert the existence of the group
      //4) Delete the group, intercept the Delete call
      //5) Assert that the group is not found in a search; assert the statusCode of the Delete call
      //});
    });

    it.skip('can bulk delete groups from the group list view', () => {
      // cy.createInventoryHostGroup(organization).then((result) => {
      // const { inventory, host, group } = result;
      //1) Use the inventory created in beforeEach block, access the groups tab of that inventory
      //2) Create 2 groups in this test for the purpose of delete
      //3) Assert the existence of the groups
      //4) Delete the groups, intercept the Delete call
      //5) Assert that the groups are not found in a search; assert the statusCode of the Delete call
      //});
    });
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
        cy.clickTableRow(group.name); //Refactor this line to use the updated custom command
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
        cy.clickTableRow(group.name); //Refactor this line to use the updated custom command
        cy.verifyPageTitle(group.name);
        cy.clickLink(/^Related Groups/);
        cy.clickButton(/^New group/);
        cy.verifyPageTitle('Create new group');
        cy.get('[data-cy="name-form-group"]').type(newRelatedGroup);
        cy.get('[data-cy="Submit"]').click();
        cy.contains(newRelatedGroup);
        cy.selectTableRow(newRelatedGroup, true);
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
        cy.clickTableRow(group.name); //Refactor this line to use the updated custom command
        cy.verifyPageTitle(group.name);
        cy.clickLink(/^Related Groups/);
        cy.clickButton(/^Existing group/);
        cy.selectTableRow(newGroup);
        cy.clickButton(/^Add groups/);
        cy.contains(newGroup);
        cy.selectTableRow(newGroup, true);
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
