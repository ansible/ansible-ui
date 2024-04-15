import { Team } from '../../../interfaces/Team';

import { TeamAccessInner as TeamAccess } from './TeamAccess';

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
    cy.fixture('team').then((team: Team) => {
      team.summary_fields.user_capabilities.edit = false;
      cy.mount(
        <TeamAccess team={team} />,
        {} as { path: string; initialEntries: string[] },
        'activeUserSysAuditor.json'
      );
      cy.contains('button[id="add-users"]', 'Add users').should(
        'have.attr',
        'aria-disabled',
        'true'
      );
    });
  });
  it('Remove user row action is disabled due to lack of permissions', () => {
    cy.fixture('team').then((team: Team) => {
      team.summary_fields.user_capabilities.edit = false;
      cy.mount(
        <TeamAccess team={team} />,
        {} as { path: string; initialEntries: string[] },
        'activeUserSysAuditor.json'
      );
      cy.contains('td', 'user-2')
        .parent()
        .within(() => {
          cy.get('.pf-v5-c-dropdown__toggle').click();
          cy.get('.pf-v5-c-dropdown__menu-item')
            .contains('Remove user')
            .should('have.attr', 'aria-disabled', 'true');
        });
    });
  });
  it('Attempting to delete member access brings up confirmation modal', () => {
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
    cy.intercept('POST', '/api/v2/users/**/roles/', cy.spy().as('removeUser'));

    cy.fixture('team').then((team: Team) => {
      cy.mount(<TeamAccess team={team} />);
      // Remove users
      cy.selectTableRow('admin', false); //  User cannot be removed as they are a system administrator
      cy.selectTableRow('user-2', false);
      cy.clickToolbarKebabAction('remove-users');
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
