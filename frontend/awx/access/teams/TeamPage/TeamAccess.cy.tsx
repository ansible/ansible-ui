import { Team } from '../../../interfaces/Team';

import { TeamAccess } from './TeamAccess';

describe('TeamAccess', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/role_user_assignments/*',
        hostname: 'localhost',
      },
      {
        fixture: 'roleUserAssignments.json',
      }
    );
    cy.intercept(
      {
        method: 'OPTIONS',
        url: '/api/v2/role_definitions/*',
        hostname: 'localhost',
      },
      {
        fixture: 'mock_options.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/role_team_assignments/*',
        hostname: 'localhost',
      },
      {
        fixture: 'roleTeamAssignments.json',
      }
    );
  });

  // it('Remove user row action is disabled due to lack of permissions', () => {
  //   cy.fixture('team').then((team: Team) => {
  //     team.summary_fields.user_capabilities.edit = false;
  //     cy.mount(
  //       <TeamAccess />,
  //       {} as { path: string; initialEntries: string[] },
  //       'activeUserSysAuditor.json'
  //     );
  //     cy.contains('td', 'user-2')
  //       .parent()
  //       .within(() => {
  //         cy.get('.pf-v5-c-dropdown__toggle').click();
  //         cy.get('.pf-v5-c-dropdown__menu-item')
  //           .contains('Remove user')
  //           .should('have.attr', 'aria-disabled', 'true');
  //       });
  //   });
  // });
  it('Attempting to delete member access brings up confirmation modal', () => {
    cy.fixture('team').then((team: Team) => {
      team.summary_fields.user_capabilities.edit = false;
      cy.mount(<TeamAccess />);
      cy.getTableRow('username', 'e2e').within(() => {
        cy.get(`button[data-cy="remove-role"]`).click();
      });
      cy.contains('Remove users').should('exist');
    });
  });
  it('Attempting to delete a team role brings up confirmation modal with a warning', () => {
    cy.fixture('team').then((team: Team) => {
      team.summary_fields.user_capabilities.edit = false;
      cy.mount(<TeamAccess />);
      cy.contains('tr', 'dev');
      cy.getTableRow('username', 'dev').within(() => {
        cy.get(`button[data-cy="remove-role"]`).click();
      });

      cy.contains('Remove users').should('exist');
    });
  });
  it.skip('If one/more selected users cannot be deleted, bulk confirmation dialog highlights this with a warning', () => {
    cy.intercept('POST', '/api/v2/users/**/roles/', cy.spy().as('removeUser'));

    cy.fixture('team').then(() => {
      cy.mount(<TeamAccess />);
      // Remove users
      cy.selectTableRow('admin', false); //  User cannot be removed as they are a system administrator
      cy.selectTableRow('user-2', false);
      cy.clickToolbarKebabAction('remove-users-from-teams');
      // Confirmation modal is displayed with a warning
      cy.get('.pf-v5-c-modal-box').within(() => {
        cy.hasAlert(
          '1 of the selected users cannot be deleted due to insufficient permissions.'
        ).should('exist');
        cy.contains('td', 'admin')
          .parent()
          .within(() => {
            cy.get('span.pf-v5-c-icon span.pf-m-warning').should('exist');
          });
        cy.get('#confirm').click();
        cy.clickButton(/^Remove user/);
        // Only 1 out of the 2 users is deleted
        cy.get('@removeUser').should('have.been.calledOnce');
      });
    });
  });
});
