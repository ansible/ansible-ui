import { gatewayAPI } from '@ansible/cypress/support/formatApiPathForPlatform';
import { PlatformUserTeams } from './PlatformUserTeams';

describe('User teams list', () => {
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayAPI`/users/5/teams/*`,
        },
        {
          fixture: 'emptyList.json',
        }
      );
    });

    it('Empty state is displayed', () => {
      cy.mount(<PlatformUserTeams />, {
        path: '/access/users/:id/*',
        initialEntries: ['/access/users/5/teams'],
      });

      cy.contains(/^No teams$/);
      cy.contains(
        /^To get started, assign teams to this user. This user will inherit roles assigned to these teams.$/
      );
    });
  });

  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayAPI`/users/5/teams/?*`,
        },
        {
          fixture: 'platformTeams.json',
        }
      );
    });

    it('Teams list renders', () => {
      cy.mount(<PlatformUserTeams />, {
        path: '/access/users/:id/*',
        initialEntries: ['/access/users/5/teams'],
      });

      cy.setTableView('table');
      cy.get('tbody').find('tr').should('have.length', 3);

      // Toolbar actions are visible & enabled
      cy.get(`[data-cy="assign-teams"]`).should('be.visible');
      cy.get('[data-cy="assign-teams"]').should('have.attr', 'aria-disabled', 'false');

      cy.get('.page-table-toolbar').within(() => {
        cy.get('.toggle-kebab').click();
        cy.document()
          .its('body')
          .find('.pf-v5-c-menu__content')
          .within(() => {
            cy.get('button')
              .contains(/^Remove teams$/)
              .should('be.visible');
          });
      });
    });
  });

  describe('Error retrieving list', () => {
    it('Displays error loading teams', () => {
      cy.intercept(
        {
          method: 'GET',
          url: gatewayAPI`/users/5/teams/*`,
        },
        { statusCode: 500 }
      );

      cy.mount(<PlatformUserTeams />, {
        path: '/access/users/:id/*',
        initialEntries: ['/access/users/5/teams'],
      });

      cy.contains('Error loading teams');
    });
  });
});
