import './rest-commands';
import { randomString } from '../../framework/utils/random-string';
import { gatewayV1API } from '../../platform/api/gateway-api-utils';
import { PlatformOrganization } from '../../platform/interfaces/PlatformOrganization';
import { PlatformUser } from '../../platform/interfaces/PlatformUser';
import { PlatformTeam } from '../../platform/interfaces/PlatformTeam';

/* The `Cypress.Commands.add('platformLogin', () => { ... })` function is a custom Cypress command that
handles the login process for a platform application. Here's a breakdown of what it does: */
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

/* The `Cypress.Commands.add('platformLogout', () => { ... })` function is a custom Cypress command
that handles the logout process for a platform application. Here's a breakdown of what it does: */
Cypress.Commands.add('platformLogout', () => {
  cy.get('[data-ouia-component-id="account-menu"]')
    .click()
    .then(() => {
      cy.intercept('POST', gatewayV1API`/logout/`).as('logout');
      cy.contains('a', 'Logout').click();
      cy.wait('@logout');
    });
});

/* The `Cypress.Commands.add('createPlatformOrganization', () => { ... })` function is a custom Cypress
command that is responsible for creating a new platform organization. Here's a breakdown of what it
does: */
Cypress.Commands.add('createPlatformOrganization', () => {
  const orgName = `Platform E2E Organization-${randomString(5).toLowerCase()}`;
  cy.requestPost<PlatformOrganization>(gatewayV1API`/organizations/`, {
    name: orgName,
  });
});

/* The `Cypress.Commands.add('deletePlatformOrganization', ...)` function is a custom Cypress command
that is responsible for deleting a platform organization. Here's a breakdown of what it does: */
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

/* This `Cypress.Commands.add('createPlatformUser', ...)` function is a custom Cypress command that is
responsible for creating a new platform user. Here's a breakdown of what it does: */
Cypress.Commands.add('createPlatformUser', (platformOrganization?: PlatformOrganization) => {
  cy.requestPost<PlatformUser>(gatewayV1API`/users/`, {
    username: platformOrganization
      ? `e2e-platform-user-with-org-${randomString(4).toLowerCase()}`
      : `e2e-platform-user-${randomString(4).toLowerCase()}`,
    password: 'pw',
    organizations: platformOrganization ? [platformOrganization.id] : [],
  }).then((user) => user);
});

/* This `Cypress.Commands.add('deletePlatformUser', ...)` function is a custom Cypress command that is
responsible for deleting a platform user. Here's a breakdown of what it does: */
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

/* This `Cypress.Commands.add('createPlatformTeam', ...)` function is a custom Cypress command that is
responsible for creating a new platform team. Here's a breakdown of what it does: */
Cypress.Commands.add(
  'createPlatformTeam',
  function (platformOrganization: PlatformOrganization, platformUser?: PlatformUser) {
    cy.requestPost<PlatformTeam>(gatewayV1API`/teams/`, {
      name: platformUser
        ? `Platform E2E Team with user ${randomString(5)}`
        : `Platform E2E Team ${randomString(5)}`,
      organization: platformOrganization.id,
      users: platformUser ? [platformUser.id] : [],
    });
  }
);

/* This `Cypress.Commands.add('deletePlatformTeam', ...)` function is a custom Cypress command that is
responsible for deleting a platform team. Here's a breakdown of what it does: */
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

/* The `Cypress.Commands.add('createGlobalPlatformOrganization', function () { ... })` function is a
custom Cypress command that is responsible for creating a global platform organization if it doesn't
already exist. Here's a breakdown of what it does: */
const GLOBAL_PLATFORM_ORG_NAME = 'Global Platform Level Organization';

Cypress.Commands.add('createGlobalPlatformOrganization', function () {
  cy.requestGet<PlatformOrganization>(gatewayV1API`/organizations?name=${GLOBAL_PLATFORM_ORG_NAME}`)
    .its('results')
    .then((platformOrgResults: PlatformOrganization[]) => {
      if (platformOrgResults.length === 0) {
        cy.requestPost<PlatformOrganization>(gatewayV1API`/organizations/`, {
          name: GLOBAL_PLATFORM_ORG_NAME,
        });
        cy.wait(100).then(() => cy.createGlobalPlatformOrganization());
      } else {
        cy.wrap(platformOrgResults[0]).as('globalPlatformOrganization');
      }
    });
});
