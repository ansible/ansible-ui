/*
Teams list test cases
1. Team list loads
2. Filter by name, description, organization, created, modified - TODO
3. RBAC enable/disable team Create, Edit, Delete - TODO
4. Handle 500 error state
5. Handle empty state
*/

import { TeamList } from './TeamList';

describe('Teams list', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/gateway/v1/teams*',
        },
        {
          fixture: 'platformTeams.json',
        }
      ).as('teamsList');
    });
    it('Teams list renders', () => {
      cy.mount(<TeamList />);
      cy.verifyPageTitle('Teams');
      cy.get('tbody').find('tr').should('have.length', 4);
      // Toolbar actions are visible
      cy.get(`[data-cy="create-team"]`).should('be.visible');
      cy.get('.page-table-toolbar').within(() => {
        cy.get('.toggle-kebab')
          .click()
          .get('.pf-c-dropdown__menu-item')
          .contains('Delete selected teams')
          .should('be.visible');
      });
    });
  });
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/gateway/v1/teams*',
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed', () => {
      cy.mount(<TeamList />);
      cy.contains(/^There are currently no teams added.$/);
      cy.contains(/^Please create a team by using the button below.$/);
    });
  });
});
