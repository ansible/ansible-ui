import { gatewayV1API } from '../../../api/gateway-api-utils';
import { AuthenticatorPage } from './AuthenticatorPage';

const authenticator = {
  name: 'Local Database Authenticator',
  id: 1,
  url: '/api/gateway/v1/authenticators/1/',
  created_on: '2023-11-01T20:57:51.965351Z',
  created_by: null,
  modified_on: '2023-11-01T20:57:51.966029Z',
  modified_by: null,
  related: {
    'authenticator-map': '/api/gateway/v1/authenticators/1/authenticator_maps/',
  },
  summary_fields: {},
  enabled: true,
  create_objects: true,
  remove_users: false,
  configuration: {},
  type: 'ansible_base.authenticator_plugins.local',
  order: 1,
  slug: 'ansible_baseauthenticator_pluginslocal-local-database-authenticator',
};

describe('AuthenticatorPage', () => {
  beforeEach(() => {
    cy.intercept({ method: 'GET', path: gatewayV1API`/authenticators/*` }, { body: authenticator });
  });
  it('Component renders and displays authenticator in breadcrumb', () => {
    cy.mount(<AuthenticatorPage />);
    cy.contains('nav[aria-label="Breadcrumb"]', 'Local Database Authenticator').should('exist');
  });
  it('All buttons are enabled when user has correct permissions', () => {
    cy.intercept(
      { method: 'OPTIONS', path: gatewayV1API`/authenticators/*` },
      {
        body: {
          actions: {
            PUT: true,
          },
        },
      }
    ).as('getOptions');
    cy.mount(<AuthenticatorPage />);
    cy.wait('@getOptions');
    cy.contains('button', 'Edit authenticator').should('have.attr', 'aria-disabled', 'false');
    cy.get('button[aria-label="Actions"]').click();
    cy.contains('a.pf-v5-c-dropdown__menu-item', 'Delete authenticator').should(
      'have.attr',
      'aria-disabled',
      'false'
    );
    cy.get('.pf-v5-c-switch__input').should('have.length', 1);
    cy.get('.pf-v5-c-switch__input').should('not.be.disabled');
  });
  it('All buttons are disabled when user has incorrect permissions', () => {
    cy.intercept(
      { method: 'OPTIONS', path: gatewayV1API`/authenticators/*` },
      {
        body: {
          actions: {},
        },
      }
    ).as('getOptions');
    cy.mount(<AuthenticatorPage />);
    cy.wait('@getOptions');
    cy.contains('button', 'Edit authenticator').should('have.attr', 'aria-disabled', 'true');
    cy.get('button[aria-label="Actions"]').click();
    cy.contains('a.pf-v5-c-dropdown__menu-item', 'Delete authenticator').should(
      'have.attr',
      'aria-disabled',
      'true'
    );
    cy.get('.pf-v5-c-switch__input').should('have.length', 1);
    cy.get('.pf-v5-c-switch__input').should('be.disabled');
  });
});
