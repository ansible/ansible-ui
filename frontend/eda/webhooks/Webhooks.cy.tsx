import { edaAPI } from '../common/eda-utils';
import { Webhooks } from './Webhooks';

describe('Webhooks.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/webhooks/?page=1&page_size=10` },
      {
        fixture: 'edaWebhooks.json',
      }
    );

    cy.intercept(
      { method: 'GET', url: edaAPI`/webhooks/?page=2&page_size=10` },
      {
        count: 5,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            name: 'E2E Webhook N0vX',
            description: 'This is a container registry webhook',
            username: 'admin',
            webhook_type: 'Container Registry',
            id: 8,
            created_at: '2023-07-28T18:29:28.512273Z',
            modified_at: '2023-07-28T18:29:28.512286Z',
          },
          {
            name: 'E2E Webhook aOHl',
            description: 'This is a container registry webhook',
            username: 'admin',
            webhook_type: 'Container Registry',
            id: 11,
            created_at: '2023-07-28T18:32:34.992501Z',
            modified_at: '2023-07-28T18:32:34.992522Z',
          },
          {
            name: 'E2E Webhook kpub',
            description: 'This is a GitHub Webhook.',
            username: 'admin',
            webhook_type: 'GitHub Personal Access Token',
            id: 13,
            created_at: '2023-07-28T18:32:51.739715Z',
            modified_at: '2023-07-28T18:32:51.739740Z',
          },
          {
            name: 'E2E Webhook ZFca',
            description: 'This is a container registry webhook',
            username: 'admin',
            webhook_type: 'Container Registry',
            id: 30,
            created_at: '2023-07-28T19:28:01.687027Z',
            modified_at: '2023-07-28T19:28:01.687040Z',
          },
          {
            name: 'E2E Webhook Y315',
            description: 'This is a container registry webhook',
            username: 'admin',
            webhook_type: 'Container Registry',
            id: 31,
            created_at: '2023-07-28T19:28:01.767198Z',
            modified_at: '2023-07-28T19:28:01.767210Z',
          },
        ],
      }
    );
  });

  it('Renders the correct webhooks columns', () => {
    cy.mount(<Webhooks />);
    cy.get('h1').should('contain', 'Webhooks');
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.contains(
      /^Webhooks are utilized by EDA for authentication when launching rulebooks.$/
    ).should('be.visible');
    cy.contains('th', 'Name');
    cy.contains('th', 'Type');
  });

  it('Can delete a Webhook not in use', () => {
    cy.mount(<Webhooks />);
    cy.intercept(
      { method: 'DELETE', url: edaAPI`/webhooks/100/` },
      {
        statusCode: 204,
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/activations/?webhook_id=100` },
      { count: 0, next: null, previous: null, page_size: 20, page: 1, results: [] }
    );
    cy.get('[data-cy="checkbox-column-cell"]').first().click();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="delete-selected-webhooks"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to delete these`
      );
      cy.contains('EDA Webhook 1');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Delete webhooks').click();
    });
    cy.get('[data-cy="status-column-cell"] > span').contains('Success');
    cy.clickButton(/^Close$/);
  });

  it('can delete a Webhook in use', () => {
    cy.mount(<Webhooks />);
    cy.intercept(
      { method: 'DELETE', url: edaAPI`/webhooks/100/?force=true` },
      {
        statusCode: 204,
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/activations/?webhook_id=100` },
      {
        count: 1,
        next: null,
        previous: null,
        page_size: 20,
        page: 1,
        results: [
          {
            id: 1,
            name: 'Activation with webhook',
            description: '',
            is_enabled: true,
            status: 'failed',
            decision_environment_id: 11,
            project_id: 4,
            rulebook_id: 28,
            extra_var_id: null,
            restart_policy: 'on-failure',
            restart_count: 0,
            rulebook_name: 'basic_short.yml',
            current_job_id: null,
            rules_count: 0,
            rules_fired_count: 0,
            created_at: '2023-11-16T20:22:48.755916Z',
            modified_at: '2023-11-16T20:22:51.382540Z',
            status_message: 'Activation has failed',
          },
        ],
      }
    );
    cy.get('[data-cy="checkbox-column-cell"]').first().click();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="delete-selected-webhooks"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to delete these`
      );
      cy.contains('EDA Webhook 1');
      cy.get('.pf-v5-c-alert__title').contains('The following webhooks are in use: EDA Webhook 1');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Delete webhooks').click();
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
        url: edaAPI`/webhooks/*`,
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<Webhooks />);
    cy.contains(/^There are currently no webhooks created for your organization.$/);
    cy.contains(/^Please create a webhook by using the button below.$/);
    cy.contains('button', /^Create webhook$/).should('be.visible');
  });
});
