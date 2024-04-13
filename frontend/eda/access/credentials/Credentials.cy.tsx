import { edaAPI } from '../../common/eda-utils';
import { Credentials } from './Credentials';

describe('Credentials.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/eda-credentials/?page=1&page_size=10` },
      {
        fixture: 'edaCredentials.json',
      }
    );

    cy.intercept(
      { method: 'GET', url: edaAPI`/eda-credentials/?page=2&page_size=10` },
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
    cy.contains('th', 'Credential type');
  });

  it('Can delete a Credential not in use', () => {
    cy.mount(<Credentials />);
    cy.intercept(
      { method: 'DELETE', url: edaAPI`/eda-credentials/100/` },
      {
        statusCode: 204,
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/activations/?eda_credential_id=100` },
      { count: 0, next: null, previous: null, page_size: 20, page: 1, results: [] }
    );
    cy.get('[data-cy="checkbox-column-cell"]').first().click();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="delete-selected-credentials"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to delete these`
      );
      cy.contains('EDA Credential 1');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Delete credentials').click();
    });
    cy.get('[data-cy="status-column-cell"] > span').contains('Success');
    cy.clickButton(/^Close$/);
  });

  it('can delete a Credential in use', () => {
    cy.mount(<Credentials />);
    cy.intercept(
      { method: 'DELETE', url: edaAPI`/eda-credentials/100/?force=true` },
      {
        statusCode: 204,
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/activations/?eda_credential_id=100` },
      {
        count: 1,
        next: null,
        previous: null,
        page_size: 20,
        page: 1,
        results: [
          {
            id: 1,
            name: 'Activation with credential',
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
    cy.get('[data-cy="delete-selected-credentials"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to delete these`
      );
      cy.contains('EDA Credential 1');
      cy.get('.pf-v5-c-alert__title').contains(
        'The following credentials are in use: EDA Credential 1'
      );
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Delete credentials').click();
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
        url: edaAPI`/eda-credentials/*`,
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
