import { randomString } from '../../../../framework/utils/random-string';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../support/utils';
import { AwxItemsResponse } from '../../../../frontend/awx/common/AwxItemsResponse';

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
            cy.createAwxInstanceGroup().then((ig) => {
              instanceGroup = ig;
              cy.createAwxInventory(organization).then((inv) => {
                //the cy.createAwxInventory() custom command needs to be updated to accept the
                //'kind' parameter, in order to work with the conditional in this spec file
                inventory = inv;
              });
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
          const inventoryName = 'E2E Inventory ' + randomString(4);
          cy.navigateTo('awx', 'inventories');
          cy.clickButton(/^Create inventory$/);
          cy.get('#create-inventory').click();
          cy.get('[data-cy="name"]').type(inventoryName);
          cy.singleSelectByDataCy('organization', organization.name);
          cy.get('[data-cy="prevent_instance_group_fallback"]').click();
          cy.clickButton(/^Create inventory$/);
          cy.verifyPageTitle(inventoryName);
          cy.hasDetail(/^Organization$/, organization.name);
          cy.hasDetail(/^Enabled options$/, 'Prevent instance group fallback');
          cy.clickPageAction('delete-inventory');
          cy.get('#confirm').click();
          cy.clickButton(/^Delete inventory/);
          cy.verifyPageTitle('Inventories');
        });

        //Skipping due to https://issues.redhat.com/browse/AAP-28597
        it.skip('can edit an inventory from the list view and assert info on details page', () => {
          cy.navigateTo('awx', 'inventories');
          cy.filterTableBySingleSelect('name', inventory.name);
          cy.get(`[data-cy="row-id-${inventory.id}"]`).within(() => {
            cy.get('[data-cy="edit-inventory"]').click();
          });
          cy.multiSelectByDataCy('instance-group-select-form-group', [instanceGroup.name]);
          cy.contains('button', 'Save inventory').click();
          cy.verifyPageTitle(inventory.name);
          cy.hasDetail(/^Instance groups$/, instanceGroup.name);
        });

        it('can edit an inventory from the details view and assert info on details page', () => {
          cy.navigateTo('awx', 'inventories');
          cy.filterTableBySingleSelect('name', inventory.name);
          cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
          cy.verifyPageTitle(inventory.name);
          cy.clickButton(/^Edit inventory/);
          cy.selectDropdownOptionByResourceName('labels', label.name);
          cy.dataEditorTypeByDataCy('variables', 'remote_install_path: /opt/my_app_config');
          cy.contains('button', 'Save inventory').click();
          cy.verifyPageTitle(inventory.name);
          cy.assertMonacoTextField('remote_install_path: /opt/my_app_config');
          cy.hasDetail(/^Labels$/, label.name);
        });

        it('can copy an inventory on the details view and assert that the copy has been successful', () => {
          cy.navigateTo('awx', 'inventories');
          cy.filterTableBySingleSelect('name', inventory.name);
          cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
          cy.verifyPageTitle(inventory.name);
          cy.clickPageAction('copy-inventory');
          cy.hasAlert(`${inventory.name} copied`);
        });

        //Skipping due to https://issues.redhat.com/browse/AAP-28597
        it.skip('can copy an inventory on the list view and assert that the copy has been successful', () => {
          cy.navigateTo('awx', 'inventories');
          cy.filterTableBySingleSelect('name', inventory.name);
          cy.clickTableRowAction('name', inventory.name, 'copy-inventory', {
            disableFilter: true,
            inKebab: true,
          });
          cy.hasAlert(`${inventory.name.toString()} copied`);
        });

        it('can delete an inventory from the inventory list row item', () => {
          cy.navigateTo('awx', 'inventories');
          cy.filterTableBySingleSelect('name', inventory.name);
          cy.clickTableRowAction('name', inventory.name, 'delete-inventory', {
            disableFilter: true,
            inKebab: true,
          });
          cy.get('#confirm').click();
          cy.clickButton(/^Delete inventory/);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clickButton(/^Clear all filters$/);
        });

        //Skipping due to https://issues.redhat.com/browse/AAP-28597
        it.skip('can delete an inventory from the inventory list toolbar', () => {
          cy.navigateTo('awx', 'inventories');
          cy.filterTableBySingleSelect('name', inventory.name);
          cy.selectTableRowByCheckbox('name', inventory.name, { disableFilter: true });
          cy.clickToolbarKebabAction('delete-selected-inventories');
          cy.get('#confirm').click();
          cy.clickButton(/^Delete inventory/);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clickButton(/^Clear all filters$/);
        });

        it('can bulk delete inventories from the list view and verify deletion', () => {
          cy.createAwxOrganization().then((org) => {
            cy.createAwxInventory(org).then((inv1) => {
              cy.createAwxInventory(org).then((inv2) => {
                cy.createAwxInventory(org).then((inv3) => {
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
        it('can create, edit a smart inventory, assert info on details page, and delete inventory', () => {
          cy.createAwxOrganization().then((org) => {
            const name = randomE2Ename();
            cy.navigateTo('awx', 'inventories');
            cy.getByDataCy('create-inventory').click();
            cy.getByDataCy('create-smart-inventory').click();
            cy.getByDataCy('name').type(name);
            cy.getByDataCy('description').type('description');
            cy.getByDataCy('organization').click();
            cy.contains('button', 'Browse').click();
            cy.get(`[role="dialog"]`).within(() => {
              cy.get(`[aria-label="Simple table"] tr`);
              cy.contains('button', 'Cancel');
              cy.contains('button', 'Confirm');
              cy.get('#filter');
            });
            cy.get(`[role="dialog"]`).within(() => {
              cy.filterTableByMultiSelect('name', [org.name]);
              cy.get(`[aria-label="Simple table"] tr`).should('have.length', 2);
              cy.get(`input[type="radio"]`).click();
              cy.contains('button', 'Confirm').click();
            });
            cy.getByDataCy('host-filter').type('name=host1');
            cy.getByDataCy('Submit').click();
            cy.getByDataCy('name').should('have.text', name);
            cy.getByDataCy('description').should('have.text', 'description');
            cy.getByDataCy('organization').should('have.text', org.name);
            cy.contains(`[data-cy="smart-host-filter"]`, 'name=host1');
            cy.getByDataCy('edit-inventory').click();
            cy.getByDataCy('host-filter').clear().type('name=host2');
            cy.getByDataCy('description').clear().type('updated description');
            cy.getByDataCy('Submit').click();
            cy.getByDataCy('description').should('have.text', 'updated description');
            cy.contains(`[data-cy="smart-host-filter"]`, 'name=host2');
            cy.clickKebabAction('actions-dropdown', 'delete-inventory');
            cy.clickModalConfirmCheckbox();
            cy.clickModalButton('Delete inventory');
            cy.requestGet<AwxItemsResponse<Notification>>(awxAPI`/inventories/?name={name}`)
              .its('results')
              .then((results) => {
                expect(results).to.have.length(0);
              });
            cy.deleteAwxOrganization(org);
          });
        });
      }
    });
  });
});
