import { edaAPI } from '../common/eda-utils';
import { CreateEventStream, EditEventStream } from './EventStreamForm';

describe('Create event stream ', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/organizations/*` },
      {
        fixture: 'edaOrganizations.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/eda-credentials/*` },
      {
        fixture: 'edaCredentialsES.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/credential-types/*` },
      {
        fixture: 'edaCredentialTypesES.json',
      }
    );
  });

  it('Validates properly', () => {
    cy.mount(<CreateEventStream />);
    cy.verifyPageTitle('Create event stream');
    cy.clickButton(/^Create event stream$/);
    ['Name', 'Event stream type'].map((field) =>
      cy.contains(`${field} is required.`).should('be.visible')
    );
  });

  it('Should update fields properly', () => {
    cy.mount(<CreateEventStream />);
    cy.get('[data-cy="name"]').type('Test');
    cy.get('[data-cy="organization_id"]').click();
    cy.get('[data-cy="event_stream_type_id"]').click();
    cy.get('#basic-event-stream > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
    cy.get('[data-cy="credential_id"]').click();
    cy.get('#basic-es-3 > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
    cy.clickButton('Create event stream');

    cy.intercept('POST', edaAPI`/event-streams/`, (req) => {
      expect(req.body).to.contain({
        name: 'Test',
        organization_id: 5,
        type_id: 8,
        eda_credential_id: 101,
      });
    });
  });
});

describe('Edit Event Stream', () => {
  const es = {
    name: 'Sample Event Stream',
    id: 1,
    organization: {
      id: 5,
      name: 'Organization 5',
    },
    eda_credential: {
      id: 3,
      name: 'Basic ES 3',
      inputs: {
        auth_type: 'basic',
        http_header_key: 'Authorization',
        password: '$encrypted$',
        username: 'a',
      },
      managed: false,
      credential_type_id: 7,
      organization_id: 5,
    },
    event_stream_type: 'basic',
    owner: 'admin',
    url: 'https://3.84.159.207/eda-event-streams/api/eda/v1/external_event_stream/e8151c02-2d27-4ba0-84bd-27255938f909/post/',
    created_at: '2024-09-09T23:57:28.704258Z',
    modified_at: '2024-09-09T23:57:28.704272Z',
    test_content_type: '',
    test_content: '',
    test_error_message: '',
    test_headers: '',
    events_received: 0,
    last_event_received_at: null,
  };

  beforeEach(() => {
    cy.intercept({ method: 'GET', url: edaAPI`/event-streams/*` }, { statusCode: 200, body: es });
    cy.intercept(
      { method: 'GET', url: edaAPI`/organizations/5` },
      { id: 5, name: 'Organization 5' }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/eda-credentials/*` },
      {
        fixture: 'edaCredentialsES.json',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/eda-credentials/3/` },
      {
        name: 'Basic ES 3',
        description: 'This is a container registry credential',
        username: 'admin',
        credential_type: { id: 7, name: 'Basic Event Stream' },
        id: 3,
        created_at: '2023-07-28T18:29:28.512273Z',
        modified_at: '2023-07-28T18:29:28.512286Z',
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/credential-types/*` },
      {
        fixture: 'edaCredentialTypesES.json',
      }
    );
  });

  it('should preload the form with current values', () => {
    cy.mount(<EditEventStream />);
    cy.verifyPageTitle('Edit Sample Event Stream');
    cy.get('[data-cy="name"]').should('have.value', 'Sample Event Stream');
    cy.get('[data-cy="event-stream-type"]').should('have.value', 'basic');
    cy.get('[data-cy="organization_id"]').should('have.text', 'Organization 5');
    cy.get('[data-cy="credential_id"]').should('have.text', 'Basic ES 3');
  });

  it('should edit the event stream', () => {
    cy.mount(<EditEventStream />);
    cy.get('[data-cy="name"]').should('have.value', 'Sample Event Stream');
    cy.get('[data-cy="name"]').clear();
    cy.get('[data-cy="name"]').type('Modified Event Stream');
    cy.get('[data-cy="Submit"]').clickButton(/^Save event stream$/);
    cy.intercept('PATCH', edaAPI`/event-streams/`, (req) => {
      expect(req.body).to.contain({
        name: 'Modified Event Stream',
      });
    });
  });
});
