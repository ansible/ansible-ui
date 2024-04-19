import { InventoryGroup } from '../../interfaces/InventoryGroup';
import { GroupRelatedGroups } from './GroupRelatedGroups';

const inventories = ['inventory', 'constructed_inventory'];

inventories.forEach((inventory) => {
  describe(`GroupRelatedGroups (${inventory})`, () => {
    const path = '/inventories/:inventory_type/:id/groups/:group_id/nested_groups';
    const initialEntries = [`/inventories/${inventory}/1/groups/176/nested_groups`];

    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/groups/**',
          hostname: 'localhost',
        },
        {
          fixture: 'groups.json',
        }
      );
      cy.intercept(
        {
          method: 'OPTIONS',
          url: '/api/v2/inventories/**/ad_hoc_commands',
          hostname: 'localhost',
        },
        {
          fixture: 'ad_hoc_commands.json',
        }
      );
    });

    it('renders related groups table', () => {
      cy.mount(<GroupRelatedGroups />, {
        path,
        initialEntries,
      });
      cy.fixture('groups.json')
        .its('results')
        .should('be.an', 'array')
        .then((groups: InventoryGroup[]) => {
          const group = groups[0];
          cy.contains(group.name);
        });
    });

    if (inventory === 'inventory') {
      it('deletes group from toolbar menu', () => {
        cy.mount(<GroupRelatedGroups />, {
          path,
          initialEntries,
        });
        cy.fixture('groups.json')
          .its('results')
          .should('be.an', 'array')
          .then((results: InventoryGroup[]) => {
            const group = results[0];
            cy.selectTableRow(group.name, false);
            cy.clickToolbarKebabAction('disassociate-selected-groups');
            cy.contains('Permanently disassociate groups');
          });
      });
    }

    it('filter by name', () => {
      cy.intercept(
        {
          method: 'OPTIONS',
          url: '/api/v2/groups/176/children/',
          hostname: 'localhost',
        },
        {
          fixture: 'mock_options.json',
        }
      ).as('getFilterOptions');
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/groups/176/children/*',
          hostname: 'localhost',
        },
        {
          fixture: 'groups.json',
        }
      ).as('getGroups');
      cy.intercept('/api/v2/groups/176/children/?name=*').as('nameFilterRequest');
      cy.mount(<GroupRelatedGroups />, {
        path,
        initialEntries,
      });
      cy.filterTableByMultiSelect('name', ['Related to group 1']);
      cy.wait('@nameFilterRequest');
      cy.clearAllFilters();
    });

    it('filter by created by', () => {
      cy.intercept(
        {
          method: 'OPTIONS',
          url: '/api/v2/groups/176/children/',
          hostname: 'localhost',
        },
        {
          fixture: 'mock_options.json',
        }
      ).as('getFilterOptions');
      cy.intercept('/api/v2/groups/176/children/?created_by__username__icontains=*').as(
        'createdByFilterRequest'
      );
      cy.mount(<GroupRelatedGroups />, {
        path,
        initialEntries,
      });
      cy.filterTableByTextFilter('created-by', 'test');
      cy.wait('@createdByFilterRequest');
      cy.clearAllFilters();
    });

    it('filter by modified by', () => {
      cy.intercept(
        {
          method: 'OPTIONS',
          url: '/api/v2/groups/176/children/',
          hostname: 'localhost',
        },
        {
          fixture: 'mock_options.json',
        }
      ).as('getFilterOptions');
      cy.intercept('/api/v2/groups/176/children/?modified_by__username__icontains=*').as(
        'modifiedByFilterRequest'
      );
      cy.mount(<GroupRelatedGroups />, {
        path,
        initialEntries,
      });
      cy.filterTableByTextFilter('modified-by', 'test');
      cy.wait('@modifiedByFilterRequest');
      cy.clearAllFilters();
    });

    if (inventory === 'inventory') {
      it('disables new group button when user does not have permissions', () => {
        cy.mount(<GroupRelatedGroups />, {
          path,
          initialEntries,
        });
        cy.fixture('groups.json')
          .its('results')
          .should('be.an', 'array')
          .then(() => {
            cy.get('[data-cy="add-group"]').click();
            cy.get('[data-cy="create-new-group"]').should('have.attr', 'aria-disabled', 'true');
          });
      });
    }

    if (inventory === 'constructed_inventory') {
      it('no actions beside run command', () => {
        cy.mount(<GroupRelatedGroups />, {
          path,
          initialEntries,
        });

        cy.get(`[data-cy="run-command"]`);
        cy.get(`[data-cy="add-group"]`).should('not.exist');
        cy.get(`[aria-label="Actions"]`).should('not.exist');
      });
    }

    if (inventory === 'inventory') {
      it('tests if there are all actions', () => {
        cy.mount(<GroupRelatedGroups />, {
          path,
          initialEntries,
        });

        cy.get(`[data-cy="run-command"]`);
        cy.get(`[data-cy="add-group"]`);
        cy.get(`[aria-label="Actions"]`).click();
        cy.get(`[data-cy="disassociate-selected-groups"]`);
      });
    }
  });
});
