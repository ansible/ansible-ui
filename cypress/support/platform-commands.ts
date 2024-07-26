import { randomString } from '../../framework/utils/random-string';
import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { Application } from '../../frontend/awx/interfaces/Application';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Team } from '../../frontend/awx/interfaces/Team';
import { Token } from '../../frontend/awx/interfaces/Token';
import { AwxUser } from '../../frontend/awx/interfaces/User';
import { gatewayV1API } from '../../platform/api/gateway-api-utils';
import { Authenticator } from '../../platform/interfaces/Authenticator';
import { PlatformItemsResponse } from '../../platform/interfaces/PlatformItemsResponse';
import { PlatformOrganization } from '../../platform/interfaces/PlatformOrganization';
import { PlatformTeam } from '../../platform/interfaces/PlatformTeam';
import { PlatformUser } from '../../platform/interfaces/PlatformUser';
import { awxAPI } from './formatApiPathForAwx';
import './rest-commands';

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
      cy.visit(`/`, {
        retryOnStatusCodeFailure: true,
        retryOnNetworkFailure: true,
      });
      cy.contains('Log in');
      cy.wait(1); // Seems like sometimes when the page first comes up that the login form is not ready
      cy.get('#pf-login-username-id').type(Cypress.env('PLATFORM_USERNAME') as string, {
        delay: 0,
        force: true,
      });
      cy.get('#pf-login-password-id').type(Cypress.env('PLATFORM_PASSWORD') as string, {
        delay: 0,
        force: true,
      });
      cy.contains('button', 'Log in').click();
      cy.getByDataCy('nav-toggle').should('exist');
    },
    {
      validate: () => {
        cy.request({ method: 'GET', url: gatewayV1API`/me/` });
      },
      cacheAcrossSpecs: true,
    }
  );
  cy.requestPost(gatewayV1API`/session/`, {});
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
      cy.then(Cypress.session.clearAllSavedSessions);
    });
});

Cypress.Commands.add(
  'createLocalPlatformAuthenticator',
  (localAuthenticatorName: string, isEnabled?: boolean) => {
    cy.requestPost(gatewayV1API`/authenticators/`, {
      name: localAuthenticatorName,
      type: 'ansible_base.authentication.authenticator_plugins.local',
      configuration: {},
      enabled: isEnabled,
    });
  }
);

Cypress.Commands.add(
  'deleteAuthenticator',
  (
    authenticator: Authenticator,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (authenticator.id !== 1) {
      cy.requestDelete(gatewayV1API`/authenticators/${authenticator.id.toString()}/`, options);
    }
  }
);

Cypress.Commands.add(
  'deleteLocalPlatformAuthenticator',
  (
    localAuthenticator: Authenticator,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (localAuthenticator.id !== 1) {
      cy.requestDelete(gatewayV1API`/authenticators/${localAuthenticator.id.toString()}/`, options);
    }
  }
);

