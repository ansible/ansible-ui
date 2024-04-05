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
      cy.getBy('[data-cy="username"]').type(Cypress.env('AWX_USERNAME') as string, {
        log: false,
        delay: 0,
      });
      cy.getBy('[data-cy="password"]').type(Cypress.env('AWX_PASSWORD') as string, {
        log: false,
        delay: 0,
      });
      cy.get('[data-cy="Submit"]').click();
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

Cypress.Commands.add('edaLogin', () => {
  cy.requiredVariablesAreSet(['EDA_SERVER', 'EDA_USERNAME', 'EDA_PASSWORD']);
  cy.session(
    'EDA',
    () => {
      window.localStorage.setItem('default-nav-expanded', 'true');
      cy.visit(`/`, {
        retryOnStatusCodeFailure: true,
        retryOnNetworkFailure: true,
      });
      cy.getBy('[data-cy="username"]').type(Cypress.env('EDA_USERNAME') as string, {
        log: false,
        delay: 0,
      });
      cy.getBy('[data-cy="password"]').type(Cypress.env('EDA_PASSWORD') as string, {
        log: false,
        delay: 0,
      });
      cy.get('[data-cy="Submit"]').click();
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
      cy.get('ul>li>a').contains('Logout').click();
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
      cy.getBy('[data-cy="username"]').type(Cypress.env('HUB_USERNAME') as string, {
        log: false,
        delay: 0,
      });
      cy.getBy('[data-cy="password"]').type(Cypress.env('HUB_PASSWORD') as string, {
        log: false,
        delay: 0,
      });
      cy.get('[data-cy="Submit"]').click();
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
