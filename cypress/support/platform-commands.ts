import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { NotificationTemplate } from '@ansible/awx-ui/interfaces/NotificationTemplate';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { Team } from '@ansible/awx-ui/interfaces/Team';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { AwxUser } from '@ansible/awx-ui/interfaces/User';
import { EdaItemsResponse } from '@ansible/eda-ui/common/EdaItemsResponse';
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { EdaTeam } from '@ansible/eda-ui/interfaces/EdaTeam';
import { EdaUser } from '@ansible/eda-ui/interfaces/EdaUser';
import { PulpItemsResponse } from '@ansible/hub-ui/common/useHubView';
import { HubTeam } from '@ansible/hub-ui/interfaces/expanded/HubTeam';
import { HubUser } from '@ansible/hub-ui/interfaces/expanded/HubUser';
import { Authenticator } from '@ansible/platform-ui/interfaces/Authenticator';
import { PlatformItemsResponse } from '@ansible/platform-ui/interfaces/PlatformItemsResponse';
import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { UpgradeUserType, usersForMigration } from './constants';
import { awxAPI } from './formatApiPathForAwx';
import { edaAPI } from './formatApiPathForEDA';
import { hubAPI } from './formatApiPathForHub';
import { gatewayAPI } from './formatApiPathForPlatform';
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
        cy.request({ method: 'GET', url: gatewayAPI`/me/` });
      },
      cacheAcrossSpecs: true,
    }
  );
  cy.requestPost(gatewayAPI`/session/`, {});
  cy.visit(`/`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
});

/* The `Cypress.Commands.add('platformLogout', () => { ... })` function is a custom Cypress command
that handles the logout process for a platform application. Here's a breakdown of what it does: */
Cypress.Commands.add('platformLogout', () => {
  cy.get('#account-menu-menu-toggle')
    .click()
    .then(() => {
      cy.intercept('POST', gatewayAPI`/logout/`).as('logout');
      cy.contains('Logout').click();
      cy.wait('@logout');
      cy.then(Cypress.session.clearAllSavedSessions);
    });
});

