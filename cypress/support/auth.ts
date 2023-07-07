import { SERVER_TYPES } from './constants';

Cypress.Commands.add(
  'login',
  (server: string, username: string, password: string, serverType: string) => {
    window.localStorage.setItem('theme', 'light');
    window.localStorage.setItem('disclaimer', 'true');

    if (Cypress.env('TEST_STANDALONE') === true) {
      if (serverType === SERVER_TYPES.HUB_SERVER) {
        cy.visit(`/`, {
          retryOnStatusCodeFailure: true,
          retryOnNetworkFailure: true,
        });
        cy.typeInputByLabel(/^Username$/, username);
        cy.typeInputByLabel(/^Password$/, password);
        cy.get('button[type=submit]').click();
        return;
      }
      if (serverType === SERVER_TYPES.EDA_SERVER) {
        // Standalone EDA login
        cy.visit(`/login`, {
          retryOnStatusCodeFailure: true,
          retryOnNetworkFailure: true,
        });
        cy.typeInputByLabel(/^Username$/, username);
        cy.typeInputByLabel(/^Password$/, password);
        cy.get('button[type=submit]').click();
        return;
      } else if (serverType === SERVER_TYPES.AWX_SERVER) {
        // Standalone AWX login
        cy.visit(`/ui_next`, {
          retryOnStatusCodeFailure: true,
          retryOnNetworkFailure: true,
        });
        cy.typeInputByLabel(/^Username$/, username);
        cy.typeInputByLabel(/^Password$/, password);
        cy.get('button[type=submit]').click();
        cy.contains('a', 'Return to dashboard').click();
        return;
      }
    }

    cy.visit(`/automation-servers`, {
      retryOnStatusCodeFailure: true,
      retryOnNetworkFailure: true,
    });

    cy.clickButton(/^Add automation server$/);
    cy.typeInputByLabel(/^Name$/, 'E2E');
    cy.typeInputByLabel(/^Url$/, server);
    cy.get('.pf-c-select__toggle').click();
    cy.clickButton(serverType);
    cy.get('button[type=submit]').click();

    cy.contains('a', /^E2E$/).click();
    cy.typeInputByLabel(/^Username$/, username);
    cy.typeInputByLabel(/^Password$/, password);
    cy.get('button[type=submit]').click();
  }
);

Cypress.Commands.add('edaLogout', () => {
  cy.get('.pf-c-dropdown__toggle')
    .eq(1)
    .click()
    .then(() => {
      cy.get('ul>li>a').contains('Logout').click();
    });
});

Cypress.Commands.add('awxLogin', () => {
  cy.session(
    'AWX',
    () => {
      cy.login(
        Cypress.env('AWX_SERVER') as string,
        Cypress.env('AWX_USERNAME') as string,
        Cypress.env('AWX_PASSWORD') as string,
        SERVER_TYPES.AWX_SERVER
      );
      cy.hasTitle('Welcome to');
    },
    {
      cacheAcrossSpecs: true,
      validate: () => {
        cy.request({ method: 'GET', url: '/api/v2/me/' });
      },
    }
  );
  cy.visit(`/ui_next`, { retryOnStatusCodeFailure: true, retryOnNetworkFailure: true });
});

Cypress.Commands.add('edaLogin', () => {
  cy.session(
    'EDA',
    () => {
      cy.login(
        Cypress.env('EDA_SERVER') as string,
        Cypress.env('EDA_USERNAME') as string,
        Cypress.env('EDA_PASSWORD') as string,
        SERVER_TYPES.EDA_SERVER
      );
      cy.hasTitle('Welcome to');
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
  cy.session(
    'HUB',
    () => {
      cy.login(
        Cypress.env('HUB_SERVER') as string,
        Cypress.env('HUB_USERNAME') as string,
        Cypress.env('HUB_PASSWORD') as string,
        SERVER_TYPES.HUB_SERVER
      );
      cy.hasTitle('Welcome to');
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
