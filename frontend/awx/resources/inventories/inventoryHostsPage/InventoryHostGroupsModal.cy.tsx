import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import {
  InventoryHostGroupsAddModal,
  InventoryHostGroupsAddModalProps,
} from './InventoryHostGroupsModal';

describe('Inventory Host Groups List', () => {
  const props: InventoryHostGroupsAddModalProps = {
    onAdd: (items: InventoryGroup[]) => {
      items;
    },
    inventoryId: '',
    hostId: '',
  };
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/inventories/*/groups/?not__hosts*',
        },
        {
          fixture: 'groups.json',
        }
      );
      cy.intercept(
        { method: 'OPTIONS', url: '/api/v2/groups' },
        { fixture: 'groups_options.json' }
      );
    });

    it('Inventory Groups Add Modal Renders', () => {
      cy.mount(<InventoryHostGroupsAddModal {...props} />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.get('tbody').find('tr').should('have.length', 10);
    });

    it('Filter Host Groups by name', () => {
      cy.mount(<InventoryHostGroupsAddModal {...props} />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/inventories/*/groups/?not__hosts=*&name__icontains=Related%20to%20group%201*',
        },
        {
          fixture: 'group.json',
        }
      ).as('nameFilter');
      cy.filterTableByTypeAndText(/^Name$/, 'Related to group 1');
      cy.get('@nameFilter.all').should('have.length.least', 1);
      cy.clearAllFilters();
    });

    it('Filter Host Groups by created by', () => {
      cy.mount(<InventoryHostGroupsAddModal {...props} />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/inventories/*/groups/?not__hosts=*&created_by__username__icontains=test*',
        },
        {
          fixture: 'group.json',
        }
      ).as('createdByFilter');
      cy.filterTableByTypeAndText(/^Created by$/, 'test');
      cy.get('@createdByFilter.all').should('have.length.least', 1);
      cy.clearAllFilters();
    });

    it('Filter Host Groups by modified by', () => {
      cy.mount(<InventoryHostGroupsAddModal {...props} />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/inventories/*/groups/?not__hosts=*&modified_by__username__icontains=test*',
        },
        {
          fixture: 'group.json',
        }
      ).as('modifiedByFilter');
      cy.filterTableByTypeAndText(/^Modified by$/, 'test');
      cy.get('@modifiedByFilter.all').should('have.length.least', 1);
      cy.clearAllFilters();
    });

    it('Displays error if inventory hosts groups are not successfully loaded', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/inventories/*/groups/?not__hosts*',
        },
        {
          statusCode: 500,
        }
      );
      cy.mount(<InventoryHostGroupsAddModal {...props} />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.contains('Error loading groups to associate');
    });
  });

  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/inventories/*/groups/?not__hosts*',
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed correctly', () => {
      cy.mount(<InventoryHostGroupsAddModal {...props} />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.contains(/^No groups available to add to host$/);
    });
  });
});
