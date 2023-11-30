/*
Authenticators list test cases
1. Authenticator list loads
2. Handle 500 error state
3. Handle empty state
*/

import { AuthenticatorsList } from './AuthenticatorsList';
import * as useOptions from '../../../../frontend/common/crud/useOptions';
import { gatewayAPI } from '../../../api/gateway-api-utils';

describe('Authenticators list', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayAPI`/v1/authenticators*`,
        },
        {
          fixture: 'platformAuthenticators.json',
        }
      ).as('authenticatorsList');
    });

    it('Authenticators list renders', () => {
      cy.mount(<AuthenticatorsList />);
      cy.verifyPageTitle('Authenticators');
      cy.get('tbody').find('tr').should('have.length', 4);
      // Toolbar actions are visible
      cy.get(`[data-cy="create-authenticator"]`).should('be.visible');
      cy.get('.page-table-toolbar').within(() => {
        cy.get('.toggle-kebab')
          .click()
          .get('.pf-v5-c-dropdown__menu-item')
          .contains('Delete selected authentications')
          .should('be.visible');
      });
    });
  });

  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayAPI`/v1/authenticators*`,
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
      cy.mount(<AuthenticatorsList />);
      cy.contains(/^There are currently no authenticators added.$/);
      cy.contains(/^Please create a authenticator by using the button below.$/);
    });
  });
  describe('Error retrieving list', () => {
    it('Displays error loading authenticators', () => {
      cy.intercept({ method: 'GET', url: gatewayAPI`/v1/authenticators/*` }, { statusCode: 500 });
      cy.mount(<AuthenticatorsList />);
      cy.contains('Error loading authenticators');
    });
  });
});
