import mockPlatformOrganizations from '../../../../cypress/fixtures/platformOrganizations.json';
import { gatewayV1API } from '../../../../cypress/support/formatApiPathForPlatform';
import * as useOptions from '../../../../frontend/common/crud/useOptions';
import { PlatformOrganizationUsers } from './PlatformOrganizationUsers';

const mockPlatformOrganization = mockPlatformOrganizations.results[1];
mockPlatformOrganization.id = 1;

describe('Organization users list', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/organizations/1/users/?*`,
        },
        {
          fixture: 'platformOrganizationUsers.json',
        }
      ).as('organizationUsersList');
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/organizations/1/`,
        },
        mockPlatformOrganization
      ).as('organization');
    });
    it('Users list renders', () => {
      cy.mount(<PlatformOrganizationUsers />, {
        path: '/access/organizations/:id/*',
        initialEntries: ['/access/organizations/1/users'],
      });
      cy.setTableView('table');
      cy.get('tbody').find('tr').should('have.length', 2);
      // Toolbar actions are visible
      cy.get(`[data-cy="add-users"]`).should('be.visible');
      cy.get('.page-table-toolbar').within(() => {
        cy.get('.toggle-kebab')
          .click()
          .get('.pf-v5-c-dropdown__menu-item')
          .contains('Remove selected users')
          .should('be.visible');
      });
      // Row actions are visible
      cy.contains('td', 'test-user1')
        .parent()
        .within(() => {
          cy.get('[data-cy="manage-roles"]').should('exist');
          cy.get('button.toggle-kebab').click();
          cy.get('a[data-cy="remove-user"]').should('exist');
        });
    });
    it('Add users button is disabled if the user does not have required permissions', () => {
      cy.mount(<PlatformOrganizationUsers />, {
        path: '/access/organizations/:id/*',
        initialEntries: ['/access/organizations/1/users'],
      });
      cy.get('[data-cy="add-users"]').should('have.attr', 'aria-disabled', 'true');
    });
    it('Add users button is enabled if the user has the required permissions', () => {
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
      cy.mount(<PlatformOrganizationUsers />, {
        path: '/access/organizations/:id/*',
        initialEntries: ['/access/organizations/1/users'],
      });
      cy.get('[data-cy="add-users"]').should('have.attr', 'aria-disabled', 'false');
    });
  });
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/organizations/1/users/*`,
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/organizations/1/`,
        },
        mockPlatformOrganization
      ).as('organization');
    });
    it('Empty state is displayed correctly for user with permission to add users', () => {
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
      cy.mount(<PlatformOrganizationUsers />, {
        path: '/access/organizations/:id/*',
        initialEntries: ['/access/organizations/1/users'],
      });
      cy.contains(/^There are currently no users added to this organization.$/);
      cy.contains(/^Add users by clicking the button below.$/);
    });
    it('Empty state is displayed correctly for user without permission to add users', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<PlatformOrganizationUsers />, {
        path: '/access/organizations/:id/*',
        initialEntries: ['/access/organizations/1/users'],
      });
      cy.contains(/^You do not have permission to add a user to this organization./);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
    });
  });
  describe('Error retrieving list', () => {
    it('Displays error loading users', () => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/organizations/1/users/*`,
        },
        { statusCode: 500 }
      ).as('error');
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/organizations/1/`,
        },
        mockPlatformOrganization
      ).as('organization');
      cy.mount(<PlatformOrganizationUsers />, {
        path: '/access/organizations/:id/*',
        initialEntries: ['/access/organizations/1/users'],
      });
      cy.contains('Error loading users');
    });
  });
});
