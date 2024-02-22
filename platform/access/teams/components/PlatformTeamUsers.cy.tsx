import { gatewayV1API } from '../../../../cypress/support/formatApiPathForPlatform';
import mockPlatformTeams from '../../../../cypress/fixtures/platformTeams.json';
import { PlatformTeamUsers } from './PlatformTeamUsers';
import * as useOptions from '../../../../frontend/common/crud/useOptions';

describe('Team users list', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/teams/5/users/?*`,
        },
        {
          fixture: 'platformTeamAdmins.json',
        }
      ).as('teamUsersList');
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/teams/5/`,
        },
        mockPlatformTeams.results[0]
      ).as('team');
    });
    it('Users list renders', () => {
      cy.mount(<PlatformTeamUsers />, {
        path: '/access/teams/:id/*',
        initialEntries: ['/access/teams/5/users'],
      });
      cy.setTableView('table-view');
      cy.get('tbody').find('tr').should('have.length', 3);
      // Toolbar actions are visible
      cy.get(`[data-cy="add-user(s)"]`).should('be.visible');
      cy.get('.page-table-toolbar').within(() => {
        cy.get('.toggle-kebab')
          .click()
          .get('.pf-v5-c-dropdown__menu-item')
          .contains('Remove selected users')
          .should('be.visible');
      });
    });
    it('Add user(s) button is disabled if the user does not have required permissions', () => {
      cy.mount(<PlatformTeamUsers />, {
        path: '/access/teams/:id/*',
        initialEntries: ['/access/teams/5/users'],
      });
      cy.get('[data-cy="add-user(s)"]').should('have.attr', 'aria-disabled', 'true');
    });
    it('Add user(s) button is enabled if the user has the required permissions', () => {
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
      cy.mount(<PlatformTeamUsers />, {
        path: '/access/teams/:id/*',
        initialEntries: ['/access/teams/5/users'],
      });
      cy.get('[data-cy="add-user(s)"]').should('have.attr', 'aria-disabled', 'false');
    });
  });
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/teams/5/users/*`,
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/teams/5/`,
        },
        mockPlatformTeams.results[0]
      ).as('team');
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
      cy.mount(<PlatformTeamUsers />, {
        path: '/access/teams/:id/*',
        initialEntries: ['/access/teams/5/users'],
      });
      cy.contains(/^There are currently no users added to this team.$/);
      cy.contains(/^Add users by clicking the button below.$/);
    });
    it('Empty state is displayed correctly for user without permission to add users', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<PlatformTeamUsers />, {
        path: '/access/teams/:id/*',
        initialEntries: ['/access/teams/5/users'],
      });
      cy.contains(/^You do not have permission to add a user to this team./);
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
          url: gatewayV1API`/teams/5/users/*`,
        },
        { statusCode: 500 }
      ).as('error');
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/teams/5/`,
        },
        mockPlatformTeams.results[0]
      ).as('team');
      cy.mount(<PlatformTeamUsers />, {
        path: '/access/teams/:id/*',
        initialEntries: ['/access/teams/5/users'],
      });
      cy.contains('Error loading users');
    });
  });
});
