import { lightspeedAPI } from '../../support/formatApiPathForLightspeed';

describe('The Chatbot is enabled', () => {
  before(() => {
    // check lightspeed integration by invoking the /health/ endpoint
    let lightspeedHeathStatusMocked: boolean = false;
    cy.request({ method: 'GET', url: lightspeedAPI`/health/`, failOnStatusCode: false }).then(
      (response) => {
        if (response.status === 404) {
          // lightspeed integration not detected, mock by intercepting the /health/status/ endpoint request
          cy.intercept('GET', lightspeedAPI`/health/status/`, {
            statusCode: 200,
            body: {
              status: 'ok',
              dependencies: [
                { name: 'chatbot-service', status: { provider: 'http', models: 'ok' } },
              ],
            },
          }).as('getLightspeedHealthStatus');
          lightspeedHeathStatusMocked = true;
        }
      }
    );

    cy.navigateTo('platform', 'overview');
    if (lightspeedHeathStatusMocked) {
      cy.wait('@getLightspeedHealthStatus');
    }
  });

  it('should display the Chatbot, add a question and hide', () => {
    // show the chatbot
    cy.get('[data-cy="chatbot-badge"]').should('be.visible').click();
    // ensure the chatbot iframe is displayed
    cy.get('iframe[title="Ansible Chatbot IFrame"]')
      .should('exist')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      // eslint-disable-next-line @typescript-eslint/unbound-method
      .then(cy.wrap)
      .find('textarea[aria-label="Send a message..."]')
      // add a question to chatbot
      .type('what is ansible?');

    // hide the chatbot
    cy.get('[data-cy="chatbot-badge"]').should('be.visible').click();
    cy.get('iframe[title="Ansible Chatbot IFrame"]').should('not.exist');
  });
});

describe('The Chatbot is disabled', () => {
  it('should not display the Chatbot badge', () => {
    cy.intercept('GET', lightspeedAPI`/health/status/`, {
      statusCode: 200,
      body: {
        status: 'ok',
        dependencies: [{ name: 'chatbot-service', status: 'disabled' }],
      },
    }).as('getLightspeedHealthStatus');
    cy.navigateTo('platform', 'overview');
    cy.wait('@getLightspeedHealthStatus');
    cy.get('[data-cy="chatbot-badge"]').should('not.exist');
  });
});

describe('Lightspeed is not accessible', () => {
  it('should not display the Chatbot badge', () => {
    cy.intercept('GET', lightspeedAPI`/health/status/`, {
      statusCode: 404,
      body: 'path not found',
    }).as('getLightspeedHealthStatus');
    cy.navigateTo('platform', 'overview');
    cy.wait('@getLightspeedHealthStatus');
    cy.get('[data-cy="chatbot-badge"]').should('not.exist');
  });
});
