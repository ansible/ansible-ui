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

Cypress.Commands.add('login', (username: string, password: string) => {
  window.localStorage.setItem('theme', 'light');
  window.localStorage.setItem('disclaimer', 'true');

  cy.visit(`/login`, {
    retryOnStatusCodeFailure: true,
    retryOnNetworkFailure: true,
  });
  cy.get('[data-cy="username"]').type(username);
  cy.get('[data-cy="password"]').type(password);
  cy.get('button[type=submit]').click();
});

Cypress.Commands.add('edaLogout', () => {
  cy.get('.pf-c-dropdown__toggle')
    .eq(1)
    .click()
    .then(() => {
      cy.get('ul>li>a').contains('Logout').click();
    });
});

Cypress.Commands.add('awxLogin', () => {
  cy.requiredVariablesAreSet(['AWX_SERVER', 'AWX_USERNAME', 'AWX_PASSWORD']);
  cy.session(
    'AWX',
    () => {
      cy.login(Cypress.env('AWX_USERNAME') as string, Cypress.env('AWX_PASSWORD') as string);
      cy.wait(5000);
      window.localStorage.setItem('hide-welcome-message', 'true');
    },
    {
      validate() {
        cy.request({ method: 'GET', url: '/api/v2/me/' });
        cy.get('[data-cy="page-title"]').should('contain', 'Welcome to');
      },
      cacheAcrossSpecs: true,
    }
  );
  cy.visit(`/ui_next`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
});

Cypress.Commands.add('edaLogin', () => {
  cy.requiredVariablesAreSet(['EDA_USERNAME', 'EDA_PASSWORD']);
  cy.session(
    'EDA',
    () => {
      cy.login(Cypress.env('EDA_USERNAME') as string, Cypress.env('EDA_PASSWORD') as string);
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

Cypress.Commands.add('hubLogin', () => {
  cy.requiredVariablesAreSet(['HUB_SERVER', 'HUB_USERNAME', 'HUB_PASSWORD']);
  cy.session(
    'HUB',
    () => {
      cy.login(Cypress.env('HUB_USERNAME') as string, Cypress.env('HUB_PASSWORD') as string);
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
