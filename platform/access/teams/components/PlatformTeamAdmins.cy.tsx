import mockPlatformTeams from '../../../../cypress/fixtures/platformTeams.json';
import { gatewayV1API } from '../../../../cypress/support/formatApiPathForPlatform';
import * as useOptions from '../../../../frontend/common/crud/useOptions';
import { PlatformTeamAdmins } from './PlatformTeamAdmins';

describe('Team admins list', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/teams/5/admins/?*`,
        },
        {
          fixture: 'platformTeamAdmins.json',
        }
      ).as('teamAdminsList');
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/teams/5/`,
        },
        mockPlatformTeams.results[0]
      ).as('team');
    });
    it('Administrators list renders', () => {
      cy.mount(<PlatformTeamAdmins />, {
        path: '/access/teams/:id/*',
        initialEntries: ['/access/teams/5/admins'],
      });
      cy.setTableView('table');
      cy.get('tbody').find('tr').should('have.length', 3);
      // Toolbar actions are visible
      cy.get(`[data-cy="add-administrator(s)"]`).should('be.visible');
      cy.get('.page-table-toolbar').within(() => {
        cy.get('.toggle-kebab')
          .click()
          .get('.pf-v5-c-dropdown__menu-item')
          .contains('Remove selected administrators')
          .should('be.visible');
      });
    });
    it('Add administrator(s) button is disabled if the user does not have required permissions', () => {
      cy.mount(<PlatformTeamAdmins />, {
        path: '/access/teams/:id/*',
        initialEntries: ['/access/teams/5/admins'],
      });
      cy.get('[data-cy="add-administrator(s)"]').should('have.attr', 'aria-disabled', 'true');
    });
    it('Add administrator(s) button is enabled if the user has the required permissions', () => {
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
      cy.mount(<PlatformTeamAdmins />, {
        path: '/access/teams/:id/*',
        initialEntries: ['/access/teams/5/admins'],
      });
      cy.get('[data-cy="add-administrator(s)"]').should('have.attr', 'aria-disabled', 'false');
    });
  });
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/teams/5/admins/*`,
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
    it('Empty state is displayed correctly for user with permission to add admins', () => {
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
      cy.mount(<PlatformTeamAdmins />, {
        path: '/access/teams/:id/*',
        initialEntries: ['/access/teams/5/admins'],
      });
      cy.contains(/^There are currently no administrators added to this team.$/);
      cy.contains(/^Add administrators by clicking the button below.$/);
    });
    it('Empty state is displayed correctly for user without permission to add admins', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<PlatformTeamAdmins />, {
        path: '/access/teams/:id/*',
        initialEntries: ['/access/teams/5/admins'],
      });
      cy.contains(/^You do not have permission to add an administrator to this team./);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
    });
  });
  describe('Error retrieving list', () => {
    it('Displays error loading admins', () => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/teams/5/admins/*`,
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
      cy.mount(<PlatformTeamAdmins />, {
        path: '/access/teams/:id/*',
        initialEntries: ['/access/teams/5/admins'],
      });
      cy.contains('Error loading administrators');
    });
  });
});
