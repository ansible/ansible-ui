/*
Organizations list test cases
1. Organization list loads
2. Filter by name, description, organization, created, modified - TODO
3. RBAC enable/disable organization Create
4. RBAC for Edit, Delete - TODO
4. Handle 500 error state
5. Handle empty state
*/

import * as useOptions from '../../../../frontend/common/crud/useOptions';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformOrganizationList } from './PlatformOrganizationList';

describe('Organizations list', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/organizations/*`,
        },
        {
          fixture: 'platformOrganizations.json',
        }
      ).as('organizationsList');
    });
    it('Organizations list renders', () => {
      cy.mount(<PlatformOrganizationList />);
      cy.verifyPageTitle('Organizations');
      cy.setTableView('table');
      cy.get('tbody').find('tr').should('have.length', 3);
      // Toolbar actions are visible
      cy.get(`[data-cy="create-organization"]`).should('be.visible');
      cy.get('.page-table-toolbar').within(() => {
        cy.get('.toggle-kebab')
          .click()
          .get('.pf-v5-c-dropdown__menu-item')
          .contains('Delete selected organizations')
          .should('be.visible');
      });
    });
    it('Create Organization button is disabled if the user does not have permission to create organizations', () => {
      cy.mount(<PlatformOrganizationList />);
      cy.get('a[data-cy="create-organization"]').should('have.attr', 'aria-disabled', 'true');
    });
    it('Create Organization button is enabled if the user has permission to create organizations', () => {
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
      cy.mount(<PlatformOrganizationList />);
      cy.get('a[data-cy="create-organization"]').should('have.attr', 'aria-disabled', 'false');
    });
  });
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayV1API`/organizations/*`,
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed correctly for user with permission to create organization', () => {
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
      cy.mount(<PlatformOrganizationList />);
      cy.contains(/^There are currently no organizations added.$/);
      cy.contains(/^Please create an organization by using the button below.$/);
    });
    it('Empty state is displayed correctly for user without permission to create teams', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<PlatformOrganizationList />);
      cy.contains(/^You do not have permission to create an organization/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
    });
  });
  describe('Error retrieving list', () => {
    it('Displays error loading organizations', () => {
      cy.intercept({ method: 'GET', url: gatewayV1API`/organizations/*` }, { statusCode: 500 });
      cy.mount(<PlatformOrganizationList />);
      cy.contains('Error loading organizations');
    });
  });
});
