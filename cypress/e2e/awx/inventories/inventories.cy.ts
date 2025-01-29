//This spec file needs to have tests added for constructed and smart inventories. See below.

import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { InstanceGroup } from '@ansible/awx-ui/interfaces/InstanceGroup';
import { Inventory } from '@ansible/awx-ui/interfaces/Inventory';
import { Label } from '@ansible/awx-ui/interfaces/Label';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { AwxUser } from '@ansible/awx-ui/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../support/utils';

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

        it('can edit an inventory from the list view and assert info on details page', () => {
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
          cy.get('[data-cy="labels-typeahead-input"]').click().type(label.name.toString());
          cy.contains(label.name.toString()).click();
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

        it('can copy an inventory on the list view and assert that the copy has been successful', () => {
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
          cy.clickButton(/^Clear all filters$/);
        });

        it('can delete an inventory from the inventory list toolbar', () => {
          cy.navigateTo('awx', 'inventories');
          cy.filterTableBySingleSelect('name', inventory.name);
          cy.selectTableRowByCheckbox('name', inventory.name, { disableFilter: true });
          //Add an assertion that the expected inventory name appears where it should
          cy.clickToolbarKebabAction('delete-inventories');
          cy.get('#confirm').click();
          cy.clickButton(/^Delete inventory/);
          cy.contains(/^Success$/);
          cy.clickButton(/^Clear all filters$/);
        });

        it('can bulk delete inventories from the list view and verify deletion', () => {
          cy.createAwxOrganization().then((org) => {
            cy.createAwxInventory(org).then((inv1) => {
              cy.createAwxInventory(org).then((inv2) => {
                cy.createAwxInventory(org).then((inv3) => {
                  cy.navigateTo('awx', 'inventories');
                  cy.intercept('GET', awxAPI`/inventories/?*`).as('getInventories');
                  cy.selectTableFilter('organization');
                  cy.get('[data-cy="filter-input"]').click();
                  cy.get('[data-cy="search-input"]').type(org.name);
                  const orgName = org.name.toLowerCase().split(' ').join('-');
                  cy.get(`[data-cy="${orgName}"]`).click();
                  cy.wait('@getInventories');
                  cy.get('[aria-label="Simple table"] tr').should('have.length.gte', 4);
                  cy.contains(inv1.name);
                  cy.contains(inv2.name);
                  cy.contains(inv3.name);
                  cy.getByDataCy('select-all').check();
                  cy.clickToolbarKebabAction('delete-inventories');
                  cy.get('#confirm').click();
                  cy.clickButton(/^Delete inventories/);
                  cy.contains(/^Success$/);
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
            cy.getByDataCy('host-filter').type('name=host1');
            cy.singleSelectByDataCy('organization', org.name);
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
            cy.getBy(`[data-cy="actions-dropdown"]`).click();
            cy.getBy('[data-cy="delete-inventory"]').click();
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
