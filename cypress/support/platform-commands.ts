import { randomString } from '../../framework/utils/random-string';
import { gatewayV1API } from '../../platform/api/gateway-api-utils';
import { PlatformOrganization } from '../../platform/interfaces/PlatformOrganization';
import './rest-commands';

Cypress.Commands.add('platformLogin', () => {
  //cy.requiredVariablesAreSet(['PLATFORM_SERVER', 'PLATFORM_USERNAME', 'PLATFORM_PASSWORD']);
  cy.session(
    'PLATFORM',
    () => {
      window.localStorage.setItem('default-nav-expanded', 'true');
      window.localStorage.setItem('theme', 'light');
      window.localStorage.setItem('disclaimer', 'true');
      window.localStorage.setItem('hide-welcome-message', 'true');
      cy.visit(`/login`, {
        retryOnStatusCodeFailure: true,
        retryOnNetworkFailure: true,
      });
      cy.get('[data-cy="username"]').type(Cypress.env('PLATFORM_USERNAME') as string, {
        log: false,
        delay: 0,
      });
      cy.get('[data-cy="password"]').type(Cypress.env('PLATFORM_PASSWORD') as string, {
        log: false,
        delay: 0,
      });
      cy.get('[data-cy="Submit"]').click();
      cy.get('[data-cy="nav-toggle"]').should('exist');
    },
    {
      validate: () => {
        cy.request({ method: 'GET', url: gatewayV1API`/me/` });
      },
      cacheAcrossSpecs: true,
    }
  );
  cy.visit(`/`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
});

Cypress.Commands.add('createPlatformOrganization', () => {
  cy.requestPost<PlatformOrganization>(gatewayV1API`/organizations/`, {
    name: `Platform E2E Organization ${randomString(5)}`,
  });
});

Cypress.Commands.add(
  'deletePlatformOrganization',
  (
    organization: PlatformOrganization,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (!organization?.id) return;
    cy.requestDelete(gatewayV1API`/organizations/${organization?.id.toString()}/`, options);
  }
);
