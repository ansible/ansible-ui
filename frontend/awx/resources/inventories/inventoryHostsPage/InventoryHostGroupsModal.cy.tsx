import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import {
  InventoryHostGroupsAddModal,
  InventoryHostGroupsAddModalProps,
} from './InventoryHostGroupsModal';
import { awxAPI } from '../../../../../cypress/support/formatApiPathForAwx';

describe('Inventory Host Groups List', () => {
  const props: InventoryHostGroupsAddModalProps = {
    onAdd: (items: InventoryGroup[]) => {
      items;
    },
    inventoryId: '1',
    hostId: '1',
  };

  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: awxAPI`/inventories/*/groups/?not__hosts*`,
        },
        {
          fixture: 'groups.json',
        }
      ).as('getGroupResults');
      cy.intercept({ method: 'OPTIONS', url: awxAPI`/groups` }, { fixture: 'groups_options.json' });
    });

    it('Inventory Groups Add Modal Renders', () => {
      cy.intercept(
        {
          method: 'OPTIONS',
          url: awxAPI`/inventories/1/groups/`,
          hostname: 'localhost',
        },
        {
          fixture: 'mock_options.json',
        }
      ).as('getFilterOptions');
      cy.mount(<InventoryHostGroupsAddModal {...props} />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.wait('@getGroupResults')
        .its('response.body.results')
        .then((groups: InventoryGroup[]) => {
          const fixtureCount = groups.length;
          cy.get('tbody').find('tr').should('have.length', fixtureCount);
        });
    });

    it('Filter Host Groups by name', () => {
      cy.intercept(
        {
          method: 'OPTIONS',
          url: awxAPI`/inventories/1/groups/`,
          hostname: 'localhost',
        },
        {
          fixture: 'mock_options.json',
        }
      ).as('getFilterOptions');
      cy.intercept(
        {
          method: 'GET',
          url: awxAPI`/inventories/1/groups/*`,
          hostname: 'localhost',
        },
        {
          fixture: 'groups.json',
        }
      ).as('getGroups');
      cy.intercept(awxAPI`/inventories/1/groups/?not__hosts=1&search=*`).as('nameFilterRequest');
      cy.mount(<InventoryHostGroupsAddModal {...props} />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.filterTableBySearch('Related to group 1');
      cy.wait('@nameFilterRequest');
      cy.clearAllFilters();
    });

    it('Filter Host Groups by created by', () => {
      cy.intercept(
        {
          method: 'OPTIONS',
          url: awxAPI`/inventories/1/groups/`,
          hostname: 'localhost',
        },
        {
          fixture: 'mock_options.json',
        }
      ).as('getFilterOptions');
      cy.intercept(
        awxAPI`/inventories/1/groups/?not__hosts=1&created_by__username__icontains=*`
      ).as('createdByFilterRequest');
      cy.mount(<InventoryHostGroupsAddModal {...props} />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.filterTableByTextFilter('created-by', 'test');
      cy.wait('@createdByFilterRequest');
      cy.clearAllFilters();
    });

    it('Filter Host Groups by modified by', () => {
      cy.intercept(
        {
          method: 'OPTIONS',
          url: awxAPI`/inventories/1/groups/`,
          hostname: 'localhost',
        },
        {
          fixture: 'mock_options.json',
        }
      ).as('getFilterOptions');
      cy.intercept(
        awxAPI`/inventories/1/groups/?not__hosts=1&modified_by__username__icontains=*`
      ).as('modifiedByFilterRequest');
      cy.mount(<InventoryHostGroupsAddModal {...props} />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.filterTableByTextFilter('modified-by', 'test');
      cy.wait('@modifiedByFilterRequest');
      cy.clearAllFilters();
    });

    it('Displays error if inventory hosts groups are not successfully loaded', () => {
      cy.intercept(
        {
          method: 'GET',
          url: awxAPI`/inventories/*/groups/?not__hosts*`,
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
          url: awxAPI`/inventories/*/groups/?not__hosts*`,
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
