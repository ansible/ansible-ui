import { MemoryRouter } from 'react-router-dom';
import { PageDialogProvider } from '../../../../framework';
import { Teams } from './Teams';
import * as requests from '../../../Data';

describe('Teams.cy.ts', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/teams/*',
        },
        {
          fixture: 'teams.json',
        }
      ).as('teamsList');
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
      cy.contains('button', /^Create team$/).should('have.attr', 'aria-disabled', 'true');
    });
    it('Create Team button is enabled if the user has permission to create teams', () => {
      cy.stub(requests, 'useOptions').callsFake(() => ({
        data: {
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
      }));
      cy.mount(
        <MemoryRouter>
          <Teams />
        </MemoryRouter>
      );
      cy.contains('button', /^Create team$/).should('have.attr', 'aria-disabled', 'false');
    });
  });
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/teams/*',
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed correctly for user with permission to create teams', () => {
      cy.stub(requests, 'useOptions').callsFake(() => ({
        data: {
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
      }));
      cy.mount(
        <MemoryRouter initialEntries={['/teams']}>
          <Teams />
        </MemoryRouter>
      );
      // Refresh needed so that useControllerView picks up the updated intercept for empty state in the next set of tests
      cy.get('button[id="refresh"]').click();

      cy.contains(/^There are currently no teams added to your organization.$/);
      cy.contains(/^Please create a team by using the button below.$/);
      cy.contains('button', /^Create team$/).should('be.visible');
    });
    it('Empty state is displayed correctly for user without permission to create teams', () => {
      cy.stub(requests, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(
        <MemoryRouter>
          <Teams />
        </MemoryRouter>
      );
      // Refresh needed so that useControllerView picks up the updated intercept for empty state in the next set of tests
      cy.get('button[id="refresh"]').click();
      cy.contains(/^You do not have permission to create a team$/);
      cy.contains(
        /^Please contact your Organization Administrator if there is an issue with your access.$/
      );
      cy.contains('button', /^Create team$/).should('not.exist');
    });
  });
});