Cypress.Commands.add(
  'createLocalPlatformAuthenticator',
  (localAuthenticatorName: string, isEnabled?: boolean) => {
    cy.requestPost(gatewayAPI`/authenticators/`, {
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
      cy.requestDelete(gatewayAPI`/authenticators/${authenticator.id.toString()}/`, options);
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
      cy.requestDelete(gatewayAPI`/authenticators/${localAuthenticator.id.toString()}/`, options);
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
  cy.requestPost<PlatformOrganization>(gatewayAPI`/organizations/`, org);
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
    cy.requestDelete(gatewayAPI`/organizations/${organization?.id.toString()}/`, options);
  }
);

/* This `Cypress.Commands.add('createPlatformUser', ...)` function is a custom Cypress command that is
responsible for creating a new platform user. Here's a breakdown of what it does: */

Cypress.Commands.add('createPlatformUser', (user?: Partial<PlatformUser>) => {
  const userName = `platform-e2e-user-${randomString(4).toLowerCase()}`;
  cy.requestPost<PlatformUser>(gatewayAPI`/users/`, {
    username: userName,
    password: 'pw',
    ...user,
  });
});

/**
 * Returns the credentials (object containing username and password) of an unmigrated user for testing upgrades
 * Note: Must be logged in as a system administrator
 * Usage:
 *     cy.getUserForMigration(UpgradeUserType.controllerLdap).then((user) => {
 *        // Test with user.username and user.password
 *     });
 */
Cypress.Commands.add('getUserForMigration', (userType: UpgradeUserType) => {
  const users = usersForMigration[userType];

  if (!users?.length) {
    throw new Error('There are no unlinked users available for testing!');
  }

  function getAvailableUser(index: number) {
    if (index === users.length) {
      throw new Error('There are no unlinked users available for testing!');
    }
    cy.wait(200);
    cy.requestGet<PlatformItemsResponse<PlatformUser>>(
      gatewayAPI`/users?username=${users[index]?.username}`
    ).then((result) => {
      const platformUser = result.results?.[0];
      if (platformUser?.last_login === null) {
        // This user has not been migrated yet and is available for testing upgrades
        return new Promise((resolve, _reject) => resolve(users[index]));
      } else {
        getAvailableUser(index + 1);
      }
    });
  }

  getAvailableUser(0);
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
    cy.requestDelete(gatewayAPI`/users/${user?.id.toString()}/`, options);
  }
);

/* This `Cypress.Commands.add('createPlatformTeam', ...)` function is a custom Cypress command that is
responsible for creating a new platform team. Here's a breakdown of what it does: */
Cypress.Commands.add('createPlatformTeam', function (platformTeam: Partial<PlatformTeam>) {
  const teamName = `Platform E2E Team-${randomString(3).toLowerCase()}`;
  cy.requestPost<Partial<PlatformTeam>>(gatewayAPI`/teams/`, {
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
      cy.requestDelete(gatewayAPI`/teams/${platformTeam.id.toString()}/`, options);
    }
  }
);
Cypress.Commands.add(
  'associateUsersWithPlatformOrganization', //
  (platformOrganization: PlatformOrganization, users: PlatformUser[]) => {
    cy.requestPost(
      gatewayAPI`/organizations/${platformOrganization.id.toString()}/users/associate/`,
      {
        instances: users.map((user) => user.id),
      }
    );
  }
);

Cypress.Commands.add(
  'associateUsersWithPlatformTeam',
  (platformTeam: PlatformTeam, users: PlatformUser[]) => {
    cy.requestPost(gatewayAPI`/teams/${platformTeam.id.toString()}/users/associate/`, {
      instances: users.map((user) => user.id),
    });
  }
);

/* The `Cypress.Commands.add('createGlobalPlatformOrganization', function () { ... })` function is a
custom Cypress command that is responsible for creating a global platform organization if it doesn't
already exist. Here's a breakdown of what it does: */
const GLOBAL_PLATFORM_ORG_NAME = 'Global Platform Level Organization';

Cypress.Commands.add('createGlobalPlatformOrganization', function () {
  cy.requestGet<PlatformOrganization>(gatewayAPI`/organizations?name=${GLOBAL_PLATFORM_ORG_NAME}`)
    .its('results')
    .then((platformOrgResults: PlatformOrganization[]) => {
      if (platformOrgResults.length === 0) {
        cy.requestPost<PlatformOrganization>(gatewayAPI`/organizations/`, {
          name: GLOBAL_PLATFORM_ORG_NAME,
        });
        cy.wait(100).then(() => cy.createGlobalPlatformOrganization());
      } else {
        cy.wrap(platformOrgResults[0]).as('globalPlatformOrganization');
      }
    });
});

Cypress.Commands.add(
  'createPlatformNotificationTemplate',
  function (notificationName: string, organization: PlatformOrganization) {
    cy.requestPost<
      Pick<
        NotificationTemplate,
        'name' | 'organization' | 'notification_type' | 'notification_configuration'
      >,
      NotificationTemplate
    >(awxAPI`/notification_templates/`, {
      name: notificationName ? notificationName : 'E2E Notification ' + randomString(4),
      organization: organization.id,
      notification_type: 'email',
      notification_configuration: {
        host: '127.0.0.1',
        port: 10,
        sender: 'sjdkfljdslf@jkdljfldjjfkjd.com',
        timeout: 30,
        use_ssl: false,
        use_tls: false,
        password: '',
        username: '',
        recipients: ['sdfdsfsdfsdfs'],
      },
    });
  }
);

Cypress.Commands.add(
  'deletePlatformNotificationTemplate',
  (
    notification: NotificationTemplate,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    cy.requestDelete(awxAPI`/notification_templates/${notification.id.toString()}/`, options);
  }
);

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

Cypress.Commands.add('getEdaOrgByAnsibleId', (ansibleId: string | undefined) => {
  if (!ansibleId) {
    throw new Error('ansibleId is required');
  }
  cy.poll(
    () =>
      cy.requestGet<EdaItemsResponse<EdaOrganization> | undefined>(
        edaAPI`/organizations/?resource__ansible_id=${ansibleId}`
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
        gatewayAPI`/organizations/?resource__ansible_id=${ansibleId}`
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

Cypress.Commands.add('getEdaTeamByAnsibleId', (ansibleId: string | undefined) => {
  if (!ansibleId) {
    throw new Error('ansibleId is required');
  }
  cy.poll(
    () =>
      cy.requestGet<EdaItemsResponse<EdaTeam> | undefined>(
        edaAPI`/teams/?resource__ansible_id=${ansibleId}`
      ),
    (results) => results.results.length > 0
  ).then((results) => {
    cy.wrap(results.results[0]);
  });
});

Cypress.Commands.add('getHubTeamByAnsibleId', (ansibleId: string | undefined) => {
  if (!ansibleId) {
    throw new Error('ansibleId is required');
  }
  cy.poll(
    () =>
      cy.requestGet<PulpItemsResponse<HubTeam> | undefined>(
        hubAPI`/_ui/v2/teams/?resource__ansible_id=${ansibleId}`
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
        gatewayAPI`/teams/?resource__ansible_id=${ansibleId}`
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

Cypress.Commands.add('getEdaUserByAnsibleId', (ansibleId: string | undefined) => {
  if (!ansibleId) {
    throw new Error('ansibleId is required');
  }
  cy.poll(
    () =>
      cy.requestGet<EdaItemsResponse<EdaUser> | undefined>(
        edaAPI`/users/?resource__ansible_id=${ansibleId}`
      ),
    (results) => results.results.length > 0
  ).then((results) => {
    cy.wrap(results.results[0]);
  });
});

Cypress.Commands.add('getHubUserByAnsibleId', (ansibleId: string | undefined) => {
  if (!ansibleId) {
    throw new Error('ansibleId is required');
  }
  cy.poll(
    () =>
      cy.requestGet<PulpItemsResponse<HubUser> | undefined>(
        hubAPI`/_ui/v2/users/?resource__ansible_id=${ansibleId}`
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
        gatewayAPI`/users/?resource__ansible_id=${ansibleId}`
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
    >(gatewayAPI`/applications/`, {
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
  const url = gatewayAPI`/tokens/`;
  const body = { ...aapToken };

  return cy.requestPost<Token>(url, body);
});

Cypress.Commands.add('getCurrentPlatformUser', () => {
  cy.requestGet<PlatformItemsResponse<PlatformUser>>(gatewayAPI`/me/`)
    .its('results')
    .then((results) => {
      return results[0];
    });
});

Cypress.Commands.add('checkLinkedButton', (text) => {
  cy.get('[class="pf-v5-c-form"]').within(() => {
    cy.contains('div', text).parent().parent().contains('button', 'Linked').should('be.visible');
  });
});

Cypress.Commands.add('clickOnLinkAccount', (text) => {
  cy.get('[class="pf-v5-c-form"]').within(() => {
    cy.contains('div', text)
      .parent()
      .parent()
      .contains('button', 'Link')
      .should('be.visible')
      .click();
  });
});
