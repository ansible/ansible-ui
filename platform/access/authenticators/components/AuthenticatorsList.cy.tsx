/*
Authenticators list test cases
1. Authenticator list loads
2. Handle 500 error state
3. Handle empty state
*/

import { AuthenticatorsList } from './AuthenticatorsList';
import * as useOptions from '../../../../frontend/common/crud/useOptions';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { RulebookActivations } from '../../../../frontend/eda/rulebook-activations/RulebookActivations';

describe('Authenticators list', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayAPI`/v1/authenticators/*`,
        },
        {
          fixture: 'platformAuthenticators.json',
        }
      ).as('authenticatorsList');
    });

    it('Authenticators list renders', () => {
      cy.mount(<AuthenticatorsList />);
      cy.verifyPageTitle('Authentication');
      cy.get('tbody').find('tr').should('have.length', 3);
      // Toolbar actions are visible
      cy.get(`[data-cy="create-authentication"]`).should('be.visible');
      cy.get('.page-table-toolbar').within(() => {
        cy.get('.toggle-kebab')
          .click()
          .get('.pf-v5-c-dropdown__menu-item')
          .contains('Delete selected authentications')
          .should('be.visible');
      });
    });

    it('Renders the correct authenticators columns', () => {
      cy.mount(<AuthenticatorsList />);
      cy.get('h1').should('contain', 'Authentication');
      cy.get('tbody').find('tr').should('have.length', 3);
      cy.get('[data-cy="order-column-header"]').should('be.visible');
      cy.get('[data-cy="name-column-header"]').should('be.visible');
      cy.get('[data-cy="authentication-type-column-header"]').should('be.visible');
    });

    it('can delete an Authenticator from the toolbar button', () => {
      cy.mount(<AuthenticatorsList />);
      cy.intercept({ method: 'POST', url: gatewayAPI`/v1/authenticators/2/delete/` });
      cy.get('[data-cy="row-id-2"] > [data-cy="checkbox-column-cell"]').click();
      cy.get('[data-cy="actions-dropdown"]').first().click();
      cy.get('[data-cy="delete-selected-authentications"]').click();
      cy.get('div[role="dialog"]').within(() => {
        cy.get('.pf-v5-c-check__label').should(
          'contain',
          `Yes, I confirm that I want to delete these`
        );
        cy.contains('Dev Keycloak Container');
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains('Delete authentications').click();
      });
      cy.clickButton(/^Close$/);
    });
  });

  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayAPI`/v1/authenticators/*`,
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
      cy.contains(/^There are currently no authentications added.$/);
      cy.contains(/^Please create an authentication by using the button below.$/);
    });
  });

  describe('Error retrieving list', () => {
    it('Displays error loading authenticators', () => {
      cy.intercept({ method: 'GET', url: gatewayAPI`/v1/authenticators/*` }, { statusCode: 500 });
      cy.mount(<AuthenticatorsList />);
      cy.contains('Error loading authentications');
    });
  });
});
