/*
Users list test cases
1. User list loads
2. Filter by username, first name, last name, email - TODO
3. RBAC enable/disable user Create
4. RBAC for Edit, Delete - TODO
5. Handle 500 error state
6. Handle empty state
*/

import * as useOptions from '../../../../frontend/common/crud/useOptions';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformUsersList } from './PlatformUsersList';

describe('Users list', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/users/*`,
        },
        {
          fixture: 'platformUsers.json',
        }
      ).as('usersList');
    });
    it('Users list renders', () => {
      cy.mount(<PlatformUsersList />);
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
    it('Create User button is disabled if the user does not have permission to create users', () => {
      cy.mount(<PlatformUsersList />);
      cy.get('a[data-cy="create-user"]').should('have.attr', 'aria-disabled', 'true');
    });
    it('Create User button is enabled if the user has permission to create users', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                read_only: false,
                label: 'Name',
                help_text: 'The name of this resource',
                max_length: 512,
              },
            },
          },
        },
      }));
      cy.mount(<PlatformUsersList />);
      cy.get('a[data-cy="create-user"]').should('have.attr', 'aria-disabled', 'false');
    });
  });
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/users/*`,
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                read_only: false,
                label: 'Name',
                help_text: 'The name of this resource',
                max_length: 512,
              },
            },
          },
        },
      }));
      cy.mount(<PlatformUsersList />);
      cy.contains(/^There are currently no users added.$/);
      cy.contains(/^Please create a user by using the button below.$/);
    });
    it('Empty state is displayed correctly for user without permission to create teams', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<PlatformUsersList />);
      cy.contains(/^You do not have permission to create a user/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
    });
  });
  describe('Error retrieving list', () => {
    it('Displays error loading users', () => {
      cy.intercept({ method: 'GET', url: gatewayV1API`/users/*` }, { statusCode: 500 });
      cy.mount(<PlatformUsersList />);
      cy.contains('Error loading users');
    });
  });
});
