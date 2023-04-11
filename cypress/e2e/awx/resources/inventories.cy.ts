/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('inventories', () => {
  let organization: Organization;
  let inventory: Inventory;

  before(() => {
    cy.awxLogin();

    cy.createAwxOrganization().then((org) => {
      organization = org;
    });

    cy.createAwxInventory().then((inv) => {
      inventory = inv;
    });
  });

  after(() => {
    cy.deleteAwxOrganization(organization);
    cy.deleteAwxInventory(inventory);
  });

  it('can render the inventories list page', () => {
    cy.navigateTo(/^Inventories$/);
    cy.hasTitle(/^Inventories$/);
  });

  it('renders the inventory details page', () => {
    cy.navigateTo(/^Inventories$/);
    cy.clickRow(inventory.name);
    cy.hasTitle(inventory.name);
    cy.clickButton(/^Details$/);
    cy.contains('#name', inventory.name);
  });

  it('deletes an inventory from the details page', () => {
    cy.createAwxInventory().then((testInventory) => {
      cy.navigateTo(/^Inventories$/);
      cy.clickRow(testInventory.name);
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
    cy.clickRow(inventory.name);
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
      cy.clickRowAction(testInventory.name, /^Copy inventory$/, true);
      cy.hasAlert(`${testInventory.name.toString()} copied`);
      cy.requestDelete(`/api/v2/inventories/${testInventory.id.toString()}/`, true);
    });
  });

  it('can delete an inventory from the inventory list row item', () => {
    cy.createAwxInventory().then((testInventory) => {
      cy.navigateTo(/^Inventories$/);
      cy.clickRowAction(testInventory.name, /^Delete inventory$/, true);
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
      cy.selectRow(testInventory.name, true);
      cy.clickToolbarAction(/^Delete selected inventories$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete inventory/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
