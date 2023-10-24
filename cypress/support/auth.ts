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

Cypress.Commands.add('login', (server: string, username: string, password: string) => {
  window.localStorage.setItem('theme', 'light');
  window.localStorage.setItem('disclaimer', 'true');

  cy.visit(`/login`, {
    retryOnStatusCodeFailure: true,
    retryOnNetworkFailure: true,
  });
  cy.get('[data-cy="username"]').type(username, { log: false, delay: 100 });
  cy.get('[data-cy="password"]').type(password, { log: false });
  cy.get('[data-cy="Submit"]').click();
});

Cypress.Commands.add('awxLogin', () => {
  cy.requiredVariablesAreSet(['AWX_SERVER', 'AWX_USERNAME', 'AWX_PASSWORD']);
  cy.session(
    'AWX',
    () => {
      cy.login(
        Cypress.env('AWX_SERVER') as string,
        Cypress.env('AWX_USERNAME') as string,
        Cypress.env('AWX_PASSWORD') as string
      );
      window.localStorage.setItem('hide-welcome-message', 'true');
      cy.get('[data-cy="nav-toggle"]').should('exist');
    },
    {
      validate: () => {
        cy.request({ method: 'GET', url: '/api/v2/me' });
      },
      cacheAcrossSpecs: true,
    }
  );
  cy.visit(`/ui_next`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
});

Cypress.Commands.add('edaLogin', () => {
  cy.requiredVariablesAreSet(['EDA_SERVER', 'EDA_USERNAME', 'EDA_PASSWORD']);
  cy.session(
    'EDA',
    () => {
      cy.login(
        Cypress.env('EDA_SERVER') as string,
        Cypress.env('EDA_USERNAME') as string,
        Cypress.env('EDA_PASSWORD') as string
      );
      cy.verifyPageTitle('Welcome to');
    },
    {
      cacheAcrossSpecs: true,
      validate: () => {
        cy.request({ method: 'GET', url: '/api/eda/v1/users/me/' });
      },
    }
  );
  cy.visit(`/eda`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
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
      cy.login(
        Cypress.env('HUB_SERVER') as string,
        Cypress.env('HUB_USERNAME') as string,
        Cypress.env('HUB_PASSWORD') as string
      );
      cy.verifyPageTitle('Welcome to');
    },
    {
      cacheAcrossSpecs: true,
      validate: () => {
        cy.request({ method: 'GET', url: 'api/automation-hub/_ui/v1/me/' });
      },
    }
  );
  cy.visit(`/`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
});
