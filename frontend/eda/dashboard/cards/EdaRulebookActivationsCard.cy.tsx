import { RouteObj } from '../../../Routes';
import { EdaDashboard } from '../EdaDashboard';
import { API_PREFIX } from '../../constants';

describe('EdaRulebookActivationsCard.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/projects/*` },
      {
        count: 0,
        results: [],
      }
    );

    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/activations/*` },
      {
        count: 1,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            id: 2,
            name: 'Activation 2',
            description: 'This is Activation 2',
            is_enabled: true,
            status: 'failed',
            decision_environment_id: 2,
            project_id: 2,
            rulebook_id: 15,
            extra_var_id: 1,
            restart_policy: 'always',
            restart_count: 0,
            rulebook_name: 'multi_ruleset.yml',
            rules_count: 0,
            rules_fired_count: 0,
            created_at: '2023-06-21T14:14:06.573532Z',
            modified_at: '2023-06-21T14:14:06.573544Z',
          },
        ],
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
        count: 0,
        results: [],
      }
    );
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/audit-rules/` },
      {
        count: 0,
        results: [],
      }
    );
    cy.mount(<EdaDashboard />, {
      path: RouteObj.EdaDashboard,
      initialEntries: [RouteObj.EdaDashboard],
    });
  });
  it('Dashboard renders the correct rulebook activations columns', () => {
    cy.contains(/^Recently updated activations$/).should('be.visible');
    cy.contains('th', 'Name');
    cy.contains('th', 'Activation status');
  });
});
