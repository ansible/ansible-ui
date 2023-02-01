import { MemoryRouter } from 'react-router-dom';
import { PageDialogProvider } from '../../../../framework';
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
  it('Bulk deletion confirmation contains message about selected teams that cannot be deleted', () => {
    // The team with id: 29 in the teams.json fixture has user_capabilities.delete set to false
    cy.mount(
      <MemoryRouter>
        <PageDialogProvider>
          <Teams />
        </PageDialogProvider>
      </MemoryRouter>
    );
    cy.get('[type="checkbox"][id="select-all"]').check();
    cy.get('#toggle-kebab').click();
    cy.contains('a[role="menuitem"]', 'Delete selected teams').click();
    cy.contains(
      '{{count}} of the selected teams cannot be deleted due to insufficient permissions.'
    ).should('be.visible');
  });
  it('Create Team button is disabled if the user does not have permission to create teams', () => {
    cy.mount(
      <MemoryRouter>
        <Teams />
      </MemoryRouter>
    );
    cy.contains('button[id="create-team"]', 'Create team').should(
      'have.attr',
      'aria-disabled',
      'true'
    );
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
    cy.contains('button[id="create-team"]', 'Create team').should(
      'have.attr',
      'aria-disabled',
      'false'
    );
  });
});
