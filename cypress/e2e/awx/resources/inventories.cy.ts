/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { randomString } from '../../../../framework/utils/random-string';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('inventories', () => {
  let organization: Organization;
  let inventory: Inventory;
  let instanceGroup: InstanceGroup;
  let label: Label;

  before(() => {
    cy.awxLogin();

    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxLabel({ organization: organization.id }).then((lbl) => {
        label = lbl;
      });
    });

    cy.createAwxInventory().then((inv) => {
      inventory = inv;
    });

    cy.createAwxInstanceGroup().then((ig) => {
      instanceGroup = ig;
    });
  });

  after(() => {
    cy.deleteAwxInstanceGroup(instanceGroup);
    cy.deleteAwxOrganization(organization);
    cy.deleteAwxInventory(inventory);
  });

  it('can render the inventories list page', () => {
    cy.navigateTo(/^Inventories$/);
    cy.hasTitle(/^Inventories$/);
  });

  it('creates an inventory from the inventories list page', () => {
    const inventoryName = 'E2E Inventory ' + randomString(4);
    cy.navigateTo(/^Inventories$/);
    cy.clickButton(/^Create inventory$/);
    cy.clickLink(/^Create inventory$/);
    cy.typeInputByLabel(/^Name$/, inventoryName);
    cy.selectDropdownOptionByLabel(/^Organization$/, organization.name);
    cy.getCheckboxByLabel('Prevent instance group fallback').click();
    cy.clickButton(/^Create inventory$/);
    cy.hasTitle(inventoryName);
    cy.hasDetail(/^Organization$/, organization.name);
    cy.hasDetail(/^Enabled options$/, 'Prevent instance group fallback');
    // Clean up this inventory
    cy.clickPageAction(/^Delete inventory/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete inventory/);
    cy.hasTitle(/^Inventories$/);
  });

  it('edits an inventory from the inventory list row item', () => {
    cy.navigateTo(/^Inventories$/);
    cy.clickTableRowActionIcon(inventory?.name, 'Edit inventory');
    cy.get('input[aria-label="Add instance groups"]')
      .parent()
      .within(() => {
        cy.get('button[aria-label="Options menu"]').click();
      });
    const igName = instanceGroup?.name;
    if (igName) {
      cy.selectTableRowInDialog(igName);
      cy.contains('button', 'Confirm').click();
      cy.contains('button', 'Save inventory').click();
      cy.hasTitle(inventory.name);
      cy.hasDetail(/^Instance groups$/, igName);
    }
  });

  it('edits an inventory from the inventory details page', () => {
    cy.navigateTo(/^Inventories$/);
    cy.clickTableRow(inventory.name);
    cy.hasTitle(inventory.name);
    cy.clickButton(/^Edit inventory/);
    cy.selectDropdownOptionByLabel(/^Labels$/, label.name);
    cy.contains('button', 'Save inventory').click();
    cy.hasTitle(inventory.name);
    cy.hasDetail(/^Labels$/, label.name);
  });

  it('deletes an inventory from the details page', () => {
    cy.createAwxInventory().then((testInventory) => {
      cy.navigateTo(/^Inventories$/);
      cy.clickTableRow(testInventory.name);
      cy.hasTitle(testInventory.name);
      cy.clickPageAction(/^Delete inventory/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete inventory/);
      cy.hasTitle(/^Inventories$/);
      cy.requestDelete(`/api/v2/organizations/${testInventory.organization}/`, true);
    });
  });

  it('copies an inventory from the details page', () => {
    cy.navigateTo(/^Inventories$/);
    cy.clickTableRow(inventory.name);
    cy.hasTitle(inventory.name);
    cy.clickPageAction(/^Copy inventory/);
    cy.hasAlert(`${inventory.name} copied`);
  });

  it('test inventory with host and group', () => {
    cy.createInventoryHostGroup(organization).then((result) => {
      const { inventory, host, group } = result;
      expect(host.inventory).to.eq(inventory.id);
      expect(group.inventory).to.eq(inventory.id);
    });
  });

  it('can copy an inventory from the inventory list row item', () => {
    cy.createAwxInventory().then((testInventory) => {
      cy.navigateTo(/^Inventories$/);
      cy.clickTableRowKebabAction(testInventory.name, /^Copy inventory$/, true);
      cy.hasAlert(`${testInventory.name.toString()} copied`);
      cy.requestDelete(`/api/v2/inventories/${testInventory.id.toString()}/`, true);
    });
  });

  it('can delete an inventory from the inventory list row item', () => {
    cy.createAwxInventory().then((testInventory) => {
      cy.navigateTo(/^Inventories$/);
      cy.clickTableRowKebabAction(testInventory.name, /^Delete inventory$/, true);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete inventory/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('can delete an inventory from the inventory list toolbar', () => {
    cy.createAwxInventory().then((testInventory) => {
      cy.navigateTo(/^Inventories$/);
      cy.selectTableRow(testInventory.name, true);
      cy.clickToolbarKebabAction(/^Delete selected inventories$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete inventory/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
