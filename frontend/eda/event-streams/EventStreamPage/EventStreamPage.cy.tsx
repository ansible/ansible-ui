/* eslint-disable i18next/no-literal-string */

import { EventStreamPage } from './EventStreamPage';

describe('EventStreamPage', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '/api/eda/v1/event-streams/1/' },
      { fixture: 'edaDisabledEventStream.json' }
    );
    cy.intercept(
      { method: 'GET', url: '/api/eda/v1/event-streams/5/' },
      { fixture: 'edaEnabledEventStream.json' }
    );
    cy.intercept('POST', '/api/eda/v1/event-streams/1/enable/', (req) => {
      return req.reply({ statusCode: 204 });
    }).as('enableEventStream');
  });

  it('Component renders and displays the event stream', () => {
    cy.intercept(
      { method: 'GET', url: '/api/eda/v1/event-streams/1/' },
      { fixture: 'edaDisabledEventStream.json' }
    );
    cy.mount(<EventStreamPage />);
    cy.get('h1').should('have.text', 'Event stream 1');
  });

  it('Can enable the event stream', () => {
    cy.intercept(
      { method: 'GET', url: '/api/eda/v1/event-streams/1/' },
      { fixture: 'edaDisabledEventStream.json' }
    );
    cy.intercept(
      { method: 'GET', url: '/api/eda/v1/event-streams/1/*' },
      { fixture: 'edaDisabledEventStream.json' }
    );
    cy.intercept('POST', '/api/eda/v1/event-streams/1/enable/', (req) => {
      return req.reply({ statusCode: 204 });
    }).as('enableEventStream');

    cy.mount(<EventStreamPage />);
    cy.get('.pf-v5-c-switch__toggle').click();
    cy.wait('@enableEventStream');
    cy.get('.pf-v5-c-alert__title').should('contain', 'Event stream 1 enabled');
  });

  it('Can disable the event stream', () => {
    cy.intercept('POST', '/api/eda/v1/event-streams/5/disable/', (req) => {
      return req.reply({ statusCode: 204 });
    }).as('disableEventStream');

    cy.mount(<EventStreamPage />, { path: '/:id/*', initialEntries: ['/5'] });

    cy.get('.pf-v5-c-switch__toggle').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to disable these 1 event streams.`
      );
      cy.get('td').should('contain', 'Event stream 2');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Disable event streams').click();
      cy.get('td').should('contain', 'Success');
    });
  });

  it('Should render all the tabs', () => {
    const tabNames: string[] = ['Back to Event Streams', 'Details', 'History'];
    cy.mount(<EventStreamPage />);

    cy.get('.pf-v5-c-tabs__list').within(() => {
      cy.get('.pf-v5-c-tabs__item').should('have.length', 3);
      cy.get('.pf-v5-c-tabs__item').each((tab, index) => {
        cy.wrap(tab).should('contain', tabNames[index]);
      });
    });
  });
});
