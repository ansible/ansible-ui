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
        count: 15,
        next: null,
        previous: '/api/eda/v1/webhooks/?page=1&page_size=10',
        page_size: 10,
        page: 2,
        results: [
          {
            name: 'Event stream 11 - snow',
            test_mode: false,
            additional_data_headers: '',
            organization: {
              id: 1,
              name: 'Default',
              description: 'The default organization',
            },
            eda_credential: {
              id: 6,
              name: 'ev 4 - snow',
              description: '',
              inputs: {
                auth_type: 'token',
                token: '$encrypted$',
                http_header_key: 'Authorization',
              },
              managed: false,
              credential_type_id: 15,
              organization_id: 1,
            },
            webhook_type: 'snow',
            id: 11,
            owner: 'admin',
            url: 'https://ui.eda.local:8443/api/eda/v1/external_webhook/7325d4f7-145c-4195-80c9-c87f7a4fff3d/post/',
            created_at: '2024-07-31T20:57:07.411453Z',
            modified_at: '2024-07-31T20:57:07.411468Z',
            test_content_type: '',
            test_content: '',
            test_error_message: '',
            test_headers: '',
            events_received: 0,
            last_event_received_at: null,
          },
          {
            name: 'Event stream 12 - snow',
            test_mode: false,
            additional_data_headers: '',
            organization: {
              id: 1,
              name: 'Default',
              description: 'The default organization',
            },
            eda_credential: {
              id: 6,
              name: 'ev 4 - snow',
              description: '',
              inputs: {
                auth_type: 'token',
                token: '$encrypted$',
                http_header_key: 'Authorization',
              },
              managed: false,
              credential_type_id: 15,
              organization_id: 1,
            },
            webhook_type: 'snow',
            id: 12,
            owner: 'admin',
            url: 'https://ui.eda.local:8443/api/eda/v1/external_webhook/2021ddeb-8991-4ed0-9db5-69f468ebb434/post/',
            created_at: '2024-07-31T20:57:34.306996Z',
            modified_at: '2024-07-31T20:57:34.307007Z',
            test_content_type: '',
            test_content: '',
            test_error_message: '',
            test_headers: '',
            events_received: 0,
            last_event_received_at: null,
          },
          {
            name: 'Event stream 13 - snow',
            test_mode: false,
            additional_data_headers: '',
            organization: {
              id: 1,
              name: 'Default',
              description: 'The default organization',
            },
            eda_credential: {
              id: 6,
              name: 'ev 4 - snow',
              description: '',
              inputs: {
                auth_type: 'token',
                token: '$encrypted$',
                http_header_key: 'Authorization',
              },
              managed: false,
              credential_type_id: 15,
              organization_id: 1,
            },
            webhook_type: 'snow',
            id: 13,
            owner: 'admin',
            url: 'https://ui.eda.local:8443/api/eda/v1/external_webhook/f3654654-d08b-4b44-a280-bffb4d5628f1/post/',
            created_at: '2024-07-31T21:06:06.593243Z',
            modified_at: '2024-07-31T21:06:06.593253Z',
            test_content_type: '',
            test_content: '',
            test_error_message: '',
            test_headers: '',
            events_received: 0,
            last_event_received_at: null,
          },
          {
            name: 'Event stream 14 - basic',
            test_mode: false,
            additional_data_headers: '',
            organization: {
              id: 1,
              name: 'Default',
              description: 'The default organization',
            },
            eda_credential: {
              id: 4,
              name: 'ev2 - basic',
              description: 'Ev2 - basic',
              inputs: {
                username: 'a',
                password: '$encrypted$',
                auth_type: 'basic',
                http_header_key: 'Authorization',
              },
              managed: false,
              credential_type_id: 7,
              organization_id: 1,
            },
            webhook_type: 'basic',
            id: 14,
            owner: 'admin',
            url: 'https://ui.eda.local:8443/api/eda/v1/external_webhook/354546ad-78b7-43f7-8e7e-dfb27b55c4e8/post/',
            created_at: '2024-07-31T21:06:23.489086Z',
            modified_at: '2024-07-31T21:06:23.489095Z',
            test_content_type: '',
            test_content: '',
            test_error_message: '',
            test_headers: '',
            events_received: 0,
            last_event_received_at: null,
          },
          {
            name: 'Event stream 15 - gh',
            test_mode: false,
            additional_data_headers: '',
            organization: {
              id: 1,
              name: 'Default',
              description: 'The default organization',
            },
            eda_credential: {
              id: 1,
              name: 'ev1 - gh',
              description: 'Ev 1 - gh',
              inputs: {
                secret: '$encrypted$',
                auth_type: 'hmac',
                hash_algorithm: 'sha256',
                http_header_key: 'X-Hub-Signature-256',
                signature_encoding: 'hex',
                signature_prefix: 'sha256=',
              },
              managed: false,
              credential_type_id: 14,
              organization_id: 1,
            },
            webhook_type: 'github',
            id: 15,
            owner: 'admin',
            url: 'https://ui.eda.local:8443/api/eda/v1/external_webhook/b3f304cc-8f5b-4150-9fa0-e15e717a0c3a/post/',
            created_at: '2024-07-31T21:06:40.769402Z',
            modified_at: '2024-07-31T21:06:40.769411Z',
            test_content_type: '',
            test_content: '',
            test_error_message: '',
            test_headers: '',
            events_received: 0,
            last_event_received_at: null,
          },
        ],
      }
    );
  });

  it('Renders the correct webhooks columns', () => {
    cy.mount(<Webhooks />);
    cy.get('h1').should('contain', 'Event Streams');
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.contains('th', 'Name');
    cy.contains('th', 'Events received');
    cy.contains('th', 'Last event received');
    cy.contains('th', 'Mode');
  });

  it('Can delete an event stream not in use', () => {
    cy.mount(<Webhooks />);
    cy.intercept(
      { method: 'DELETE', url: edaAPI`/webhooks/2/` },
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
    cy.get('[data-cy="delete-selected-event-streams"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to delete these`
      );
      cy.contains('Event stream 2');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Delete event streams').click();
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
