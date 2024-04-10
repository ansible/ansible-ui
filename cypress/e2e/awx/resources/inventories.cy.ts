import { randomString } from '../../../../framework/utils/random-string';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';

describe('Inventories Tests', () => {
  let organization: Organization;
  let inventory: Inventory;
  let instanceGroup: InstanceGroup;
  let label: Label;
  let user: AwxUser;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxLabel({ organization: organization.id }).then((lbl) => {
        label = lbl;
      });
      cy.createAwxInventory({ organization: organization.id }).then((inv) => {
        inventory = inv;
      });
      cy.createAwxInstanceGroup().then((ig) => {
        instanceGroup = ig;
      });
      cy.createAwxUser(organization).then((testUser) => {
        user = testUser;
        cy.giveUserInventoryAccess(inventory.name, user.id, 'Read');
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxLabel(label, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxInstanceGroup(instanceGroup, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  describe('Inventories CRUD Tests', () => {
    it('can create an inventory from the list view, assert info on details page, and delete inventory', () => {
      //Refactor this test to match the updated test case and improve the assertions

      const inventoryName = 'E2E Inventory ' + randomString(4);
      cy.navigateTo('awx', 'inventories');
      cy.clickButton(/^Create inventory$/);
      cy.clickLink(/^Create inventory$/);
      //Assert that user is on the form view to create an inventory
      cy.get('[data-cy="name"]').type(inventoryName);
      cy.singleSelectByDataCy('organization', organization.name);
      cy.get('[data-cy="prevent_instance_group_fallback"]').click();
      cy.clickButton(/^Create inventory$/);
      //Add an interception call for the newly created inventory, which will allow for the deletion at the end of the test
      //Add assertions for the information visible on the details screen of the new inventory
      cy.verifyPageTitle(inventoryName);
      cy.hasDetail(/^Organization$/, organization.name);
      cy.hasDetail(/^Enabled options$/, 'Prevent instance group fallback');
      cy.clickPageAction('delete-inventory');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete inventory/);
      //Add assertion verifying that the inventory has now been deleted- including verifying the 204 statusCode and
      //filtering a list to show no results
      cy.verifyPageTitle('Inventories');
    });

    it('can edit an inventory from the list view and assert info on details page', () => {
      //Refactor this test to match the updated test case and improve the assertions

      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.get(`[data-cy="row-id-${inventory.id}"]`).within(() => {
        cy.get('[data-cy="edit-inventory"]').click();
      });
      cy.get('#instance-group-select-form-group').within(() => {
        cy.get('button[aria-label="Options menu"]').click();
      });
      const igName = instanceGroup?.name;
      if (igName) {
        cy.selectTableRowInDialog(igName);
        cy.contains('button', 'Confirm').click();
        cy.contains('button', 'Save inventory').click(); //Add an interception call for the edited inventory
        cy.verifyPageTitle(inventory.name);
        //Add assertions to verify the updated information is reflecting on the details screen of the edited inventory
        cy.hasDetail(/^Instance groups$/, igName);
      }
    });

    it('can edit an inventory from the details view and assert info on details page', () => {
      //Refactor this test to match the updated test case and improve the assertions

      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      //Add more assertions to verify that the user is now on the details screen and to assert the inventory's original info
      cy.clickButton(/^Edit inventory/);
      cy.selectDropdownOptionByResourceName('labels', label.name);
      cy.dataEditorTypeByDataCy('variables', 'remote_install_path: /opt/my_app_config');
      cy.contains('button', 'Save inventory').click(); //Add an interception call for the edited inventory
      cy.verifyPageTitle(inventory.name);
      //Add assertions to verify the updated information is reflecting on the details screen of the edited inventory
      cy.assertMonacoTextField('remote_install_path: /opt/my_app_config'); //Refactor this line to use the updated custom command
      cy.hasDetail(/^Labels$/, label.name);
    });

    it('can copy an inventory on the details view and assert that the copy has been successful', () => {
      //Refactor this test to match the updated test case and improve the assertions

      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name); //Add more assertions to verify that the user is now on the details screen
      cy.clickPageAction('copy-inventory');
      cy.hasAlert(`${inventory.name} copied`);
      //Assert the presence of the original and the copy by performing a search on the list of inventories
    });

    it('can copy an inventory on the list view and assert that the copy has been successful', () => {
      //Refactor this test to match the updated test case and improve the assertions

      cy.navigateTo('awx', 'inventories'); //Add assertion to verify the user is on the inventories list view
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowKebabAction(inventory.name, 'copy-inventory', false);
      cy.hasAlert(`${inventory.name.toString()} copied`);
      //Assert the presence of the original and the copy by performing a search on the list of inventories
    });

    it('can delete an inventory from the inventory list row item', () => {
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowKebabAction(inventory.name, 'delete-inventory', false);
      //Add assertion to show the presence of the expected inventory
      cy.get('#confirm').click();
      cy.clickButton(/^Delete inventory/);
      //Add interception for the delete call to allow verification of the resource having been deleted
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
      //Assert deletion of the inventory
    });

    it('can delete an inventory from the inventory list toolbar', () => {
      //Improve the assertions in this test

      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.selectTableRowByCheckbox('name', inventory.name, { disableFilter: true });
      //Add an assertion that the expected inventory name appears where it should
      cy.clickToolbarKebabAction('delete-selected-inventories');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete inventory/);
      cy.contains(/^Success$/); //Add assertion here; cy.contains is not enough of an assertion by itself
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
      //Add an assertion that the inventory does not appear upon a list search
    });

    it.skip('can bulk delete inventories from the list view and verify deletion', () => {
      //Assert:
      //(1) The presence of a certain number of inventories, utilize search to ensure the list only displays those inventories
      //(2) The absence of those inventories after the bulk deletion has been performed, by doing a search and by intercepting
      //.......the delete call and asserting the expected statusCode from the API (probably a 204)
    });
  });

  describe('Inventories Access Tab', () => {
    it.skip('can assign and then remove the following role access to a user of an inventory: Admin, Ad Hoc, Update, Use, Read', () => {
      //Assert:
      //(1) An inventory with no assigned roles
      //(2) A user can assign the listed roles to a particular user
      //(3) The user and their roles can be viewed on the Access tab inside the inventory
      //(4) User can remove role access that was given and assert that the access has been removed
    });

    it.skip('can assign and then remove the following role access to a team of an inventory: Admin, Ad Hoc, Update, Use, Read', () => {
      //Assert:
      //(1) An inventory with no assigned roles
      //(2) A user can assign the listed roles to a particular team
      //(3) The team and its roles can be viewed on the Access tab inside the inventory
      //(4) User can remove a team's role access that was given and assert that the access has been removed
    });
  });

  describe('Inventories Jobs Tab', () => {
    it.skip('can access the jobs tab of an inventory and view jobs associated with that inventory, including navigating to that job', () => {
      //Assert:
      //(1) JT is created with the inventory in question and then JT is launched
      //(2) User can see the job on the jobs tab inside the inventory
      //(3) User can navigate to the job output of that job
    });

    it.skip('can launch a job template using a particular inventory, view the job on the jobs tab, and then delete the job from the jobs tab list', () => {
      //Assert:
      //(1) JT is created with the inventory in question and then JT is launched
      //(2) User can see the job on the jobs tab inside the inventory
      //(3) User can delete the job from the jobs tab of the inventory and verify deletion
    });

    it.skip('can launch a job template using a particular inventory, view the job on the jobs tab, and cancel the job before it has finished running', () => {
      //Assert:
      //(1) JT is created with the inventory in question and then JT is launched
      //(2) User can see the job on the jobs tab inside the inventory
      //(3) Test should put the job into a perpetual state of running in order to allow Cypress to have a test to cancel
      //(4) User can navigate to the jobs tab in the inventory and cancel the running job and verify cancellation
    });
  });

  describe('Inventories Job Templates Tab', () => {
    it.skip('can create a job template from the job templates tab of an inventory and the inventory will automatically populate in the form', () => {
      //This behavior needs to be implemented in the UI
      //Assert:
      //(1) the creation of the JT from the JT tab of the inventory
      //(2) the applicable inventory is the one populated in the form
      //(3) the details page of the newly created JT shows the inventory
    });
  });
});
