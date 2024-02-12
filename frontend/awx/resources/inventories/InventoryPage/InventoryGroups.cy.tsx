import { InventoryGroups } from './InventoryGroups';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';

describe('InventoryGroups', () => {
  let groupsOptions = 'groups_options.json';
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/inventories/**/?order_by=name&page=1&page_size=10',
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
    cy.intercept(
      {
        method: 'OPTIONS',
        url: '/api/v2/inventories/1/groups/',
        hostname: 'localhost',
      },
      (req) => {
        req.reply({ fixture: groupsOptions });
      }
    );
  });

  it('renders inventory groups list', () => {
    cy.mount(<InventoryGroups />);
    cy.fixture('groups.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: InventoryGroup[]) => {
        const group = results[0];
        cy.contains(group.name);
      });
  });

  it('deletes group from toolbar menu', () => {
    cy.mount(<InventoryGroups />);
    cy.fixture('groups.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: InventoryGroup[]) => {
        const group = results[0];
        cy.selectTableRow(group.name, false);
        cy.clickToolbarKebabAction('delete-selected-groups');
        cy.contains('Permanently delete groups');
      });
  });

  it('filter by name', () => {
    cy.mount(<InventoryGroups />);
    cy.fixture('groups.json')
      .its('results')
      .should('be.an', 'array')
      .then(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v2/inventories/**/groups/?name__icontains=Related%20to%20group%201**',
          },
          {
            fixture: 'group.json',
          }
        ).as('nameFilter');
        cy.filterTableByTypeAndText(/^Name$/, 'Related to group 1');
        cy.get('@nameFilter.all').should('have.length.least', 1);
        cy.clearAllFilters();
      });
  });
  it('filter by created by', () => {
    cy.mount(<InventoryGroups />);
    cy.fixture('groups.json')
      .its('results')
      .should('be.an', 'array')
      .then(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v2/inventories/**/groups/?created_by__username__icontains=test**',
          },
          {
            fixture: 'group.json',
          }
        ).as('createdByFilter');
        cy.filterTableByTypeAndText(/^Created by$/, 'test');
        cy.get('@createdByFilter.all').should('have.length.least', 1);
        cy.clearAllFilters();
      });
  });
  it('filter by modified by', () => {
    cy.mount(<InventoryGroups />);
    cy.fixture('groups.json')
      .its('results')
      .should('be.an', 'array')
      .then(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v2/inventories/**/groups/?modified_by__username__icontains=test**',
          },
          {
            fixture: 'group.json',
          }
        ).as('modifiedByFilter');
        cy.filterTableByTypeAndText(/^Modified by$/, 'test');
        cy.get('@modifiedByFilter.all').should('have.length.least', 1);
        cy.clearAllFilters();
      });
  });
  it('disables Create group button when user does not have permissions', () => {
    groupsOptions = 'groups_options_no_post.json';
    cy.mount(<InventoryGroups />);
    cy.fixture('groups.json')
      .its('results')
      .should('be.an', 'array')
      .then(() => {
        cy.get('[data-cy="create-group"]').should('have.attr', 'aria-disabled', 'true');
      });
  });
});
