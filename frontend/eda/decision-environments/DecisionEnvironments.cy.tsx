import { edaAPI } from '../common/eda-utils';
import { DecisionEnvironments } from './DecisionEnvironments';

describe('DecisionEnvironments.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/decision-environments/?page=1&page_size=10` },
      {
        fixture: 'edaDecisionEnvironments.json',
      }
    );

    cy.intercept(
      { method: 'GET', url: edaAPI`/decision-environments/?page=2&page_size=10` },
      {
        count: 5,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            name: 'E2E DecisionEnvironment N0vX',
            description: 'This is a decision environment',
            username: 'admin',
            decisionEnvironment_type: 'Container Registry',
            id: 8,
            created_at: '2023-07-28T18:29:28.512273Z',
            modified_at: '2023-07-28T18:29:28.512286Z',
          },
          {
            name: 'E2E DecisionEnvironment aOHl',
            description: 'This is a decision environment',
            username: 'admin',
            decisionEnvironment_type: 'Container Registry',
            id: 11,
            created_at: '2023-07-28T18:32:34.992501Z',
            modified_at: '2023-07-28T18:32:34.992522Z',
          },
          {
            name: 'E2E DecisionEnvironment kpub',
            description: 'This is a decision environment.',
            username: 'admin',
            decisionEnvironment_type: 'GitHub Personal Access Token',
            id: 13,
            created_at: '2023-07-28T18:32:51.739715Z',
            modified_at: '2023-07-28T18:32:51.739740Z',
          },
          {
            name: 'E2E DecisionEnvironment ZFca',
            description: 'This is a decision environment',
            username: 'admin',
            decisionEnvironment_type: 'Container Registry',
            id: 30,
            created_at: '2023-07-28T19:28:01.687027Z',
            modified_at: '2023-07-28T19:28:01.687040Z',
          },
          {
            name: 'E2E DecisionEnvironment Y315',
            description: 'This is a decision environment',
            username: 'admin',
            decisionEnvironment_type: 'Container Registry',
            id: 31,
            created_at: '2023-07-28T19:28:01.767198Z',
            modified_at: '2023-07-28T19:28:01.767210Z',
          },
        ],
      }
    );
  });

  it('Renders the correct decisionEnvironments columns', () => {
    cy.mount(<DecisionEnvironments />);
    cy.get('h1').should('contain', 'Decision Environments');
    cy.get('.pf-v5-c-card__header').should('have.length', 10);
    cy.contains(/^Decision environments are a container image to run Ansible rulebooks.$/).should(
      'be.visible'
    );
    cy.contains('Decision Environment');
    cy.contains('Image');
  });

  it('can delete a Decision Environment not in use', () => {
    cy.mount(<DecisionEnvironments />);
    cy.intercept(
      { method: 'DELETE', url: edaAPI`/decision-environments/1/` },
      {
        statusCode: 204,
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/activations/?decision_environment_id=1` },
      { count: 0, next: null, previous: null, page_size: 20, page: 1, results: [] }
    );
    cy.get('input[id="check-1"]').first().click();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="delete-selected-decision-environments"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to delete these`
      );
      cy.contains('EDA Decision Environment 1');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Delete decision environments').click();
    });
    cy.get('[data-cy="status-column-cell"] > span').contains('Success');
    cy.clickButton(/^Close$/);
  });

  it('can delete a Decision Environment in use', () => {
    cy.mount(<DecisionEnvironments />);
    cy.intercept(
      { method: 'DELETE', url: edaAPI`/decision-environments/1/?force=true` },
      {
        statusCode: 204,
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/activations/?decision_environment_id=1` },
      {
        count: 1,
        next: null,
        previous: null,
        page_size: 20,
        page: 1,
        results: [
          {
            id: 1,
            name: 'Activation 1',
            description: '',
            is_enabled: true,
            status: 'completed',
            decision_environment_id: 1,
            project_id: 4,
            rulebook_id: 30,
            extra_var_id: null,
            restart_policy: 'on-failure',
            restart_count: 0,
            rulebook_name: 'hello_echo.yml',
            current_job_id: null,
            rules_count: 1,
            rules_fired_count: 1,
            created_at: '2023-11-16T18:55:26.833885Z',
            modified_at: '2023-11-16T18:55:32.928509Z',
            status_message: 'Activation has completed',
          },
        ],
      }
    );
    cy.get('input[id="check-1"]').first().click();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="delete-selected-decision-environments"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to delete these`
      );
      cy.contains('EDA Decision Environment 1');
      cy.get('.pf-v5-c-alert__title').contains(
        'The following decision environments are in use: EDA Decision Environment 1'
      );
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Delete decision environments').click();
    });
    cy.get('[data-cy="status-column-cell"] > span').contains('Success');
    cy.clickButton(/^Close$/);
  });
});

describe('Empty list', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/eda/v1/decision-environments/*',
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<DecisionEnvironments />);
    cy.contains(/^There are currently no decision environments created for your organization.$/);
    cy.contains(/^Please create a decision environment by using the button below.$/);
    cy.contains('button', /^Create decision environment$/).should('be.visible');
  });
});
