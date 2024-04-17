import { InventoryGroups } from './InventoryGroups';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';

const inventory = 'inventory';
const constructed_inventory = 'constructed_inventory';
const types = [inventory, constructed_inventory];

types.forEach((type) => {
  describe(`InventoryGroups (${type})`, () => {
    const path = '/inventories/:inventory_type/:id/groups';
    const initialEntries = [`/inventories/${type}/1/groups`];
    const params = {
      path,
      initialEntries,
    };

    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/inventories/**/?*',
          hostname: 'localhost',
        },
        {
          fixture: 'groups.json',
        }
      );
      cy.intercept(
        {
          method: 'OPTIONS',
          url: '/api/v2/inventories/**/ad_hoc_commands/',
          hostname: 'localhost',
        },
        {
          fixture: 'ad_hoc_commands.json',
        }
      );
    });

    it('renders inventory groups list', () => {
      cy.mount(<InventoryGroups />, params);
      cy.fixture('groups.json')
        .its('results')
        .should('be.an', 'array')
        .then((results: InventoryGroup[]) => {
          const group = results[0];
          cy.contains(group.name);
        });
    });

    if (type === inventory) {
      it('deletes group from toolbar menu', () => {
        cy.mount(<InventoryGroups />, params);
        cy.fixture('groups.json')
          .its('results')
          .should('be.an', 'array')
          .then((results: InventoryGroup[]) => {
            const group = results[0];
            cy.selectTableRow(group.name, false);
            cy.clickToolbarKebabAction('delete-selected-groups');
            cy.get('[data-cy="delete-group-modal-delete-button"]').should('be.disabled');
            cy.get('[data-cy="delete-groups-dialog-radio-delete"]').click();
            cy.get('[data-cy="delete-group-modal-delete-button"]').should('be.enabled');
          });
      });
    }

    if (type === constructed_inventory) {
      it('constructed inventory does not have any actions beside run command', () => {
        cy.mount(<InventoryGroups />, params);
        cy.get(`[data-cy='edit-group]`).should('not.exist');
        cy.get(`[data-cy='create-group]`).should('not.exist');
        cy.get(`[data-cy='run-command']`);
        cy.get(`[data-cy='actions-dropdown']`).should('not.exist');
      });
    }

    it('filter by name', () => {
      cy.intercept(
        {
          method: 'OPTIONS',
          url: '/api/v2/inventories/1/groups/',
          hostname: 'localhost',
        },
        {
          fixture: 'mock_options.json',
        }
      ).as('getFilterOptions');
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/inventories/1/groups/*',
          hostname: 'localhost',
        },
        {
          fixture: 'groups.json',
        }
      ).as('getGroups');
      cy.intercept('/api/v2/inventories/1/groups/?name=*').as('nameFilterRequest');
      cy.mount(<InventoryGroups />, params);
      cy.filterTableByMultiSelect('name', ['Related to group 1']);
      cy.wait('@nameFilterRequest');

      cy.clearAllFilters();
    });
    it('filter by created by', () => {
      cy.intercept(
        {
          method: 'OPTIONS',
          url: '/api/v2/inventories/1/groups/',
          hostname: 'localhost',
        },
        {
          fixture: 'mock_options.json',
        }
      ).as('getFilterOptions');
      cy.intercept('/api/v2/inventories/1/groups/?created_by__username__icontains=*').as(
        'createdByFilterRequest'
      );
      cy.mount(<InventoryGroups />, params);
      cy.filterTableByTextFilter('created-by', 'test');
      cy.wait('@createdByFilterRequest');
      cy.clearAllFilters();
    });
    it('filter by modified by', () => {
      cy.intercept(
        {
          method: 'OPTIONS',
          url: '/api/v2/inventories/1/groups/',
          hostname: 'localhost',
        },
        {
          fixture: 'mock_options.json',
        }
      ).as('getFilterOptions');
      cy.intercept('/api/v2/inventories/1/groups/?modified_by__username__icontains=*').as(
        'modifiedByFilterRequest'
      );
      cy.mount(<InventoryGroups />, params);
      cy.filterTableByTextFilter('modified-by', 'test');
      cy.wait('@modifiedByFilterRequest');
      cy.clearAllFilters();
    });

    if (type === inventory) {
      it('disables Create group button when user does not have permissions', () => {
        cy.mount(<InventoryGroups />, params);
        cy.fixture('groups.json')
          .its('results')
          .should('be.an', 'array')
          .then(() => {
            cy.get('[data-cy="create-group"]').should('have.attr', 'aria-disabled', 'true');
          });
      });
    }
  });
});
