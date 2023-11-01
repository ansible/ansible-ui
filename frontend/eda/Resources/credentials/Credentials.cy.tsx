import { edaAPI } from '../../api/eda-utils';
import { Credentials } from './Credentials';

describe('Credentials.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/credentials/?page=1&page_size=10` },
      {
        fixture: 'edaCredentials.json',
      }
    );

    cy.intercept(
      { method: 'GET', url: edaAPI`/credentials/?page=2&page_size=10` },
      {
        count: 5,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            name: 'E2E Credential N0vX',
            description: 'This is a container registry credential',
            username: 'admin',
            credential_type: 'Container Registry',
            id: 8,
            created_at: '2023-07-28T18:29:28.512273Z',
            modified_at: '2023-07-28T18:29:28.512286Z',
          },
          {
            name: 'E2E Credential aOHl',
            description: 'This is a container registry credential',
            username: 'admin',
            credential_type: 'Container Registry',
            id: 11,
            created_at: '2023-07-28T18:32:34.992501Z',
            modified_at: '2023-07-28T18:32:34.992522Z',
          },
          {
            name: 'E2E Credential kpub',
            description: 'This is a GitHub Credential.',
            username: 'admin',
            credential_type: 'GitHub Personal Access Token',
            id: 13,
            created_at: '2023-07-28T18:32:51.739715Z',
            modified_at: '2023-07-28T18:32:51.739740Z',
          },
          {
            name: 'E2E Credential ZFca',
            description: 'This is a container registry credential',
            username: 'admin',
            credential_type: 'Container Registry',
            id: 30,
            created_at: '2023-07-28T19:28:01.687027Z',
            modified_at: '2023-07-28T19:28:01.687040Z',
          },
          {
            name: 'E2E Credential Y315',
            description: 'This is a container registry credential',
            username: 'admin',
            credential_type: 'Container Registry',
            id: 31,
            created_at: '2023-07-28T19:28:01.767198Z',
            modified_at: '2023-07-28T19:28:01.767210Z',
          },
        ],
      }
    );
  });

  it('Renders the correct credentials columns', () => {
    cy.mount(<Credentials />);
    cy.get('h1').should('contain', 'Credentials');
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.contains(
      /^Credentials are utilized by EDA for authentication when launching rulebooks.$/
    ).should('be.visible');
    cy.contains('th', 'Name');
    cy.contains('th', 'Type');
  });
});

describe('Empty list', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/eda/v1/credentials/*',
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<Credentials />);
    cy.contains(/^There are currently no credentials created for your organization.$/);
    cy.contains(/^Please create a credential by using the button below.$/);
    cy.contains('button', /^Create credential$/).should('be.visible');
  });
});
