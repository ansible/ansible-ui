import mockPlatformAuthenticatorMaps from '@ansible/cypress/fixtures/platformAuthenticatorMaps.json';
import mockPlatformAuthenticatorPlugins from '@ansible/cypress/fixtures/platformAuthenticatorPlugins.json';
import mockPlatformAuthenticators from '@ansible/cypress/fixtures/platformAuthenticators.json';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { PlatformAuthenticatorDetails } from './PlatformAuthenticatorDetails';

const mockAuthenticator = mockPlatformAuthenticators.results[2];
const legacyAuthenticator = mockPlatformAuthenticators.results[3];
const mockPlugins = mockPlatformAuthenticatorPlugins;
const mockMaps = mockPlatformAuthenticatorMaps;

describe('PlatformAuthenticatorDetails', () => {
  it('Component displays authenticator details', () => {
    cy.intercept(
      { method: 'GET', path: gatewayAPI`/authenticators/*` },
      { body: mockAuthenticator }
    );

    cy.intercept(
      {
        method: 'GET',
        path: gatewayAPI`/authenticators/?auto_migrate_users_to=${legacyAuthenticator.id.toString()}`,
      },
      {
        body: {
          count: 1,
          next: null,
          previous: null,
          results: [mockPlatformAuthenticators.results[0]],
        },
      }
    );

    cy.intercept(
      { method: 'GET', path: gatewayAPI`/authenticator_plugins/` },
      { body: mockPlugins }
    );
    cy.intercept(
      { method: 'GET', path: gatewayAPI`/authenticator_maps/?authenticator=*` },
      { body: mockMaps }
    );
    cy.mount(<PlatformAuthenticatorDetails />);
    cy.get('[data-cy="name"]').should('have.text', mockAuthenticator.name);
    cy.get('[data-cy="type"]').should('have.text', 'LDAP');
    cy.get('[data-cy="ldap-group-type"]').should(
      'have.text',
      mockAuthenticator.configuration.GROUP_TYPE
    );
  });
});
