import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { User } from '../../../../frontend/awx/interfaces/User';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Label } from '../../../../frontend/awx/interfaces/Label';

describe('Inventory Groups', () => {
  let organization: Organization;
  let inventory: Inventory;
  let user: User;
  let instanceGroup: InstanceGroup;
  let label: Label;

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
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxLabel(label, { failOnStatusCode: false });
    cy.deleteAwxInstanceGroup(instanceGroup, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
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

  it('can add and remove new related groups', () => {
    cy.createInventoryHostGroup(organization).then((result) => {
      const { inventory, group } = result;
      const newRelatedGroup = 'New test group' + randomString(4);
      cy.navigateTo('awx', 'inventories');
      cy.clickTableRow(inventory.name);
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Groups$/);
      cy.clickTableRow(group.name as string);
      cy.verifyPageTitle(group.name as string);
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
    });
  });

  it('can add and remove existing related groups', () => {
    const newGroup = 'New test group' + randomString(4);
    cy.createInventoryHostGroup(organization).then((result) => {
      const { inventory, group } = result;
      cy.navigateTo('awx', 'inventories');
      cy.clickTableRow(inventory.name);
      cy.clickLink(/^Groups$/);
      cy.clickButton(/^Create group/);
      cy.get('[data-cy="name-form-group"]').type(newGroup);
      cy.get('[data-cy="Submit"]').click();
      cy.clickLink(/^Back to Groups/);
      cy.clickTableRow(group.name as string);
      cy.verifyPageTitle(group.name as string);
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
    });
  });

  describe('Inventory Group Actions', () => {
    beforeEach(() => {
      const inventoryName = 'E2E Inventory group ' + randomString(4);
      cy.navigateTo('awx', 'inventories');
      cy.verifyPageTitle('Inventories');
      cy.clickButton(/^Create inventory$/);
      cy.clickLink(/^Create inventory$/);
      cy.get('[data-cy="name"]').type(inventoryName);
      cy.singleSelectBy('[data-cy="organization"]', organization.name);
      cy.get('[data-cy="prevent_instance_group_fallback"]').click();
      cy.clickButton(/^Create inventory$/);
      cy.verifyPageTitle(inventoryName);
      cy.hasDetail(/^Organization$/, organization.name);
      cy.clickLink(/^Groups$/);
    });

    afterEach(() => {
      cy.visit(
        `/infrastructure/inventories/inventory/${inventory.id}/groups/?page=1&perPage=10&sort=name`
      );
      cy.clickPageAction('delete-inventory');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete inventory/);
      cy.verifyPageTitle('Inventories');
    });

    it('can create and delete a group', () => {
      const groupName = 'E2E Inventory group ' + randomString(4);
      cy.clickButton(/^Create group$/);
      cy.verifyPageTitle('Create new group');
      cy.get('[data-cy="name"]').type(groupName);
      cy.get('[data-cy="description"]').type('This is a description');
      cy.dataEditorTypeByDataCy('variables', 'test: true');
      cy.clickButton(/^Save/);
      cy.hasDetail(/^Name$/, groupName);
      cy.hasDetail(/^Description$/, 'This is a description');
      cy.hasDetail(/^Variables$/, 'test: true');
      cy.clickLink(/^Back to Groups$/);
      cy.selectTableRow(groupName);
      cy.clickToolbarKebabAction('delete-selected-groups');
      cy.get('[data-cy="delete-groups-dialog-radio-delete"]').click();
      cy.get('[data-cy="delete-group-modal-delete-button"]').click();
      cy.clickButton(/^Clear all filters$/);
      cy.get('[data-cy="empty-state-title"]').contains(
        /^There are currently no groups added to this inventory./
      );
    });
  });
});
