import * as useOptions from '@ansible/common-ui/crud/useOptions';
import mockPlatformOrganizations from '@ansible/cypress/fixtures/platformOrganizations.json';
import { gatewayAPI } from '@ansible/cypress/support/formatApiPathForPlatform';
import { PlatformOrganizationTeams } from './PlatformOrganizationTeams';

const mockPlatformOrganization = mockPlatformOrganizations.results[1];

describe('Organization teams list', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayAPI`/organizations/1/teams/?*`,
        },
        {
          fixture: 'platformOrganizationTeams.json',
        }
      ).as('organizationTeamsList');
      cy.intercept(
        {
          method: 'GET',
          url: gatewayAPI`/organizations/1/`,
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
          url: gatewayAPI`/organizations/1/teams/*`,
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
      cy.intercept(
        {
          method: 'GET',
          url: gatewayAPI`/organizations/1/`,
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
      cy.contains('No teams');
      cy.contains(
        /^No teams have been created or assigned to this organization. Go to the Teams section to create a team, then you can assign that team to this organization. Once teams are assigned to this organization, they can be assigned roles for the resources within this organization.$/
      );
      cy.contains('Go to Teams section and create team').should('be.visible');
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
          url: gatewayAPI`/organizations/1/teams/*`,
        },
        { statusCode: 500 }
      ).as('error');
      cy.intercept(
        {
          method: 'GET',
          url: gatewayAPI`/organizations/1/`,
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
