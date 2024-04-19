import { edaAPI } from '../../common/eda-utils';
import { EdaOverview } from '../EdaOverview';

describe('EdaRulebookActivationsCard.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/projects/*` },
      {
        count: 0,
        results: [],
      }
    );

    cy.intercept(
      { method: 'GET', url: edaAPI`/activations/*` },
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
      { method: 'GET', url: edaAPI`/decision-environments/*` },
      {
        count: 0,
        results: [],
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/audit-rules/*` },
      {
        count: 0,
        results: [],
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/audit-rules/` },
      {
        count: 0,
        results: [],
      }
    );
    cy.mount(<EdaOverview />);
  });
  it('Dashboard renders the correct rulebook activations columns', () => {
    cy.contains(/^Recently updated rulebook activations$/).should('be.visible');
    cy.contains('th', 'Name');
    cy.contains('th', 'Status');
  });
});
