import * as useOptions from '../../../../common/crud/useOptions';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { InventoryHostGroups } from './InventoryHostGroups';

describe('Inventory Host Groups List', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/hosts/*/all_groups*',
        },
        {
          fixture: 'groups.json',
        }
      );
      cy.intercept(
        { method: 'OPTIONS', url: '/api/v2/inventories/*/ad_hoc_commands' },
        { fixture: 'ad_hoc_commands.json' }
      );
      cy.intercept(
        { method: 'OPTIONS', url: '/api/v2/groups' },
        { fixture: 'groups_options.json' }
      );
    });

    it('Inventory Host Groups list renders', () => {
      cy.mount(<InventoryHostGroups />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.get('tbody').find('tr').should('have.length', 10);
    });

    it('Filter Host Groups by name', () => {
      cy.mount(<InventoryHostGroups />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/hosts/*/all_groups?name__icontains=Related%20to%20group%201*',
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
      cy.mount(<InventoryHostGroups />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/hosts/*/all_groups?created_by__username__icontains=test*',
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
      cy.mount(<InventoryHostGroups />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/hosts/*/all_groups?modified_by__username__icontains=test*',
        },
        {
          fixture: 'group.json',
        }
      ).as('modifiedByFilter');
      cy.filterTableByTypeAndText(/^Modified by$/, 'test');
      cy.get('@modifiedByFilter.all').should('have.length.least', 1);
      cy.clearAllFilters();
    });

    it('Add group button is enabled if the user has permission to add a group', () => {
      cy.mount(<InventoryHostGroups />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.contains('button', /^Add$/).should('have.attr', 'aria-disabled', 'false');
    });

    it('Edit inventory group row action is enabled if the user has permission to edit inventory group', () => {
      cy.mount(<InventoryHostGroups />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.contains('tr', 'Test groups 1').within(() => {
        cy.get('[data-cy="actions-column-cell"]').within(() => {
          cy.get(`[data-cy="edit-group"]`).should('have.attr', 'aria-disabled', 'false');
        });
      });
    });

    it('Add group button is disabled if the user does not have permission to associate a host with a group', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<InventoryHostGroups />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.contains('button', /^Add$/).should('have.attr', 'aria-disabled', 'true');
    });

    it('Edit inventory group row action is disabled if the user does not have permission to edit inventory group', () => {
      cy.fixture('groups')
        .then((inventoryGroups: AwxItemsResponse<InventoryGroup>) => {
          for (let i = 0; i < inventoryGroups.results.length; i++) {
            inventoryGroups.results[i].summary_fields.user_capabilities.edit = false;
          }
          return inventoryGroups;
        })
        .then((inventoryGroups) => {
          cy.intercept(
            {
              method: 'GET',
              url: '/api/v2/hosts/*/all_groups*',
            },
            { body: inventoryGroups }
          );
        })
        .then(() => {
          cy.mount(<InventoryHostGroups />, {
            path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
            initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
          });
        })
        .then(() => {
          cy.contains('tr', 'Test groups 1').within(() => {
            cy.get('[data-cy="actions-column-cell"]').within(() => {
              cy.get(`[data-cy="edit-group"]`).should('have.attr', 'aria-disabled', 'true');
            });
          });
        })
        .then(() => {
          cy.contains('tr', 'Test groups 1').within(() => {
            cy.get('[data-cy="actions-column-cell"]').within(() => {
              cy.get(`[data-cy="edit-group"]`).should('have.attr', 'aria-disabled', 'true');
            });
          });
        });
    });

    it('Displays error if inventory hosts groups are not successfully loaded', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/hosts/*/all_groups*',
        },
        {
          statusCode: 500,
        }
      );
      cy.mount(<InventoryHostGroups />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.contains('Error loading associated groups');
    });
  });

  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/hosts/*/all_groups*',
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed correctly for user with permission to add group', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this group.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<InventoryHostGroups />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.contains(/^There are currently no groups associated with this host$/);
      cy.contains(/^Please add a group by using the button below.$/);
      cy.contains('button', /^Add group$/).should('be.visible');
    });
    it('Empty state is displayed correctly for user without permission to create group', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<InventoryHostGroups />, {
        path: '/inventories/:inventory_type/:id/hosts/:host_id/*',
        initialEntries: ['/inventories/inventory/1/hosts/1/groups'],
      });
      cy.contains(/^You do not have permission to add a group$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains('button', /^Add group$/).should('not.exist');
    });
  });
});
