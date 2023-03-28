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

  it('renders the inventories list page', () => {
    cy.navigateTo(/^Inventories$/, false);
    cy.hasTitle(/^Inventories$/);
  });

  it('renders the inventory details page', () => {
    cy.navigateTo(/^Inventories$/, false);
    cy.clickRow(inventory.name);
    cy.hasTitle(inventory.name);
    cy.clickButton(/^Details$/);
    cy.contains('#name', inventory.name);
  });

  it('deletes an inventory from the details page', () => {
    cy.createAwxInventory().then((testInventory) => {
      cy.navigateTo(/^Inventories$/, false);
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
    cy.navigateTo(/^Inventories$/, false);
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
});
