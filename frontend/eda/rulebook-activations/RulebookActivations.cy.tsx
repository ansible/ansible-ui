import { edaAPI } from '../common/eda-utils';
import { RulebookActivations } from './RulebookActivations';

describe('RulebookActivations.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/activations/?page=1&page_size=10` },
      {
        fixture: 'edaRulebookActivations.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/activations/?page=2&page_size=10` },
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
            extra_var: null,
            restart_policy: 'on-failure',
            restart_count: 0,
            rulebook_name: 'test.yml',
            current_job_id: null,
            rules_count: 1,
            rules_fired_count: 1,
            created_at: '2023-10-02T13:34:18.445029Z',
            modified_at: '2023-10-02T13:34:28.742952Z',
            status_message: 'Activation has completed',
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
            extra_var: null,
            restart_policy: 'on-failure',
            restart_count: 0,
            rulebook_name: 'test.yml',
            current_job_id: null,
            rules_count: 1,
            rules_fired_count: 1,
            created_at: '2023-10-02T13:34:18.445029Z',
            modified_at: '2023-10-02T13:34:28.742952Z',
            status_message: 'Activation has completed',
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
            extra_var: null,
            restart_policy: 'on-failure',
            restart_count: 0,
            rulebook_name: 'test.yml',
            current_job_id: null,
            rules_count: 1,
            rules_fired_count: 1,
            created_at: '2023-10-02T13:34:18.445029Z',
            modified_at: '2023-10-02T13:34:28.742952Z',
            status_message: 'Activation has completed',
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
            extra_var: null,
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
    cy.contains(
      /^Rulebook activations manage the configuration and enabling of rulebooks that govern automation logic triggered by events.$/
    ).should('be.visible');
    cy.get('[data-cy="id-column-header"]').should('be.visible');
    cy.get('[data-cy="name-column-header"]').should('be.visible');
    cy.get('[data-cy="status-column-header"]').should('be.visible');
    cy.get('[data-cy="number-of-rules-column-header"]').should('be.visible');
    cy.get('[data-cy="fire-count-column-header"]').should('be.visible');
    cy.get('[data-cy="restart-count-column-header"]').should('be.visible');
    cy.get('#expand-toggle0 > .pf-v5-c-table__toggle-icon').click();
    cy.get('[data-cy="status-message"]').should('be.visible');
    cy.get('[data-cy="created"]').should('be.visible');
    cy.get('[data-cy="last-modified"]').should('be.visible');
  });

  it('can restart a Rulebook Activation from the line item in list view', () => {
    cy.mount(<RulebookActivations />);
    cy.get('[data-cy="row-id-1"] > [data-cy="checkbox-column-cell"]').click();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="restart-rulebook-activations"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to restart these`
      );
      cy.contains('Activation 1');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Restart rulebook activations').click();
    });
    cy.clickButton(/^Close$/);
  });

  it('can disable a Rulebook Activation from the line item in list view', () => {
    cy.mount(<RulebookActivations />);
    cy.intercept({ method: 'POST', url: edaAPI`/activations/2/disable/` });
    cy.get('[data-cy="row-id-1"] > [data-cy="checkbox-column-cell"]').click();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="disable-rulebook-activations"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to disable these`
      );
      cy.contains('Activation 1');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Disable rulebook activations').click();
    });
    cy.clickButton(/^Close$/);
  });

  it('can delete a Rulebook Activation from the line item in list view', () => {
    cy.mount(<RulebookActivations />);
    cy.intercept({ method: 'POST', url: edaAPI`/activations/2/delete/` });
    cy.get('[data-cy="row-id-1"] > [data-cy="checkbox-column-cell"]').click();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="delete-rulebook-activations"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to delete these`
      );
      cy.contains('Activation 1');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Delete rulebook activations').click();
    });
    cy.clickButton(/^Close$/);
  });
});

describe('Empty list without POST permission', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/activations/*`,
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<RulebookActivations />);
    cy.contains(/^You do not have permission to create a rulebook activation.$/);
    cy.contains(
      /^Please contact your organization administrator if there is an issue with your access.$/
    );
  });
});

describe('Empty list with POST permission', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'OPTIONS',
        url: edaAPI`/activations/`,
      },
      {
        fixture: 'edaActivationsOptions.json',
      }
    ).as('getOptions');
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/activations/*`,
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
