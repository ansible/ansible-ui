/*
Teams list test cases
1. Team list loads
2. Filter by name, description, organization, created, modified - TODO
3. RBAC enable/disable team Create
4. RBAC enable/disable Edit, Delete - TODO
5. Handle 500 error state
6. Handle empty state
*/

import * as useOptions from '../../../../frontend/common/crud/useOptions';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformTeamList } from './PlatformTeamList';

describe('Teams list', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/teams/*`,
        },
        {
          fixture: 'platformTeams.json',
        }
      ).as('teamsList');
    });
    it('Teams list renders', () => {
      cy.mount(<PlatformTeamList />);
      cy.verifyPageTitle('Teams');
      cy.setTableView('table-view');
      cy.get('tbody').find('tr').should('have.length', 3);
      // Toolbar actions are visible
      cy.get(`[data-cy="create-team"]`).should('be.visible');
      cy.get('.page-table-toolbar').within(() => {
        cy.get('.toggle-kebab')
          .click()
          .get('.pf-v5-c-dropdown__menu-item')
          .contains('Delete selected teams')
          .should('be.visible');
      });
    });
    it('Create Team button is disabled if the user does not have permission to create teams', () => {
      cy.mount(<PlatformTeamList />);
      cy.get('a[data-cy="create-team"]').should('have.attr', 'aria-disabled', 'true');
    });
    it('Create Team button is enabled if the user has permission to create teams', () => {
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
      cy.mount(<PlatformTeamList />);
      cy.get('a[data-cy="create-team"]').should('have.attr', 'aria-disabled', 'false');
    });
  });
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/teams/*`,
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
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
      cy.mount(<PlatformTeamList />);
      cy.contains(/^There are currently no teams added.$/);
      cy.contains(/^Please create a team by using the button below.$/);
    });
    it('Empty state is displayed correctly for user without permission to create teams', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<PlatformTeamList />);
      cy.contains(/^You do not have permission to create a team/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
    });
  });
  describe('Error retrieving list', () => {
    it('Displays error loading teams', () => {
      cy.intercept({ method: 'GET', url: gatewayV1API`/teams/*` }, { statusCode: 500 });
      cy.mount(<PlatformTeamList />);
      cy.contains('Error loading teams');
    });
  });
});
