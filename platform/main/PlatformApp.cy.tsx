import { AwxConfigProvider } from '@ansible/awx-ui/common/useAwxConfig';
import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import { gatewayAPI } from '../utils/gateway-api-utils';
import { PlatformApp } from './PlatformApp';
import * as GatewayUIAuth from './GatewayUIAuth';
import { SWRConfig } from 'swr';

const mountPlatformApp = (component: React.ReactNode) => {
  cy.mount(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <AwxConfigProvider>{component}</AwxConfigProvider>
    </SWRConfig>
  );
};

interface ManagedCloudStub {
  returns: (value: boolean) => ManagedCloudStub;
}

describe('Platform Subscription and Session Validation Tests', () => {
  let useIsManagedCloudStub: ManagedCloudStub;

  beforeEach(() => {
    useIsManagedCloudStub = cy
      .stub(GatewayUIAuth, 'useIsManagedCloudInstall')
      .as('useIsManagedCloudStub') as unknown as ManagedCloudStub;
    useIsManagedCloudStub.returns(false);

    cy.intercept('GET', awxAPI`/config/`, {
      body: {
        license_info: {
          compliant: true,
          grace_period_remaining: 54672800,
          time_remaining: 100 * 24 * 60 * 60,
        },
      },
    }).as('getAwxConfig');

    cy.intercept('GET', gatewayAPI`/session/`, {
      body: { expires_in_seconds: 3600 },
    }).as('getSession');
  });

  describe('Subscription Banners', () => {
    it('should not display any subscription banners if license info is compliant', () => {
      mountPlatformApp(<PlatformApp />);
      cy.wait(['@getAwxConfig', '@getSession']);
      cy.get('.pf-v6-c-banner').should('not.exist');
    });

    it('should display a gold banner if the subscription will expire in less than 15 days', () => {
      cy.intercept('GET', awxAPI`/config/`, {
        body: {
          license_info: {
            compliant: true,
            time_remaining: 14 * 24 * 60 * 60,
          },
        },
      }).as('getAwxConfig');
      mountPlatformApp(<PlatformApp />);
      cy.wait(['@getAwxConfig', '@getSession']);
      cy.get('[data-cy="subscription-time-remaining-banner"]').contains(
        'Your subscription will expire in 14 days.'
      );
    });

    it('should display a red banner with no grace period if the subscription is not compliant', () => {
      cy.intercept('GET', awxAPI`/config/`, {
        body: {
          license_info: {
            compliant: false,
            grace_period_remaining: 0,
          },
        },
      }).as('getAwxConfig');
      mountPlatformApp(<PlatformApp />);
      cy.wait(['@getAwxConfig', '@getSession']);
      cy.get('[data-cy="subscription-out-of-compliance-banner"]').contains(
        'Your subscription is out of compliance.'
      );
    });

    it('should display a red banner with grace period if the subscription is not compliant', () => {
      cy.intercept('GET', awxAPI`/config/`, {
        body: {
          license_info: {
            compliant: false,
            grace_period_remaining: 2 * 24 * 60 * 60,
          },
        },
      }).as('getAwxConfig');
      mountPlatformApp(<PlatformApp />);
      cy.wait(['@getAwxConfig', '@getSession']);
      cy.get('[data-cy="subscription-grace-period-banner"]').contains(
        'Your subscription is out of compliance. 2 days grace period remaining.'
      );
    });

    it('should not display any subscription banners when managedCloudInstall is true', () => {
      useIsManagedCloudStub.returns(true);
      cy.intercept('GET', awxAPI`/config/`, {
        body: {
          license_info: {
            compliant: false,
            grace_period_remaining: 2 * 24 * 60 * 60,
          },
        },
      }).as('getAwxConfig');
      mountPlatformApp(<PlatformApp />);
      cy.wait(['@getAwxConfig', '@getSession']);
      cy.get('.pf-v6-c-banner').should('not.exist');
    });
  });

  describe('Session Banner', () => {
    it('should fetch the session data and display the session expiry warning', () => {
      cy.intercept('GET', gatewayAPI`/session/`, {
        body: { expires_in_seconds: 199 },
      }).as('getSession');
      mountPlatformApp(<PlatformApp />);
      cy.wait(['@getAwxConfig', '@getSession']);
      cy.get('[data-cy="session-banner"]').contains('Your session will expire in 3 minutes.');
      cy.get('[data-cy="refresh-session-btn"]').should('exist');
    });
  });
});
