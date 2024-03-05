import './rest-commands';
import { randomString } from '../../framework/utils/random-string';
import { gatewayV1API } from '../../platform/api/gateway-api-utils';
import { PlatformOrganization } from '../../platform/interfaces/PlatformOrganization';
import { PlatformUser } from '../../platform/interfaces/PlatformUser';
import { PlatformTeam } from '../../platform/interfaces/PlatformTeam';

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
      cy.getByDataCy('username').type(Cypress.env('PLATFORM_USERNAME') as string, {
        log: false,
        delay: 0,
      });
      cy.getByDataCy('password').type(Cypress.env('PLATFORM_PASSWORD') as string, {
        log: false,
        delay: 0,
      });
      cy.getByDataCy('Submit').click();
      cy.getByDataCy('nav-toggle').should('exist');
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

Cypress.Commands.add('platformLogout', () => {
  cy.get('[data-ouia-component-id="account-menu"]')
    .click()
    .then(() => {
      cy.intercept('POST', gatewayV1API`/logout/`).as('logout');
      cy.contains('a', 'Logout').click();
      cy.wait('@logout');
    });
});

Cypress.Commands.add('createPlatformOrganization', () => {
  const orgName = 'platform-e2e-organization' + randomString(5).toLowerCase();
  cy.requestPost<PlatformOrganization>(gatewayV1API`/organizations/`, {
    name: orgName,
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

Cypress.Commands.add('createPlatformUser', (platformOrganization?: PlatformOrganization) => {
  cy.requestPost<PlatformUser>(gatewayV1API`/users/`, {
    username: platformOrganization
      ? `e2e-platform-user-with-org-${randomString(4).toLowerCase()}`
      : `e2e-platform-user-${randomString(4).toLowerCase()}`,
    password: 'pw',
    organizations: platformOrganization ? [platformOrganization.id] : [],
  }).then((user) => user);
});
Cypress.Commands.add(
  'deletePlatformUser',
  (
    user: PlatformUser,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (!user?.id) return;
    cy.requestDelete(gatewayV1API`/users/${user?.id.toString()}/`, options);
  }
);

Cypress.Commands.add(
  'createPlatformTeam',
  function (platformOrganization: PlatformOrganization, platformUser?: PlatformUser) {
    cy.requestPost<Pick<Team, 'name' | 'organization'>, Team>(gatewayV1API`/teams/`, {
      name: platformUser
        ? `Platform E2E Team with user ${randomString(5)}`
        : `Platform E2E Team ${randomString(5)}`,
      organization: platformOrganization.id,
      users: platformUser ? [platformUser.id] : [],
    });
  }
);

Cypress.Commands.add(
  'deletePlatformTeam',
  (
    platformTeam: PlatformTeam,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (platformTeam.id) {
      cy.requestDelete(gatewayV1API`/teams/${platformTeam.id.toString()}/`, options);
    }
  }
);

const GLOBAL_PLATFORM_ORG_NAME = 'Global Platform Level Organization';

/** Creates a global organization if it doesn't exist. */
Cypress.Commands.add('createGlobalPlatformOrganization', function () {
  cy.requestGet<PlatformItemsResponse<PlatformOrganization>>(
    gatewayV1API`/organizations?name=${GLOBAL_PLATFORM_ORG_NAME}`
  )
    .its('results')
    .then((platformOrgResults: PlatformOrganization[]) => {
      if (platformOrgResults.length === 0) {
        cy.requestPost<PlatformItemsResponse<PlatformOrganization>>(gatewayV1API`/organizations/`, {
          name: GLOBAL_PLATFORM_ORG_NAME,
        });
        cy.wait(100).then(() => cy.createGlobalPlatformOrganization());
      } else {
        cy.wrap(platformOrgResults[0]).as('globalPlatformOrganization');
      }
    });
});
