import { API_PREFIX } from '../constants';
import { RulebookActivations } from './RulebookActivations';

describe('RulebookActivations.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/activations/?page=1&page_size=10` },
      {
        fixture: 'edaRulebookActivations.json',
      }
    );

    cy.intercept(
      { method: 'GET', url: `${API_PREFIX}/activations/?page=2&page_size=10` },
      {
        count: 5,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            id: 11,
            name: 'Activation 11',
            description: '',
            is_enabled: true,
            status: 'completed',
            decision_environment_id: 1,
            project_id: 1,
            rulebook_id: 2,
            extra_var_id: null,
            restart_policy: 'on-failure',
            restart_count: 0,
            rulebook_name: 'test.yml',
            current_job_id: null,
            rules_count: 1,
            rules_fired_count: 1,
            created_at: '2023-10-02T13:34:18.445029Z',
            modified_at: '2023-10-02T13:34:28.742952Z',
          },
          {
            id: 11,
            name: 'Activation 11',
            description: '',
            is_enabled: true,
            status: 'completed',
            decision_environment_id: 1,
            project_id: 1,
            rulebook_id: 2,
            extra_var_id: null,
            restart_policy: 'on-failure',
            restart_count: 0,
            rulebook_name: 'test.yml',
            current_job_id: null,
            rules_count: 1,
            rules_fired_count: 1,
            created_at: '2023-10-02T13:34:18.445029Z',
            modified_at: '2023-10-02T13:34:28.742952Z',
          },
          {
            id: 12,
            name: 'Activation 12',
            description: '',
            is_enabled: true,
            status: 'completed',
            decision_environment_id: 1,
            project_id: 1,
            rulebook_id: 2,
            extra_var_id: null,
            restart_policy: 'on-failure',
            restart_count: 0,
            rulebook_name: 'test.yml',
            current_job_id: null,
            rules_count: 1,
            rules_fired_count: 1,
            created_at: '2023-10-02T13:34:18.445029Z',
            modified_at: '2023-10-02T13:34:28.742952Z',
          },
          {
            id: 12,
            name: 'Activation 12',
            description: '',
            is_enabled: true,
            status: 'completed',
            decision_environment_id: 1,
            project_id: 1,
            rulebook_id: 2,
            extra_var_id: null,
            restart_policy: 'on-failure',
            restart_count: 0,
            rulebook_name: 'test.yml',
            current_job_id: null,
            rules_count: 1,
            rules_fired_count: 1,
            created_at: '2023-10-02T13:34:18.445029Z',
            modified_at: '2023-10-02T13:34:28.742952Z',
          },
        ],
      }
    );
  });

  it('Renders the correct rulebook activations columns', () => {
    cy.mount(<RulebookActivations />);
    cy.get('h1').should('contain', 'Rulebook Activations');
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.contains(/^Rulebook activations are rulebooks that have been activated to run.$/).should(
      'be.visible'
    );
    cy.contains('th', 'Activation ID');
    cy.contains('th', 'Name');
    cy.contains('th', 'Activation status');
    cy.contains('th', 'Number of rules');
    cy.contains('th', 'Fire count');
    cy.contains('th', 'Restart count');
  });
});

describe('Empty list', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: `${API_PREFIX}/activations/*`,
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<RulebookActivations />);
    cy.contains(/^There are currently no rulebook activations created for your organization.$/);
    cy.contains(/^Please create a rulebook activation by using the button below.$/);
    cy.contains('button', /^Create rulebook activation$/).should('be.visible');
  });
});
