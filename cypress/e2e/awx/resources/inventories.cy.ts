import { randomString } from '../../../../framework/utils/random-string';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';

//This spec file needs to have tests added for constructed and smart inventories. See below.

describe('Inventories Tests', () => {
  let organization: Organization;
  let inventory: Inventory;
  let instanceGroup: InstanceGroup;
  let label: Label;
  let user: AwxUser;
  const kinds: Array<'' | 'smart'> = ['', 'smart'];

  kinds.forEach((kind) => {
    describe(`Inventories CRUD Tests (${kind === '' ? 'regular' : kind})`, () => {
      if (kind === '') {
        beforeEach(() => {
          const orgName = 'E2E Organization Inv tests' + randomString(4);
          cy.createAwxOrganization({ name: orgName }).then((org) => {
            organization = org;
            cy.createAwxLabel({ organization: organization.id }).then((lbl) => {
              label = lbl;
            });
            cy.createAwxInventory({ organization: organization.id }).then((inv) => {
              //the cy.createAwxInventory() custom command needs to be updated to accept the
              //'kind' parameter, in order to work with the conditional in this spec file
              inventory = inv;
            });
            cy.createAwxInstanceGroup().then((ig) => {
              instanceGroup = ig;
            });
            cy.createAwxUser({ organization: organization.id }).then((testUser) => {
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

        it('can create an inventory, assert info on details page, and delete inventory', () => {
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
            cy.filterTableBySingleSelect('name', igName);
            cy.selectTableRowByCheckbox('name', igName, {
              disableFilter: true,
            });
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

          cy.createAwxOrganization().then((org) => {
            cy.createAwxInventory({ organization: org.id }).then((inv1) => {
              cy.createAwxInventory({ organization: org.id }).then((inv2) => {
                cy.createAwxInventory({ organization: org.id }).then((inv3) => {
                  cy.navigateTo('awx', 'inventories');

                  cy.intercept(
                    'GET',
                    awxAPI`/inventories/?organization=${org?.id.toString()}&order_by=name&page=1&page_size=10`
                  ).as('getInventories');
                  cy.filterTableByMultiSelect('organization', [org?.name]);
                  cy.wait('@getInventories');

                  cy.get('[aria-label="Simple table"] tr').should('have.length', 4);
                  cy.contains(inv1.name);
                  cy.contains(inv2.name);
                  cy.contains(inv3.name);

                  cy.getByDataCy('select-all').click();

                  cy.clickToolbarKebabAction('delete-selected-inventories');

                  cy.get('#confirm').click();
                  cy.clickButton(/^Delete inventories/);
                  cy.contains(/^Success$/);
                  cy.clickButton(/^Close$/);
                  cy.contains('No results found');
                });
              });
            });
          });
        });
      }

      if (kind === 'smart') {
        it('can create a smart inventory, assert info on details page, and delete inventory', () => {
          //Assert that user is on the form view to create an inventory
          //Add an interception call for the newly created inventory, which will allow for the deletion at the end of the test
          //Add assertions for the information visible on the details screen of the new inventory
          //Add assertion verifying that the inventory has now been deleted- including verifying the 204 statusCode and
          //filtering a list to show no results
        });

        it('can edit the smart host filter on a smart inventory from the details view and assert info on details page', () => {
          //Create a smart inventory in the beforeEach hook
          //Assert the original details of the inventory
          //Assert the user navigating to the edit smart inventory form
          //Assert the edited changes of the inventory
        });
      }
    });
  });
});
