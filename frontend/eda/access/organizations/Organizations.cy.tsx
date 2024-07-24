import { edaAPI } from '../../common/eda-utils';
import { Organizations } from './Organizations';

describe('Organizations.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/organizations/?page=1&page_size=10` },
      {
        fixture: 'edaOrganizations.json',
      }
    );

    cy.intercept(
      { method: 'GET', url: edaAPI`/organizations/?page=2&page_size=10` },
      {
        count: 5,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            name: 'E2E Organization N0vX',
            description: 'This is an organization',
            id: 11,
            created_at: '2024-07-28T18:29:28.512273Z',
            modified_at: '2024-07-28T18:29:28.512286Z',
          },
          {
            name: 'E2E Organization aOHl',
            description: 'This is an organization',
            id: 12,
            created_at: '2024-07-28T18:32:34.992501Z',
            modified_at: '2024-07-28T18:32:34.992522Z',
          },
          {
            name: 'E2E Organization kpub',
            description: 'This is an organization.',
            id: 13,
            created_at: '2024-07-28T18:32:51.739715Z',
            modified_at: '2024-07-28T18:32:51.739740Z',
          },
          {
            name: 'E2E Organization ZFca',
            description: 'This is an organization',
            id: 14,
            created_at: '2024-07-28T19:28:01.687027Z',
            modified_at: '2024-07-28T19:28:01.687040Z',
          },
          {
            name: 'E2E Organization Y315',
            description: 'This is an organization',
            id: 15,
            created_at: '2024-07-28T19:28:01.767198Z',
            modified_at: '2024-07-28T19:28:01.767210Z',
          },
        ],
      }
    );
  });

  it('Renders the correct organizations columns', () => {
    cy.mount(<Organizations />);
    cy.get('h1').should('contain', 'Organizations');
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.contains(
      /^An organization is a logical collection of users, teams and projects and is the highest level in the EDA object hierarchy.$/
    ).should('be.visible');
    cy.contains('Organization');
    cy.contains('Name');
  });

  it('can delete an Organization not in use', () => {
    cy.mount(<Organizations />);
    cy.intercept(
      { method: 'DELETE', url: edaAPI`/organizations/2/` },
      {
        statusCode: 204,
      }
    );
    cy.get('[data-cy="row-id-2"] > [data-cy="checkbox-column-cell"] > label > input').click();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="delete-organizations"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to delete these`
      );
      cy.contains('Organization 2');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Delete organizations').click();
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
        url: '/api/eda/v1/organizations/*',
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<Organizations />);
    cy.contains(/^There are currently no organizations created.$/);
    cy.contains(/^Please create an organization by using the button below.$/);
    cy.contains('button', /^Create organization$/).should('be.visible');
  });
});
