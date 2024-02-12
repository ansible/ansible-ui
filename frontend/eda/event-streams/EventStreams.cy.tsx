import { edaAPI } from '../common/eda-utils';
import { EventStreams } from './EventStreams';

describe('EventStreams.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/event-streams/?page=1&page_size=10` },
      {
        fixture: 'edaEventStreams.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/event-streams/?page=2&page_size=10` },
      {
        count: 2,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            name: 'Ev11',
            source_args: 'payload:\n- i: 1\n- i: 2\n- name: Fred\nstartup_delay: 60\n',
            source_type: 'ansible.eda.generic',
            channel_name: 'eda_155678ed_fdc0_4c9d_b69d_4e974de90c6a',
            is_enabled: true,
            status: 'completed',
            status_message:
              'Pod activation-job-1-1 has successfully exited. Activation completed successfully. No restart policy is applied.',
            decision_environment_id: 1,
            user: 'admin',
            credentials: [],
            id: 11,
            created_at: '2024-02-12T17:43:46.439835Z',
            modified_at: '2024-02-12T17:44:55.307697Z',
          },
          {
            name: 'Ev12',
            source_args: 'payload:\n- i: 1\n- i: 2\n- name: Fred\nstartup_delay: 60\n',
            source_type: 'ansible.eda.generic',
            channel_name: 'eda_155678ed_fdc0_4c9d_b69d_4e974de90c6a',
            is_enabled: true,
            status: 'completed',
            status_message:
              'Pod activation-job-1-1 has successfully exited. Activation completed successfully. No restart policy is applied.',
            decision_environment_id: 1,
            user: 'admin',
            credentials: [],
            id: 12,
            created_at: '2024-02-12T17:43:46.439835Z',
            modified_at: '2024-02-12T17:44:55.307697Z',
          },
        ],
      }
    );
  });

  it('Renders the correct event streams columns', () => {
    cy.mount(<EventStreams />);
    cy.get('h1').should('contain', 'Event Streams');
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.contains(/^Event streams.$/).should('be.visible');
    cy.get('[data-cy="id-column-header"]').should('be.visible');
    cy.get('[data-cy="name-column-header"]').should('be.visible');
    cy.get('[data-cy="status-column-header"]').should('be.visible');
    cy.get('[data-cy="source-type-column-header"]').should('be.visible');
    cy.get('#expand-toggle0 > .pf-v5-c-table__toggle-icon').click();
    cy.get('[data-cy="created"]').should('be.visible');
    cy.get('[data-cy="last-modified"]').should('be.visible');
  });

  it('can restart an event stream from the line item in list view', () => {
    cy.mount(<EventStreams />);
    cy.get('[data-cy="row-id-1"] > [data-cy="checkbox-column-cell"]').click();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="restart-selected-event-streams"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to restart these`
      );
      cy.contains('Event stream 1');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Restart event streams').click();
    });
    cy.clickButton(/^Close$/);
  });

  it('can disable an event stream from the line item in list view', () => {
    cy.mount(<EventStreams />);
    cy.intercept({ method: 'POST', url: edaAPI`/event-streams/2/disable/` });
    cy.get('[data-cy="row-id-1"] > [data-cy="checkbox-column-cell"]').click();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="disable-selected-event-streams"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to disable these`
      );
      cy.contains('Event stream 1');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Disable event streams').click();
    });
    cy.clickButton(/^Close$/);
  });

  it('can delete an event stream from the line item in list view', () => {
    cy.mount(<EventStreams />);
    cy.intercept({ method: 'POST', url: edaAPI`/event-streams/2/delete/` });
    cy.get('[data-cy="row-id-1"] > [data-cy="checkbox-column-cell"]').click();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="delete-selected-event-streams"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to delete these`
      );
      cy.contains('Event stream 1');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Delete event streams').click();
    });
    cy.clickButton(/^Close$/);
  });
});

describe('Empty list', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/event-streams/*`,
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<EventStreams />);
    cy.contains(/^There are currently no event streams created for your organization.$/);
    cy.contains(/^Please create a event stream by using the button below.$/);
    cy.contains('button', /^Create event stream$/).should('be.visible');
  });
});