/* The `Cypress.Commands.add('createPlatformOrganization', () => { ... })` function is a custom Cypress
command that is responsible for creating a new platform organization. Here's a breakdown of what it
does: */
Cypress.Commands.add('createPlatformOrganization', (org?: Partial<PlatformOrganization>) => {
  if (!org) {
    org = {};
  }
  if (!org.name) {
    org.name = `E2E Platform Org ${randomString(4)}`;
  }
  cy.requestPost<PlatformOrganization>(gatewayV1API`/organizations/`, org);
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

Cypress.Commands.add('createPlatformUser', (user?: Partial<PlatformUser>) => {
  const userName = `platform-e2e-user-${randomString(4).toLowerCase()}`;
  cy.requestPost<PlatformUser>(gatewayV1API`/users/`, {
    username: userName,
    password: 'pw',
    ...user,
  });
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
Cypress.Commands.add('createPlatformTeam', function (platformTeam: Partial<PlatformTeam>) {
  const teamName = `Platform E2E Team-${randomString(3).toLowerCase()}`;
  cy.requestPost<Partial<PlatformTeam>>(gatewayV1API`/teams/`, {
    name: teamName,
    ...platformTeam,
  });
});

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
    if (platformTeam?.id) {
      cy.requestDelete(gatewayV1API`/teams/${platformTeam.id.toString()}/`, options);
    }
  }
);
Cypress.Commands.add(
  'associateUsersWithPlatformOrganization', //
  (platformOrganization: PlatformOrganization, users: PlatformUser[]) => {
    cy.requestPost(
      gatewayV1API`/organizations/${platformOrganization.id.toString()}/users/associate/`,
      {
        instances: users.map((user) => user.id),
      }
    );
  }
);

Cypress.Commands.add(
  'associateUsersWithPlatformTeam',
  (platformTeam: PlatformTeam, users: PlatformUser[]) => {
    cy.requestPost(gatewayV1API`/teams/${platformTeam.id.toString()}/users/associate/`, {
      instances: users.map((user) => user.id),
    });
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

Cypress.Commands.add('getAwxOrgByAnsibleId', (ansibleId: string | undefined) => {
  if (!ansibleId) {
    throw new Error('ansibleId is required');
  }
  cy.poll(
    () =>
      cy.requestGet<AwxItemsResponse<Organization> | undefined>(
        awxAPI`/organizations/?resource__ansible_id=${ansibleId}`
      ),
    (results) => results.results.length > 0
  ).then((results) => {
    cy.wrap(results.results[0]);
  });
});

Cypress.Commands.add('getPlatformOrgByAnsibleId', (ansibleId: string | undefined) => {
  if (!ansibleId) {
    throw new Error('ansibleId is required');
  }
  cy.poll(
    () =>
      cy.requestGet<PlatformItemsResponse<PlatformOrganization> | undefined>(
        gatewayV1API`/organizations/?resource__ansible_id=${ansibleId}`
      ),
    (results) => results.results.length > 0
  ).then((results) => {
    cy.wrap(results.results[0]);
  });
});

Cypress.Commands.add('getAwxTeamByAnsibleId', (ansibleId: string | undefined) => {
  if (!ansibleId) {
    throw new Error('ansibleId is required');
  }
  cy.poll(
    () =>
      cy.requestGet<AwxItemsResponse<Team> | undefined>(
        awxAPI`/teams/?resource__ansible_id=${ansibleId}`
      ),
    (results) => results.results.length > 0
  ).then((results) => {
    cy.wrap(results.results[0]);
  });
});

Cypress.Commands.add('getPlatformTeamByAnsibleId', (ansibleId: string | undefined) => {
  if (!ansibleId) {
    throw new Error('ansibleId is required');
  }
  cy.poll(
    () =>
      cy.requestGet<PlatformItemsResponse<PlatformTeam> | undefined>(
        gatewayV1API`/teams/?resource__ansible_id=${ansibleId}`
      ),
    (results) => results.results.length > 0
  ).then((results) => {
    cy.wrap(results.results[0]);
  });
});

Cypress.Commands.add('getAwxUserByAnsibleId', (ansibleId: string | undefined) => {
  if (!ansibleId) {
    throw new Error('ansibleId is required');
  }
  cy.poll(
    () =>
      cy.requestGet<AwxItemsResponse<AwxUser> | undefined>(
        awxAPI`/users/?resource__ansible_id=${ansibleId}`
      ),
    (results) => results.results.length > 0
  ).then((results) => {
    cy.wrap(results.results[0]);
  });
});

Cypress.Commands.add('getPlatformUserByAnsibleId', (ansibleId: string | undefined) => {
  if (!ansibleId) {
    throw new Error('ansibleId is required');
  }
  cy.poll(
    () =>
      cy.requestGet<PlatformItemsResponse<PlatformUser> | undefined>(
        gatewayV1API`/users/?resource__ansible_id=${ansibleId}`
      ),
    (results) => results.results.length > 0
  ).then((results) => {
    cy.wrap(results.results[0]);
  });
});

Cypress.Commands.add('searchAndDisplayResourceInModalPlatform', (resourceName: string) => {
  cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
    cy.get('[data-cy="text-input"]').find('input').type(resourceName);
  });
});

Cypress.Commands.add('selectItemFromLookupModalPlatform', () => {
  cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
    cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
      cy.get('[data-cy="checkbox-column-cell"] input').click();
    });
    cy.clickButton(/^Save/);
  });
});

Cypress.Commands.add('selectAuthenticationType', (authenticationType: string) => {
  cy.get('[data-cy="authentication-type-select-form-group"] [data-ouia-component-id="menu-select"]')
    .click()
    .within(() => {
      cy.get(`[data-cy="${authenticationType}"]`).click();
    });
});

Cypress.Commands.add('selectResourceFromDropDown', (resourceName: string) => {
  cy.get('[data-ouia-component-id="menu-select"]')
    .click()
    .within(() => {
      cy.get(`[data-cy="${resourceName}"]`).click();
    });
});

Cypress.Commands.add(
  'searchAndDisplayResourceByFilterOption',
  (resourceName: string, filterOption: string) => {
    cy.get('[data-ouia-component-id="page-toolbar"]').within(() => {
      cy.get('button[data-cy="filter"]').click();
    });
    cy.get(`.pf-v5-c-menu [data-cy="${filterOption}"]`).click();
    cy.get('[data-cy="text-input"]').find('input').type(resourceName);
    cy.getBy('[data-cy="apply-filter"]').click();
  }
);

Cypress.Commands.add(
  'selectResourceFromSpecificDropDown',
  (dropdownDataCy: string, resourceName: string) => {
    cy.get(`[data-cy="${dropdownDataCy}"] [data-ouia-component-id="menu-select"]`)
      .click()
      .within(() => {
        cy.get(`[data-cy="${resourceName}"]`).click();
      });
  }
);

Cypress.Commands.add(
  'createPlatformOAuthApplication',
  (
    authType: string,
    clientType: 'confidential' | 'public' | undefined,
    organization?: PlatformOrganization
  ) => {
    return cy.requestPost<
      Application,
      Pick<
        Application,
        | 'name'
        | 'description'
        | 'organization'
        | 'client_type'
        | 'authorization_grant_type'
        | 'redirect_uris'
      >
    >(gatewayV1API`/applications/`, {
      name: `AAP OAuth Application ${randomString(4)}`,
      description: 'E2E Application Description',
      organization: organization ? organization?.id : 1,
      client_type: clientType,
      authorization_grant_type: authType,
      redirect_uris:
        authType === 'confidential' || authType === 'password' ? 'https://create_from_api.com' : '',
    });
  }
);

Cypress.Commands.add('createPlatformToken', (aapToken?: Partial<Token>) => {
  const url = gatewayV1API`/tokens/`;
  const body = { ...aapToken };

  return cy.requestPost<Token>(url, body);
});

Cypress.Commands.add('getCurrentPlatformUser', () => {
  cy.requestGet<PlatformItemsResponse<PlatformUser>>(gatewayV1API`/me/`)
    .its('results')
    .then((results) => {
      return results[0];
    });
});
