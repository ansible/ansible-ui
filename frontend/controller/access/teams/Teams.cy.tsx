import { MemoryRouter } from 'react-router-dom';
import { Teams } from './Teams';

describe('Jobs.cy.ts', () => {
  before(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/teams/*',
      },
      {
        fixture: 'teams.json',
      }
    );
  });
  it('Component renders', () => {
    cy.mount(
      <MemoryRouter>
        <Teams />
      </MemoryRouter>
    );
    cy.hasTitle(/^Teams$/);
    cy.get('table').find('tr').should('have.length', 4);
  });
  it('Create Team button is disabled if the user does not have permission to create teams', () => {
    cy.mount(
      <MemoryRouter>
        <Teams />
      </MemoryRouter>
    );
    cy.get('button[id="create-team"]')
      .contains('Create team')
      .should('have.attr', 'aria-disabled', 'true');
  });
  it('Create Team button is enabled if the user has permission to create teams', () => {
    cy.intercept(
      {
        method: 'OPTIONS',
        url: '/api/v2/teams/',
      },
      {
        statusCode: 201,
        body: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this team.',
                filterable: true,
              },
            },
          },
        },
      }
    );
    cy.mount(
      <MemoryRouter>
        <Teams />
      </MemoryRouter>
    );
    cy.get('button[id="create-team"]')
      .contains('Create team')
      .should('have.attr', 'aria-disabled', 'false');
  });
});
