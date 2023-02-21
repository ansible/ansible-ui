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
    it('List has filters for Name, Organization, Created By and Modified By', () => {
      cy.mount(
        <MemoryRouter>
          <Teams />
        </MemoryRouter>
      );
      cy.intercept('/api/v2/teams/?organization__name__icontains=Organization%201*').as(
        'orgFilterRequest'
      );
      cy.hasTitle(/^Teams$/);
      cy.contains('button.pf-c-select__toggle', /^Name$/).click();
      cy.get('ul.pf-c-select__menu').within(() => {
        cy.contains(/^Name$/).should('be.visible');
        cy.contains(/^Organization$/).should('be.visible');
        cy.contains(/^Created by$/).should('be.visible');
        cy.contains(/^Modified by$/).should('be.visible');
        cy.contains('button', /^Organization$/).click();
      });
      cy.filterByText('Organization 1');
      // A network request is made based on the filter selected on the UI
      cy.wait('@orgFilterRequest');
      // Clear filter
      cy.clickButton(/^Clear all filters$/);
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
    it('Displays error if teams are not successfully loaded', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/teams/*',
        },
        {
          statusCode: 500,
        }
      ).as('teamsError');
      cy.mount(
        <MemoryRouter>
          <Teams />
        </MemoryRouter>
      );
      // Refresh needed so that useControllerView picks up the updated intercept for empty state in the next set of tests
      cy.get('button[id="refresh"]').click();
      cy.contains('Error loading teams');
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
