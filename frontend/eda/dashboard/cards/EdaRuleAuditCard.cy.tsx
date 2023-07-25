import { RouteObj } from '../../../Routes';
import { EdaDashboard } from '../EdaDashboard';
import { API_PREFIX } from '../../constants';

describe('EdaRuleAuditCard.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/projects/*` },
      {
        count: 1,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            name: 'Project 1',
            description: '',
            credential_id: null,
            id: 2,
            url: 'https://github.com/ansible/ansible-ui',
            git_hash: '97de22df481212ebf5a5bec3743b950552cbb0d9',
            import_state: 'completed',
            import_error: null,
            import_task_id: 'f9febd7f-31fb-412a-a94f-04be54a7f0fb',
            created_at: '2023-06-21T14:13:33.700461Z',
            modified_at: '2023-06-21T14:13:35.067001Z',
          },
        ],
      }
    );

    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/activations/*` },
      {
        count: 0,
        results: [],
      }
    );
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/decision-environments/*` },
      {
        count: 0,
        results: [],
      }
    );
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/audit-rules/*` },
      {
        count: 1,
        next: '/api/eda/v1/audit-rules/?page=2&page_size=10&page_size=10',
        previous: null,
        page_size: 10,
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

    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/audit-rules/` },
      {
        count: 1,
        next: '/api/eda/v1/audit-rules/?page=2&page_size=10&page_size=10',
        previous: null,
        page_size: 10,
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
    cy.mount(<EdaDashboard />, {
      path: RouteObj.EdaDashboard,
      initialEntries: [RouteObj.EdaDashboard],
    });
  });
  it('Dashboard renders the correct rule audit columns', () => {
    cy.contains(/^Recently fired rules$/).should('be.visible');
    cy.contains('th', 'Name');
    cy.contains('th', 'Status');
    cy.contains('th', 'Fired date');
  });
});
