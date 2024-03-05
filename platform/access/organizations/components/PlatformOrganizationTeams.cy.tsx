import mockPlatformOrganizations from '../../../../cypress/fixtures/platformOrganizations.json';
import { gatewayV1API } from '../../../../cypress/support/formatApiPathForPlatform';
import * as useOptions from '../../../../frontend/common/crud/useOptions';
import { PlatformOrganizationTeams } from './PlatformOrganizationTeams';

const mockPlatformOrganization = mockPlatformOrganizations.results[1];

describe('Organization teams list', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/organizations/1/teams/?*`,
        },
        {
          fixture: 'platformOrganizationTeams.json',
        }
      ).as('organizationTeamsList');
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/organizations/1/`,
        },
        mockPlatformOrganization
      ).as('organization');
    });
    it('Teams list renders', () => {
      cy.mount(<PlatformOrganizationTeams />, {
        path: '/access/organizations/:id/*',
        initialEntries: ['/access/organizations/1/teams'],
      });
      cy.setTableView('table');
      cy.get('tbody').find('tr').should('have.length', 2);
      // Toolbar actions are visible
      cy.get(`[data-cy="add-roles"]`).should('be.visible');
      // Row actions are visible
      cy.contains('td', 'Test team 1')
        .parent()
        .within(() => {
          // Manage roles
          cy.get('[data-cy="manage-roles"]').should('exist');
        });
    });
  });
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/organizations/1/teams/*`,
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
    it('Empty state is displayed correctly for user with permission to create teams', () => {
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
      cy.mount(<PlatformOrganizationTeams />, {
        path: '/access/organizations/:id/*',
        initialEntries: ['/access/organizations/1/teams'],
      });
      cy.contains(/^There are currently no teams created in this organization.$/);
      cy.contains(/^Create a team by clicking the button below.$/);
    });
    it('Empty state is displayed correctly for user without permission to create teams', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<PlatformOrganizationTeams />, {
        path: '/access/organizations/:id/*',
        initialEntries: ['/access/organizations/1/teams'],
      });
      cy.contains(/^You do not have permission to create teams./);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
    });
  });
  describe('Error retrieving list', () => {
    it('Displays error loading teams', () => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/organizations/1/teams/*`,
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
      cy.mount(<PlatformOrganizationTeams />, {
        path: '/access/organizations/:id/*',
        initialEntries: ['/access/organizations/1/teams'],
      });
      cy.contains('Error loading teams');
    });
  });
});
