import { EventStreamActivations } from './EventStreamActivations';
import { edaAPI } from '../../common/eda-utils';

describe('EventStreamActivations.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/event-streams/1/activations/*` },
      {
        fixture: 'edaRulebookActivations.json',
      }
    );
    cy.intercept(
      {
        method: 'OPTIONS',
        url: edaAPI`/activations/*`,
      },
      {
        fixture: 'edaRulebookActivationOptions.json',
      }
    ).as('activationsOptions');
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/activations/*`,
      },
      {
        fixture: 'edaRulebookActivations.json',
      }
    ).as('activations');
    cy.intercept(
      { method: 'GET', url: edaAPI`/event-streams/1/activations/?page=2&page_size=10` },
      {
        count: 5,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            name: 'E2E Activation N0vX',
            description: 'E2E Activation N0vX',
            id: 8,
            created_at: '2023-07-28T18:29:28.512273Z',
            modified_at: '2023-07-28T18:29:28.512286Z',
          },
          {
            name: 'E2E Activation aOHl',
            description: 'E2E Activation aOHl',
            id: 11,
            created_at: '2023-07-28T18:32:34.992501Z',
            modified_at: '2023-07-28T18:32:34.992522Z',
          },
          {
            name: 'E2E Activation kpub',
            description: 'E2E Activation kpub.',
            id: 13,
            created_at: '2023-07-28T18:32:51.739715Z',
            modified_at: '2023-07-28T18:32:51.739740Z',
          },
          {
            name: 'E2E Activation ZFca',
            description: 'E2E Activation ZFca',
            id: 30,
            created_at: '2023-07-28T19:28:01.687027Z',
            modified_at: '2023-07-28T19:28:01.687040Z',
          },
          {
            name: 'E2E Activation Y315',
            description: 'E2E Activation Y315',
            id: 31,
            created_at: '2023-07-28T19:28:01.767198Z',
            modified_at: '2023-07-28T19:28:01.767210Z',
          },
        ],
      }
    );
  });

  it('Renders the correct activations columns', () => {
    cy.mount(<EventStreamActivations />);
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.contains('th', 'Name');
    cy.contains('th', 'Status');
  });
});

describe('Empty list', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/event-streams/1/activations/*`,
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });

  it('Empty state is displayed correctly', () => {
    cy.mount(<EventStreamActivations />);
    cy.contains(/^No activations for this event stream$/);
  });
});
