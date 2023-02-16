import { MemoryRouter } from 'react-router-dom';
import { PageDialogProvider } from '../../../../../framework';
import { ActiveUserProvider } from '../../../../common/useActiveUser';
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
      cy.mount(
        <MemoryRouter>
          <ActiveUserProvider>
            <TeamAccess team={team} />
          </ActiveUserProvider>
        </MemoryRouter>
      );
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
      cy.mount(
        <MemoryRouter>
          <ActiveUserProvider>
            <TeamAccess team={team} />
          </ActiveUserProvider>
        </MemoryRouter>
      );
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
      cy.mount(
        <MemoryRouter>
          <ActiveUserProvider>
            <PageDialogProvider>
              <TeamAccess team={team} />
            </PageDialogProvider>
          </ActiveUserProvider>
        </MemoryRouter>
      );
      const role = team.summary_fields.object_roles.read_role;
      cy.contains('tr', 'user-2')
        .get(`button[data-ouia-component-id="${role.name}-${role.id}"]`)
        .first()
        .click();
      cy.contains(`Are you sure you want to remove ${role.name} access from user-2?`).should(
        'be.visible'
      );
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
      cy.mount(
        <MemoryRouter>
          <ActiveUserProvider>
            <PageDialogProvider>
              <TeamAccess team={team} />
            </PageDialogProvider>
          </ActiveUserProvider>
        </MemoryRouter>
      );
      const role = team.summary_fields.object_roles.read_role;
      cy.contains('tr', 'user-2')
        .get(`button[data-ouia-component-id="team-role-${role.name}-${role.id}"]`)
        .first()
        .click();
      cy.contains(
        `Are you sure you want to remove ${role.name} access from Team 2 Org 0? Doing so affects all members of the team.`
      ).should('be.visible');
    });
  });
});
