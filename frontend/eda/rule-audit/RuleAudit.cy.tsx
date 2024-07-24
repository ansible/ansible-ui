import { edaAPI } from '../common/eda-utils';
import { RuleAudit } from './RuleAudit';

describe('RuleAudit.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/audit-rules/?page=1&page_size=10` },
      {
        fixture: 'edaRuleAudit.json',
      }
    );

    cy.intercept(
      { method: 'GET', url: edaAPI`/audit-rules/?page=2&page_size=10` },
      {
        count: 5,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            id: 99,
            name: 'Say Hello from ruleset 1',
            status: 'successful',
            activation_instance: {
              id: null,
              name: 'DELETED',
            },
            fired_at: '2023-10-31T13:45:31.576578Z',
          },
          {
            id: 98,
            name: 'Say Hello from ruleset 2',
            status: 'successful',
            activation_instance: {
              id: 59,
              name: 'Activation 4',
            },
            fired_at: '2023-10-31T13:45:30.941856Z',
          },
          {
            id: 97,
            name: 'Say Hello from ruleset 1',
            status: 'successful',
            activation_instance: {
              id: 59,
              name: 'Activation 4',
            },
            fired_at: '2023-10-31T13:45:30.935965Z',
          },
          {
            id: 96,
            name: 'Say Hello from ruleset 2',
            status: 'successful',
            activation_instance: {
              id: null,
              name: 'DELETED',
            },
            fired_at: '2023-10-30T21:58:30.575558Z',
          },
          {
            id: 95,
            name: 'Say Hello from ruleset 1',
            status: 'successful',
            activation_instance: {
              id: null,
              name: 'DELETED',
            },
            fired_at: '2023-10-30T21:58:30.570726Z',
          },
        ],
      }
    );
  });

  it('Renders the correct rule audit columns', () => {
    cy.mount(<RuleAudit />);
    cy.get('h1').should('contain', 'Rule Audit');
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.contains(
      /^Rule audit allows for monitoring and reviewing the execution of defined rules which have been triggered by incoming events.$/
    ).should('be.visible');
    cy.get('[data-cy="name-column-header"]').should('contain', 'Name');
    cy.get('[data-cy="status-column-header"]').should('contain', 'Status');
    cy.get('[data-cy="rulebook-activation-column-header"]').should(
      'contain',
      'Rulebook activation'
    );
    cy.get('[data-cy="fired-date-column-header"]').should('contain', 'Fired date');
  });
});

describe('Empty list', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/audit-rules/*`,
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<RuleAudit />);
    cy.contains(/^There is currently no rule audit data for your organization.$/);
    cy.contains(/^Rule audit data will populate once a rulebook activation runs.$/);
  });
});
