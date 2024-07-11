import { awxAPI } from './formatApiPathForAwx';
import { edaAPI } from './formatApiPathForEDA';
import { hubAPI } from './formatApiPathForHub';

Cypress.Commands.add('requiredVariablesAreSet', (requiredVariables: string[]) => {
  if (Cypress.env('IS_GITHUB_ACTION') || process.env.IS_GITHUB_ACTION) {
    cy.log('Skipping requiredVariablesAreSet check in GitHub Actions');
    return;
  }
  requiredVariables.forEach((variable) => {
    if (!Cypress.env(variable)) {
      throw new Error(`Missing required environment variable: ${variable}`);
    }
  });
});

Cypress.Commands.add('login', () => {
  const devBaseUrlPort = Cypress.config().baseUrl?.split(':').slice(-1).toString();
  switch (devBaseUrlPort) {
    case '4101':
      cy.awxLogin();
      cy.createGlobalOrganization();
      cy.createGlobalProject();
      break;
    case '4102':
      cy.hubLogin();
      break;
    case '4103':
      cy.edaLogin();
      break;
  }
});

Cypress.Commands.add('logout', () => {
  const devBaseUrlPort = Cypress.config().baseUrl?.split(':').slice(-1).toString();
  switch (devBaseUrlPort) {
    case '4101':
      cy.awxLogout();
      break;
    case '4102':
      cy.hubLogout();
      break;
    case '4103':
      cy.edaLogout();
      break;
  }
});

Cypress.Commands.add('awxLogin', () => {
  cy.requiredVariablesAreSet(['AWX_SERVER', 'AWX_USERNAME', 'AWX_PASSWORD']);
  cy.session(
    'AWX',
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
      cy.get('#pf-login-username-id').type(Cypress.env('AWX_USERNAME') as string, {
        delay: 0,
        force: true,
      });
      cy.get('#pf-login-password-id').type(Cypress.env('AWX_PASSWORD') as string, {
        delay: 0,
        force: true,
      });
      cy.contains('button', 'Log in').click();
      cy.get('[data-cy="nav-toggle"]').should('exist');
    },
    {
      validate: () => {
        cy.request({ method: 'GET', url: awxAPI`/me` });
      },
      cacheAcrossSpecs: true,
    }
  );
  cy.visit(`/`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
});

Cypress.Commands.add('awxLoginTestUser', (username: string, password: string) => {
  cy.awxLogout();
  cy.requiredVariablesAreSet(['AWX_SERVER']);
  cy.session(
    'AWX_TEST_USER',
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
      cy.wait(1000);
      cy.get('#pf-login-username-id').type(username, { force: true, delay: 100 });
      cy.get('#pf-login-password-id').type(password, { force: true, delay: 100 });
      cy.contains('button', 'Log in').click();
      cy.get('[data-cy="nav-toggle"]').should('exist');
    },
    {
      validate: () => {
        cy.request({ method: 'GET', url: awxAPI`/me` });
      },
      cacheAcrossSpecs: true,
    }
  );
  cy.visit(`/`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
});

Cypress.Commands.add('awxLogout', () => {
  cy.getByDataCy('account-menu')
    .click()
    .then(() => {
      cy.intercept('GET', `/api/logout/`).as('logout');
      cy.get('ul>li>a').contains('Logout').click();
      cy.wait('@logout');
      cy.then(Cypress.session.clearAllSavedSessions);
    });
});

Cypress.Commands.add('edaLogin', (username?: string, password?: string) => {
  cy.requiredVariablesAreSet(['EDA_SERVER', 'EDA_USERNAME', 'EDA_PASSWORD']);
  const userName = username ?? (Cypress.env('EDA_USERNAME') as string);
  cy.session(
    `EDA-${userName}`,
    () => {
      window.localStorage.setItem('default-nav-expanded', 'true');
      cy.visit(`/`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
      cy.contains('Log in');
      cy.wait(1); // Seems like sometimes when the page first comes up that the login form is not ready
      cy.get('#pf-login-username-id').type(userName, { force: true, delay: 0 });
      cy.get('#pf-login-password-id').type(password ?? (Cypress.env('EDA_PASSWORD') as string), {
        force: true,
        delay: 0,
      });
      cy.contains('button', 'Log in').click();
      cy.verifyPageTitle('Welcome to');
    },
    {
      cacheAcrossSpecs: true,
      validate: () => {
        cy.request({ method: 'GET', url: edaAPI`/users/me/` });
      },
    }
  );
  cy.visit(`/`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
});

Cypress.Commands.add('edaLogout', () => {
  cy.get('.pf-v5-c-dropdown__toggle')
    .eq(1)
    .click()
    .then(() => {
      cy.intercept('POST', edaAPI`/auth/session/logout/`).as('logout');
      cy.get('ul>li>a').contains('Logout').click();
      cy.wait('@logout');
      cy.then(Cypress.session.clearAllSavedSessions);
    });
});

Cypress.Commands.add('hubLogin', () => {
  cy.requiredVariablesAreSet(['HUB_SERVER', 'HUB_USERNAME', 'HUB_PASSWORD']);
  cy.session(
    'HUB',
    () => {
      window.localStorage.setItem('default-nav-expanded', 'true');
      cy.visit(`/`, {
        retryOnStatusCodeFailure: true,
        retryOnNetworkFailure: true,
      });
      cy.contains('Log in');
      cy.wait(1); // Seems like sometimes when the page first comes up that the login form is not ready
      cy.get('#pf-login-username-id').type(Cypress.env('HUB_USERNAME') as string, {
        delay: 0,
        force: true,
      });
      cy.get('#pf-login-password-id').type(Cypress.env('HUB_PASSWORD') as string, {
        delay: 0,
        force: true,
      });
      cy.contains('button', 'Log in').click();
      cy.verifyPageTitle('Welcome to');
    },
    {
      cacheAcrossSpecs: true,
      validate: () => {
        cy.request({ method: 'GET', url: hubAPI`/_ui/v1/me/` });
      },
    }
  );
  cy.visit(`/`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
});

Cypress.Commands.add('hubLogout', () => {
  cy.get('.pf-v5-c-dropdown__toggle')
    .eq(1)
    .click()
    .then(() => {
      cy.intercept('POST', hubAPI`/_ui/v1/auth/logout/`).as('logout');
      cy.get('ul>li>a').contains('Logout').click();
      cy.wait('@logout');
      cy.then(Cypress.session.clearAllSavedSessions);
    });
});
