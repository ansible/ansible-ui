import { InventoryGroup } from '../../interfaces/InventoryGroup';
import { GroupRelatedGroups } from './GroupRelatedGroups';

describe('GroupRelatedGroups', () => {
  let groupsOptions = 'groups_options.json';
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
    cy.intercept(
      {
        method: 'OPTIONS',
        url: '/api/v2//inventories/1/groups',
        hostname: 'localhost',
      },
      (req) => {
        req.reply({ fixture: groupsOptions });
      }
    );
  });

  it('renders related groups table', () => {
    cy.mount(<GroupRelatedGroups />);
    cy.fixture('groups.json')
      .its('results')
      .should('be.an', 'array')
      .then((groups: InventoryGroup[]) => {
        const group = groups[0];
        cy.contains(group.name);
      });
  });
  it('deletes group from toolbar menu', () => {
    cy.mount(<GroupRelatedGroups />);
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

  it('filter by name', () => {
    cy.mount(<GroupRelatedGroups />);
    cy.fixture('groups.json')
      .its('results')
      .should('be.an', 'array')
      .then(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v2/groups//children?name__icontains=Related%20to%20group%201&**',
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
    cy.mount(<GroupRelatedGroups />);
    cy.fixture('groups.json')
      .its('results')
      .should('be.an', 'array')
      .then(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v2/groups//children?created_by__username__icontains=test&**',
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
    cy.mount(<GroupRelatedGroups />);
    cy.fixture('groups.json')
      .its('results')
      .should('be.an', 'array')
      .then(() => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v2/groups//children?modified_by__username__icontains=test&**',
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
  it('disables new group button when user does not have permissions', () => {
    groupsOptions = 'groups_options_no_post.json';
    cy.mount(<GroupRelatedGroups />);
    cy.fixture('groups.json')
      .its('results')
      .should('be.an', 'array')
      .then(() => {
        cy.get('[data-cy="add-group"]').click();
        cy.get('[data-cy="new-group"]').should('have.attr', 'aria-disabled', 'true');
      });
  });
});
