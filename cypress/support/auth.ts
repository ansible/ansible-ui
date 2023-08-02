import { randomString } from '../../framework/utils/random-string';
import { AutomationServerType } from '../../frontend/automation-servers/AutomationServer';

Cypress.Commands.add(
  'login',
  (server: string, username: string, password: string, serverType: AutomationServerType) => {
    window.localStorage.setItem('theme', 'light');
    window.localStorage.setItem('disclaimer', 'true');

    if (Cypress.env('TEST_STANDALONE') === true) {
      if (serverType === AutomationServerType.EDA) {
        // Standalone EDA login
        cy.visit(`/login`, {
          retryOnStatusCodeFailure: true,
          retryOnNetworkFailure: true,
        });
        cy.typeInputByLabel(/^Username$/, username);
        cy.typeInputByLabel(/^Password$/, password);
        cy.get('button[type=submit]').click();
        return;
      } else if (serverType === AutomationServerType.AWX) {
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
    const automationServerName = 'E2E ' + randomString(4);
    cy.getDialog().within(() => {
      cy.typeInputByLabel(/^Name$/, automationServerName);
      cy.typeInputByLabel(/^Url$/, server);
      switch (serverType) {
        case AutomationServerType.AWX:
          cy.selectDropdownOptionByLabel(/^Automation type$/, 'AWX Ansible Server');
          break;
        case AutomationServerType.EDA:
          cy.selectDropdownOptionByLabel(/^Automation type$/, 'Event Driven Automation Server');
          break;
        default:
          cy.selectDropdownOptionByLabel(/^Automation type$/, 'AWX Ansible Server');
      }
      cy.get('button[type=submit]').click();
    });

    cy.contains('a', automationServerName).click();
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
        AutomationServerType.AWX
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
        AutomationServerType.EDA
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
