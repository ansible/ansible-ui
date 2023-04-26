import { Team } from '../../../interfaces/Team';
import { User } from '../../../interfaces/User';
import { TeamAccess } from './TeamAccess';

describe('TeamAccess', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/teams/81/access_list/*',
        hostname: 'localhost',
      },
      {
        fixture: 'teamAccessList.json',
      }
    );
  });
  it('Add users toolbar button is disabled due to lack of permissions', () => {
    cy.fixture('activeUser').then((activeUser: User) => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/me/',
          hostname: 'localhost',
        },
        {
          ...activeUser,
          is_superuser: false,
        }
      );
    });

    cy.fixture('team').then((team: Team) => {
      team.summary_fields.user_capabilities.edit = false;
      cy.mount(<TeamAccess team={team} />);
      cy.contains('button[id="add-users"]', 'Add users').should(
        'have.attr',
        'aria-disabled',
        'true'
      );
    });
  });
  it('Remove user row action is disabled due to lack of permissions', () => {
    cy.fixture('activeUser').then((activeUser: User) => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/me/',
          hostname: 'localhost',
        },
        {
          ...activeUser,
          is_superuser: false,
        }
      );
    });

    cy.fixture('team').then((team: Team) => {
      team.summary_fields.user_capabilities.edit = false;
      cy.mount(<TeamAccess team={team} />);
      cy.contains('td', 'user-2')
        .parent()
        .within(() => {
          cy.get('.pf-c-dropdown__toggle').click();
          cy.get('.pf-c-dropdown__menu-item')
            .contains('Remove user')
            .should('have.attr', 'aria-disabled', 'true');
        });
    });
  });
  it('Attempting to delete member access brings up confirmation modal', () => {
    cy.fixture('activeUser').then((activeUser: User) => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/me/',
          hostname: 'localhost',
        },
        {
          activeUser,
        }
      );
    });

    cy.fixture('team').then((team: Team) => {
      team.summary_fields.user_capabilities.edit = false;
      cy.mount(<TeamAccess team={team} />);
      const role = team.summary_fields.object_roles.read_role;
      cy.contains('tr', 'user-2')
        .get(`button[data-ouia-component-id="${role.name}-${role.id}"]`)
        .first()
        .click();
      cy.contains(
        `Are you sure you want to remove ${role.name.toLowerCase()} access from user-2?`
      ).should('exist');
    });
  });
  it('Attempting to delete a team role brings up confirmation modal with a warning', () => {
    cy.fixture('activeUser').then((activeUser: User) => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/me/',
          hostname: 'localhost',
        },
        {
          activeUser,
        }
      );
    });

    cy.fixture('team').then((team: Team) => {
      team.summary_fields.user_capabilities.edit = false;
      cy.mount(<TeamAccess team={team} />);
      const role = team.summary_fields.object_roles.read_role;
      cy.contains('tr', 'user-2')
        .get(`button[data-ouia-component-id="team-role-${role.name}-${role.id}"]`)
        .first()
        .click();
      cy.contains(
        `Are you sure you want to remove ${role.name.toLowerCase()} access from Team 2 Org 0? Doing so affects all members of the team.`
      ).should('exist');
    });
  });
  it('If one/more selected users cannot be deleted, bulk confirmation dialog highlights this with a warning', () => {
    cy.fixture('activeUser').then((activeUser: User) => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/me/',
          hostname: 'localhost',
        },
        {
          activeUser,
        }
      );
    });
    cy.intercept('POST', '/api/v2/users/**/roles/', cy.spy().as('removeUser'));

    cy.fixture('team').then((team: Team) => {
      cy.mount(<TeamAccess team={team} />);
      // Remove users
      cy.selectTableRow('admin'); //  User cannot be removed as they are a system administrator
      cy.selectTableRow('user-2');
      cy.clickButton(/^Remove users$/);
      // Confirmation modal is displayed with a warning
      cy.get('div[data-ouia-component-type="PF4/ModalContent"]').within(() => {
        cy.hasAlert(
          '{{count}} of the selected users cannot be deleted due to insufficient permissions.'
        ).should('exist');
        cy.contains('td', 'admin')
          .parent()
          .within(() => {
            cy.get('span.pf-c-icon span.pf-m-warning').should('exist');
          });
        cy.get('#confirm').click();
        cy.clickButton(/^Remove user/);
        // Only 1 out of the 2 users is deleted
        cy.get('@removeUser').should('have.been.calledOnce');
      });
    });
  });
});
