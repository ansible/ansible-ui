/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { randomString } from '../../../../framework/utils/random-string';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { User } from '../../../../frontend/awx/interfaces/User';

describe('inventories', () => {
  let organization: Organization;
  let inventory: Inventory;
  let instanceGroup: InstanceGroup;
  let label: Label;
  let user: User;

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

  it('can render the inventories list page', () => {
    cy.navigateTo('awx', 'inventories');
    cy.verifyPageTitle('Inventories');
  });

  it('creates an inventory from the inventories list page', () => {
    const inventoryName = 'E2E Inventory ' + randomString(4);
    cy.navigateTo('awx', 'inventories');
    cy.clickButton(/^Create inventory$/);
    cy.clickLink(/^Create inventory$/);
    cy.get('[data-cy="name"]').type(inventoryName);
    cy.selectDropdownOptionByResourceName('organization', organization.name);
    cy.get('[data-cy="prevent_instance_group_fallback"]').click();
    cy.clickButton(/^Create inventory$/);
    cy.verifyPageTitle(inventoryName);
    cy.hasDetail(/^Organization$/, organization.name);
    cy.hasDetail(/^Enabled options$/, 'Prevent instance group fallback');
    // Clean up this inventory
    cy.clickPageAction('delete-inventory');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete inventory/);
    cy.verifyPageTitle('Inventories');
  });

  it('edits an inventory from the inventory list row item', () => {
    cy.navigateTo('awx', 'inventories');
    cy.searchAndDisplayResource(inventory.name);
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
      cy.contains('button', 'Save inventory').click();
      cy.verifyPageTitle(inventory.name);
      cy.hasDetail(/^Instance groups$/, igName);
    }
  });

  it('edits an inventory from the inventory details page', () => {
    cy.navigateTo('awx', 'inventories');
    cy.clickTableRow(inventory.name);
    cy.verifyPageTitle(inventory.name);
    cy.clickButton(/^Edit inventory/);
    cy.selectDropdownOptionByResourceName('labels', label.name);
    cy.typeMonacoTextField('remote_install_path: /opt/my_app_config');
    cy.contains('button', 'Save inventory').click();
    cy.verifyPageTitle(inventory.name);
    cy.assertMonacoTextField('remote_install_path: /opt/my_app_config');
    cy.hasDetail(/^Labels$/, label.name);
  });

  it('deletes an inventory from the details page', () => {
    cy.navigateTo('awx', 'inventories');
    cy.clickTableRow(inventory.name);
    cy.verifyPageTitle(inventory.name);
    cy.clickPageAction('delete-inventory');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete inventory/);
    cy.verifyPageTitle('Inventories');
  });

  it('copies an inventory from the details page', () => {
    cy.navigateTo('awx', 'inventories');
    cy.clickTableRow(inventory.name);
    cy.verifyPageTitle(inventory.name);
    cy.clickPageAction('copy-inventory');
    cy.hasAlert(`${inventory.name} copied`);
  });

  it('test inventory with host and group', () => {
    cy.createInventoryHostGroup(organization).then((result) => {
      const { inventory, host, group } = result;
      expect(host.inventory).to.eq(inventory.id);
      expect(group.inventory).to.eq(inventory.id);
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });
  });

  it('test inventory group can be edited from groups table row', () => {
    cy.createInventoryHostGroup(organization).then((result) => {
      const { inventory, group } = result;
      cy.navigateTo('awx', 'inventories');
      cy.clickTableRow(inventory.name);
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Groups$/);
      cy.clickTableRowKebabAction(group.name as string, 'edit-group', true);
      cy.verifyPageTitle('Edit group');
      cy.get('[data-cy="name-form-group"]').type('-changed');
      cy.get('[data-cy="Submit"]').click();
      cy.verifyPageTitle(group.name + '-changed');
    });
  });

  it('test inventory group can be edited from groups details', () => {
    cy.createInventoryHostGroup(organization).then((result) => {
      const { inventory, group } = result;
      cy.navigateTo('awx', 'inventories');
      cy.clickTableRow(inventory.name);
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Groups$/);
      cy.clickTableRow(group.name as string);
      cy.verifyPageTitle(group.name as string);
      cy.get('[data-cy="edit-group"]').click();
      cy.verifyPageTitle('Edit group');
      cy.get('[data-cy="name-form-group"]').type('-changed');
      cy.get('[data-cy="Submit"]').click();
      cy.verifyPageTitle(group.name + '-changed');
    });
  });

  it('can copy an inventory from the inventory list row item', () => {
    cy.navigateTo('awx', 'inventories');
    cy.clickTableRowKebabAction(inventory.name, 'copy-inventory', true);
    cy.hasAlert(`${inventory.name.toString()} copied`);
    cy.deleteAwxInventory(inventory);
  });

  it('can delete an inventory from the inventory list row item', () => {
    cy.navigateTo('awx', 'inventories');
    cy.clickTableRowKebabAction(inventory.name, 'delete-inventory', true);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete inventory/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('can delete an inventory from the inventory list toolbar', () => {
    cy.navigateTo('awx', 'inventories');
    cy.selectTableRow(inventory.name, true);
    cy.clickToolbarKebabAction('delete-selected-inventories');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete inventory/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
