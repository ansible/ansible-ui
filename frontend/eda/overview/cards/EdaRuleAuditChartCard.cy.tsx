import { edaAPI } from '../../common/eda-utils';
import { RuleAuditChart } from './EdaRuleAuditChartCard';

describe('EdaRuleAuditChart.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/audit-rules/*` },
      {
        count: 1,
        previous: null,
        page: 1,
        results: [
          {
            id: 3407,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
        ],
      }
    );
    cy.mount(<RuleAuditChart />);
  });

  it('Dashboard renders the rule audit graph for one successful run', () => {
    cy.contains(/^Rule Runs$/).should('be.visible');
    cy.get(':nth-child(1) > .ans__sc-vp55ln-5').should('contain', 'Success');
  });
});

describe('EdaRuleAuditChart.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/audit-rules/*` },
      {
        count: 24,
        previous: null,
        page: 1,
        results: [
          {
            id: 1,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 2,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 3,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 4,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 5,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 6,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 7,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 8,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 9,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 10,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 11,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 12,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 13,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 14,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 15,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 16,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 17,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 18,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 19,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 20,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 21,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 22,
            name: 'Say Hello',
            status: 'failed',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 23,
            name: 'Say Hello',
            status: 'successful',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
          {
            id: 24,
            name: 'Say Hello',
            status: 'failed',
            activation_instance: {
              id: 3421,
              name: 'Activation 1',
            },
            fired_at: '2023-06-16T15:12:31.857874Z',
          },
        ],
      }
    );
    cy.mount(<RuleAuditChart />);
  });

  it('Dashboard renders the rule audit graph for successful and failed runs', () => {
    cy.contains(/^Rule Audit$/).should('be.visible');
    cy.contains(/^Rule Runs$/).should('be.visible');
    cy.get(':nth-child(1) > .ans__sc-vp55ln-5').should('contain', 'Success');
    cy.get(':nth-child(2) > .ans__sc-vp55ln-5').should('contain', 'Failed');
  });
});
