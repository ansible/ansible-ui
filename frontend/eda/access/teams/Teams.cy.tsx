import { edaAPI } from '../../common/eda-utils';
import { Teams } from './Teams';

describe('Teams.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/teams/?page=1&page_size=10` },
      {
        fixture: 'edaTeams.json',
      }
    );

    cy.intercept(
      { method: 'GET', url: edaAPI`/teams/?page=2&page_size=10` },
      {
        count: 5,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            name: 'E2E Team N0vX',
            description: 'This is an team',
            id: 11,
            created_at: '2024-07-28T18:29:28.512273Z',
            modified_at: '2024-07-28T18:29:28.512286Z',
          },
          {
            name: 'E2E Team aOHl',
            description: 'This is an team',
            id: 12,
            created_at: '2024-07-28T18:32:34.992501Z',
            modified_at: '2024-07-28T18:32:34.992522Z',
          },
          {
            name: 'E2E Team kpub',
            description: 'This is an team.',
            id: 13,
            created_at: '2024-07-28T18:32:51.739715Z',
            modified_at: '2024-07-28T18:32:51.739740Z',
          },
          {
            name: 'E2E Team ZFca',
            description: 'This is an team',
            id: 14,
            created_at: '2024-07-28T19:28:01.687027Z',
            modified_at: '2024-07-28T19:28:01.687040Z',
          },
          {
            name: 'E2E Team Y315',
            description: 'This is an team',
            id: 15,
            created_at: '2024-07-28T19:28:01.767198Z',
            modified_at: '2024-07-28T19:28:01.767210Z',
          },
        ],
      }
    );
  });

  it('Renders the correct teams columns', () => {
    cy.mount(<Teams />);
    cy.get('h1').should('contain', 'Teams');
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.contains(
      /^A team is a subdivision of an organization with associated users, projects, credentials, and permissions.$/
    ).should('be.visible');
    cy.contains('Team');
    cy.contains('Name');
  });

  it('can delete a Team not in use', () => {
    cy.mount(<Teams />);
    cy.intercept(
      { method: 'DELETE', url: edaAPI`/teams/2/` },
      {
        statusCode: 204,
      }
    );
    cy.get('[data-cy="row-id-2"] > [data-cy="checkbox-column-cell"] > label > input').click();
    cy.get('[data-cy="actions-dropdown"]').first().click();
    cy.get('[data-cy="delete-teams"]').click();
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to delete these`
      );
      cy.contains('Test');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Delete teams').click();
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
        url: '/api/eda/v1/teams/*',
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<Teams />);
    cy.contains(/^There are currently no teams created.$/);
    cy.contains(/^Please create a team by using the button below.$/);
    cy.contains('button', /^Create team$/).should('be.visible');
  });
});
