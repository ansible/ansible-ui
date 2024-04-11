/* eslint-disable i18next/no-literal-string */

import { RulebookActivationPage } from './RulebookActivationPage';

describe('RulebookActivationPage', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '/api/eda/v1/activations/1/' },
      { fixture: 'edaDisabledRulebookActivation.json' }
    );
    cy.intercept(
      { method: 'GET', url: '/api/eda/v1/activations/5/' },
      { fixture: 'edaEnabledRulebookActivation.json' }
    );
    cy.intercept('POST', '/api/eda/v1/activations/1/enable/', (req) => {
      return req.reply({ statusCode: 204 });
    }).as('enableActivation');
  });

  it('Component renders and displays the rulebook activation', () => {
    cy.intercept(
      { method: 'GET', url: '/api/eda/v1/activations/1/' },
      { fixture: 'edaDisabledRulebookActivation.json' }
    );
    cy.mount(<RulebookActivationPage />);
    cy.get('h1').should('have.text', 'Activation 1');
  });

  it('Can enable the rulebook activation', () => {
    cy.intercept(
      { method: 'GET', url: '/api/eda/v1/activations/1/' },
      { fixture: 'edaDisabledRulebookActivation.json' }
    );
    cy.intercept(
      { method: 'GET', url: '/api/eda/v1/activations/1/*' },
      { fixture: 'edaDisabledRulebookActivation.json' }
    );
    cy.intercept('POST', '/api/eda/v1/activations/1/enable/', (req) => {
      return req.reply({ statusCode: 204 });
    }).as('enableActivation');

    cy.mount(<RulebookActivationPage />);
    cy.get('.pf-v5-c-switch__toggle').click();
    cy.wait('@enableActivation');
    cy.get('.pf-v5-c-alert__title').should('contain', 'Activation 1 enabled');
  });

  it('Can disable the rulebook activation', () => {
    cy.intercept('POST', '/api/eda/v1/activations/5/disable/', (req) => {
      return req.reply({ statusCode: 204 });
    }).as('disableActivation');

    cy.mount(<RulebookActivationPage />, { path: '/:id/*', initialEntries: ['/5'] });

    cy.get('.pf-v5-c-switch__toggle').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to disable these 1 rulebook activation`
      );
      cy.get('td').should('contain', 'Activation 2');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Disable rulebook activations').click();
      cy.get('td').should('contain', 'Success');
    });
  });

  it('Should render all the tabs', () => {
    const tabNames: string[] = [
      'Back to Rulebook Activations',
      'Details',
      'History',
      'Team Access',
      'User Access',
    ];
    cy.mount(<RulebookActivationPage />);

    cy.get('.pf-v5-c-tabs__list').within(() => {
      cy.get('.pf-v5-c-tabs__item').should('have.length', 5);
      cy.get('.pf-v5-c-tabs__item').each((tab, index) => {
        cy.wrap(tab).should('contain', tabNames[index]);
      });
    });
  });
});
