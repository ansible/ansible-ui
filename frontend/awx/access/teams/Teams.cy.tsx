import { Teams } from './Teams';

describe('Teams.cy.ts', () => {
  describe('Error list', () => {
    it('Displays error if teams are not successfully loaded', () => {
      cy.intercept({ method: 'GET', url: '/api/v2/teams/*' }, { statusCode: 500 });
      cy.mount(<Teams />);
      cy.contains('Error loading teams');
    });
  });

  describe('Non-empty list', () => {
    it('Component renders', () => {
      cy.intercept({ method: 'GET', url: '/api/v2/teams/*' }, { fixture: 'teams.json' });
      cy.mount(<Teams />);
      cy.hasTitle(/^Teams$/);
      cy.get('table').find('tr').should('have.length', 4);
    });

    it('List has filters for Name, Organization, Created By and Modified By', () => {
      cy.intercept({ method: 'GET', url: '/api/v2/teams/*' }, { fixture: 'teams.json' });
      cy.mount(<Teams />);
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
      cy.filterTableByText('Organization 1');
      // A network request is made based on the filter selected on the UI
      cy.wait('@orgFilterRequest');
      // Clear filter
      cy.clickButton(/^Clear all filters$/);
    });

    it('Bulk deletion confirmation contains message about selected teams that cannot be deleted', () => {
      // The team with id: 29 in the teams.json fixture has user_capabilities.delete set to false
      cy.intercept({ method: 'GET', url: '/api/v2/teams/*' }, { fixture: 'teams.json' });
      cy.mount(<Teams />);
      cy.get('[type="checkbox"][id="select-all"]').check();
      cy.clickToolbarKebabAction(/^Delete selected teams$/);
      cy.contains(
        '{{count}} of the selected teams cannot be deleted due to insufficient permissions.'
      ).should('be.visible');
    });

    it('Create Team button is disabled if the user does not have permission to create teams', () => {
      cy.intercept({ method: 'GET', url: '/api/v2/teams/*' }, { fixture: 'teams.json' });
      cy.mount(<Teams />);
      cy.contains('a', /^Create team$/).should('have.attr', 'aria-disabled', 'true');
    });

    it('Create Team button is enabled if the user has permission to create teams', () => {
      cy.intercept(
        { method: 'OPTIONS', url: '/api/v2/teams' },
        {
          statusCode: 200,
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
      cy.intercept({ method: 'GET', url: '/api/v2/teams/*' }, { fixture: 'teams.json' });
      cy.mount(<Teams />);
      cy.contains('a', /^Create team$/).should('have.attr', 'aria-disabled', 'false');
    });
  });

  describe('Empty list', () => {
    it('Empty state is displayed correctly for user with permission to create teams', () => {
      cy.intercept(
        { method: 'OPTIONS', url: '/api/v2/teams' },
        {
          statusCode: 200,
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
      cy.intercept({ method: 'GET', url: '/api/v2/teams/*' }, { fixture: 'emptyList.json' });
      cy.mount(<Teams />);
      cy.contains(/^There are currently no teams added to your organization.$/);
      cy.contains(/^Please create a team by using the button below.$/);
      cy.contains('button', /^Create team$/).should('be.visible');
    });

    it('Empty state is displayed correctly for user without permission to create teams', () => {
      cy.intercept(
        { method: 'OPTIONS', url: '/api/v2/teams' },
        { statusCode: 200, body: { actions: {} } }
      );
      cy.intercept({ method: 'GET', url: '/api/v2/teams/*' }, { fixture: 'emptyList.json' });
      cy.mount(<Teams />);
      cy.contains(/^You do not have permission to create a team$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains('button', /^Create team$/).should('not.exist');
    });
  });
});
