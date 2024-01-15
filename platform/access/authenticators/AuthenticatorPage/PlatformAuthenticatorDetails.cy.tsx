import { PlatformAuthenticatorDetails } from './PlatformAuthenticatorDetails';
import mockPlatformAuthenticators from '../../../../cypress/fixtures/platformAuthenticators.json';
import mockPlatformAuthenticatorPlugins from '../../../../cypress/fixtures/platformAuthenticatorPlugins.json';
import mockPlatformAuthenticatorMaps from '../../../../cypress/fixtures/platformAuthenticatorMaps.json';
import { gatewayAPI } from '../../../api/gateway-api-utils';

const mockAuthenticator = mockPlatformAuthenticators.results[2];
const mockPlugins = mockPlatformAuthenticatorPlugins;
const mockMaps = mockPlatformAuthenticatorMaps;

describe('PlatformTeamDetails', () => {
  it('Component displays authenticator details', () => {
    cy.intercept(
      { method: 'GET', path: gatewayAPI`/authenticators/*` },
      { body: mockAuthenticator }
    );
    cy.intercept(
      { method: 'GET', path: gatewayAPI`/authenticator_plugins` },
      { body: mockPlugins }
    );
    cy.intercept(
      { method: 'GET', path: gatewayAPI`/authenticator_maps?authenticator=*` },
      { body: mockMaps }
    );
    cy.mount(<PlatformAuthenticatorDetails />);
    cy.get('[data-cy="name"]').should('have.text', mockAuthenticator.name);
    cy.get('[data-cy="type"]').should('have.text', mockAuthenticator.type);
    cy.get('[data-cy="ldap-group-type"]').should(
      'have.text',
      mockAuthenticator.configuration.GROUP_TYPE
    );
    cy.get('[data-cy="rule-#1"]').should('have.text', mockMaps.results[0].ui_summary);
  });
});
