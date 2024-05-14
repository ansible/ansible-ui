import { PlatformApp } from './PlatformApp';
import { AwxConfigProvider } from '../../frontend/awx/common/useAwxConfig';
import { gatewayAPI } from '../api/gateway-api-utils';

describe('Platform Subscription and Session Validation Tests', () => {
  it('should not display a banner if AWC config or License info is not available', () => {
    cy.intercept('GET', '/api/v2/config/', {
      body: {
        license_info: {
          compliant: true,
          grace_period_remaining: 54672800,
        },
      },
    }).as('getAwxConfig');

    cy.mount(
      <AwxConfigProvider>
        <PlatformApp />
      </AwxConfigProvider>
    );

    cy.wait('@getAwxConfig');

    cy.get('.pf-v5-c-banner').should('not.exist');
    cy.get('[data-cy=subscription-out-of-compliance-banner]').should('not.exist');
    cy.get('[data-cy=subscription-time-remaining-banner]').should('not.exist');
  });

  it('should display a gold banner if the subscription will expire in less than 15 days', () => {
    cy.intercept('GET', '/api/v2/config/', {
      body: {
        license_info: {
          compliant: true,
          time_remaining: 14 * 24 * 60 * 60,
        },
      },
    }).as('getAwxConfig');

    cy.mount(
      <AwxConfigProvider>
        <PlatformApp />
      </AwxConfigProvider>
    );

    cy.wait('@getAwxConfig');

    cy.get('[data-cy="subscription-time-remaining-banner"]').contains(
      'Your subscription will expire in 14 days.'
    );
  });

  it('should display a red banner with no grace period if the subscription is not compliant', () => {
    cy.intercept('GET', '/api/v2/config/', {
      body: {
        license_info: {
          compliant: false,
          grace_period_remaining: 0,
        },
      },
    }).as('getAwxConfig');

    cy.mount(
      <AwxConfigProvider>
        <PlatformApp />
      </AwxConfigProvider>
    );

    cy.wait('@getAwxConfig');

    cy.get('[data-cy="subscription-out-of-compliance-banner"]').contains(
      'Your subscription is out of compliance.'
    );
  });

  it('should display a red banner with grace period if the subscription is not compliant', () => {
    cy.intercept('GET', '/api/v2/config/', {
      body: {
        license_info: {
          compliant: false,
          grace_period_remaining: 2 * 24 * 60 * 60,
        },
      },
    }).as('getAwxConfig');

    cy.mount(
      <AwxConfigProvider>
        <PlatformApp />
      </AwxConfigProvider>
    );

    cy.wait('@getAwxConfig');

    cy.get('[data-cy="subscription-grace-period-banner"]').contains(
      'Your subscription is out of compliance. 2 days grace period remaining.'
    );
  });
});

describe('Platform Session Tests', () => {
  it('should fetch the session data and display the session expiry warning', () => {
    cy.intercept('GET', gatewayAPI`/session/`, {
      body: {
        expires_in_seconds: 199,
      },
    }).as('getSession');

    cy.mount(<PlatformApp />);

    cy.wait('@getSession');

    cy.get('[data-cy="session-banner"]').contains('Your session will expire in 3 minutes.');
    cy.get('[data-cy="refresh-session-btn"]').should('exist');
  });
});
