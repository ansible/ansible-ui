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
            name: 'Webhook 1',
            test_mode: false,
            user: 'admin',
            hmac_algorithm: 'sha256',
            header_key: 'X-Hub-Signature-256',
            hmac_signature_prefix: 'sha256=',
            hmac_format: 'hex',
            auth_type: 'hmac',
            additional_data_headers: null,
            id: 1,
            url: 'https://ui.eda.local:8443/abc-def-123-34567/api/eda/v1/external_webhook/123a26f5-bddd-4737-a0e7-653949ccce0a/post/',
            type: 'GitHub',
            created_at: '2024-03-04T14:51:10.846070Z',
            modified_at: '2024-03-04T14:51:10.846083Z',
            test_content_type: '',
            test_content: '',
            test_error_message: '',
          },
          {
            name: 'Webhook 2',
            test_mode: false,
            user: 'admin',
            hmac_algorithm: 'sha256',
            header_key: 'X-Gitlab-Token',
            hmac_signature_prefix: '',
            hmac_format: 'hex',
            auth_type: 'token',
            additional_data_headers: null,
            id: 2,
            url: 'https://ui.eda.local:8443/abc-def-123-34567/api/eda/v1/external_webhook/d0073c32-561f-428b-9461-6e783f3cad4d/post/',
            type: 'GitLab',
            created_at: '2024-03-04T14:51:28.010931Z',
            modified_at: '2024-03-04T14:51:28.010942Z',
            test_content_type: '',
            test_content: '',
            test_error_message: '',
          },
          {
            name: 'Webhook 3',
            test_mode: false,
            user: 'admin',
            hmac_algorithm: 'sha256',
            header_key: 'Authorization',
            hmac_signature_prefix: '',
            hmac_format: 'hex',
            auth_type: 'token',
            additional_data_headers: null,
            id: 3,
            url: 'https://ui.eda.local:8443/abc-def-123-34567/api/eda/v1/external_webhook/6805007c-bad8-43ce-9afe-db20f1dbf594/post/',
            type: 'Service Now',
            created_at: '2024-03-04T14:51:45.682567Z',
            modified_at: '2024-03-04T14:51:45.682577Z',
            test_content_type: '',
            test_content: '',
            test_error_message: '',
          },
          {
            name: 'Webhook 4',
            test_mode: false,
            user: 'admin',
            hmac_algorithm: 'sha256',
            header_key: 'X-Hub-Signature-256',
            hmac_signature_prefix: 'sha256=',
            hmac_format: 'hex',
            auth_type: 'hmac',
            additional_data_headers: null,
            id: 4,
            url: 'https://ui.eda.local:8443/abc-def-123-34567/api/eda/v1/external_webhook/123a26f5-bddd-4737-a0e7-653949ccce0a/post/',
            type: 'GitHub',
            created_at: '2024-03-04T14:51:10.846070Z',
            modified_at: '2024-03-04T14:51:10.846083Z',
            test_content_type: '',
            test_content: '',
            test_error_message: '',
          },
          {
            name: 'Webhook 5',
            test_mode: false,
            user: 'admin',
            hmac_algorithm: 'sha256',
            header_key: 'X-Gitlab-Token',
            hmac_signature_prefix: '',
            hmac_format: 'hex',
            auth_type: 'token',
            additional_data_headers: null,
            id: 5,
            url: 'https://ui.eda.local:8443/abc-def-123-34567/api/eda/v1/external_webhook/d0073c32-561f-428b-9461-6e783f3cad4d/post/',
            type: 'GitLab',
            created_at: '2024-03-04T14:51:28.010931Z',
            modified_at: '2024-03-04T14:51:28.010942Z',
            test_content_type: '',
            test_content: '',
            test_error_message: '',
          },
        ],
      }
    );
  });

  it('Renders the correct webhooks columns', () => {
    cy.mount(<Webhooks />);
    cy.get('h1').should('contain', 'Event streams');
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.contains('th', 'Name');
    cy.contains('th', 'Created');
  });

  it('Can delete an event stream not in use', () => {
    cy.mount(<Webhooks />);
    cy.intercept(
      { method: 'DELETE', url: edaAPI`/webhooks/1/` },
      {
        statusCode: 204,
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/activations/?webhook_id=1` },
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
      cy.contains('Webhook 1');
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
    cy.contains(/^There are currently no event streams created for your organization.$/);
    cy.contains(/^Please create an event stream by using the button below.$/);
    cy.contains('button', /^Create event stream$/).should('be.visible');
  });
});
