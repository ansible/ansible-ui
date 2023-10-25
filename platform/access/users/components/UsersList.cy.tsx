/*
Users list test cases
1. User list loads
2. Filter by username, first name, last name, email - TODO
3. RBAC enable/disable user Create, Edit, Delete - TODO
4. Handle 500 error state
5. Handle empty state
*/

import { UsersList } from './UsersList';

describe('Users list', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/gateway/v1/users*',
        },
        {
          fixture: 'platformUsers.json',
        }
      ).as('usersList');
    });
    it('Users list renders', () => {
      cy.mount(<UsersList />);
      cy.verifyPageTitle('Users');
      cy.get('tbody').find('tr').should('have.length', 4);
      // Toolbar actions are visible
      cy.get(`[data-cy="create-user"]`).should('be.visible');
      cy.get('.page-table-toolbar').within(() => {
        cy.get('.toggle-kebab')
          .click()
          .get('.pf-v5-c-dropdown__menu-item')
          .contains('Delete selected users')
          .should('be.visible');
      });
    });
  });
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/gateway/v1/users*',
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed', () => {
      cy.mount(<UsersList />);
      cy.contains(/^There are currently no users added.$/);
      cy.contains(/^Please create a user by using the button below.$/);
    });
  });
  describe('Error retrieving list', () => {
    it('Displays error loading users', () => {
      cy.intercept({ method: 'GET', url: '/api/gateway/v1/users/*' }, { statusCode: 500 });
      cy.mount(<UsersList />);
      cy.contains('Error loading users');
    });
  });
});
