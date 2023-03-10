/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Team } from '../../../../frontend/awx/interfaces/Team';
import { User } from '../../../../frontend/awx/interfaces/User';

describe('teams', () => {
  let organization: Organization;
  let team: Team;
  let user1: User;
  let user2: User;

  before(() => {
    cy.awxLogin();

    cy.requestPost<Organization>('/api/v2/organizations/', {
      name: 'E2E Teams ' + randomString(4),
    }).then((testOrg) => {
      organization = testOrg;
      // Create users for testing access UI
      cy.requestPost<User>(`/api/v2/organizations/${organization.id.toString()}/users/`, {
        username: 'e2e-user-' + randomString(4),
        is_superuser: false,
        is_system_auditor: false,
        password: 'pw',
        user_type: 'normal',
      }).then((testUser) => (user1 = testUser));
      cy.requestPost<User>(`/api/v2/organizations/${organization.id.toString()}/users/`, {
        username: 'e2e-user-' + randomString(4),
        is_superuser: false,
        is_system_auditor: false,
        password: 'pw',
        user_type: 'normal',
      }).then((testUser) => (user2 = testUser));
    });
  });

  after(() => {
    cy.requestDelete(`/api/v2/users/${user1.id}/`, true);
    cy.requestDelete(`/api/v2/users/${user2.id}/`, true);
    cy.requestDelete(`/api/v2/organizations/${organization.id}/`, true);
  });

  beforeEach(() => {
    cy.requestPost<Team>('/api/v2/teams/', {
      name: 'E2E Team ' + randomString(4),
      organization: organization.id,
    }).then((testTeam) => (team = testTeam));
  });

  afterEach(() => {
    cy.requestDelete(`/api/v2/teams/${team.id}/`, true);
  });

  it('teams page', () => {
    cy.navigateTo(/^Teams$/, false);
    cy.hasTitle(/^Teams$/);
  });

  it('create team', () => {
    const teamName = 'E2E Team ' + randomString(4);
    cy.navigateTo(/^Teams$/, true);
    cy.clickButton(/^Create team$/);
    cy.typeByLabel(/^Name$/, teamName);
    cy.typeByLabel(/^Organization$/, organization.name);
    cy.clickButton(/^Create team$/);
    cy.hasTitle(teamName);
  });

  it('team: remove users from team', () => {
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.requestPost<User>(`/api/v2/users/${user2.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.navigateTo(/^Teams$/, true);
    cy.clickRowAction(team.name, /^Remove users from team$/);
    cy.selectRowInDialog(user1.username);
    cy.selectRowInDialog(user2.username);
    cy.get('#confirm').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Remove user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
  });

  it('edit team', () => {
    cy.navigateTo(/^Teams$/, true);
    cy.clickRow(team.name);
    cy.clickButton(/^Edit team$/);
    cy.hasTitle(/^Edit team$/);
    cy.typeByLabel(/^Name$/, 'a');
    cy.clickButton(/^Save team$/);
    cy.hasTitle(`${team.name}a`);
  });

  it('team details', () => {
    cy.navigateTo(/^Teams$/, true);
    cy.clickRow(team.name);
    cy.hasTitle(team.name);
    cy.clickButton(/^Details$/);
    cy.contains('#name', team.name);
  });

  it('team access: add users using toolbar button', () => {
    cy.navigateTo(/^Teams$/, true);
    cy.clickRow(team.name);
    cy.hasTitle(team.name);
    cy.clickTab(/^Access$/);
    // Add users to team -> TODO: Replace with Wizard when it is ready
    cy.clickButton(/^Add users$/);
    cy.selectRowInDialog(user1.username);
    cy.selectRowInDialog(user2.username);
    cy.clickButton(/^Add/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.getRowFromList(user1.username).should('be.visible');
    cy.getRowFromList(user2.username).should('be.visible');
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
      disassociate: true,
    });
    cy.requestPost<User>(`/api/v2/users/${user2.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
      disassociate: true,
    });
    cy.clickButton(/^Clear all filters$/);
  });

  it('team access: remove users using toolbar button', () => {
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.requestPost<User>(`/api/v2/users/${user2.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.navigateTo(/^Teams$/, true);
    cy.clickRow(team.name);
    cy.hasTitle(team.name);
    cy.clickTab(/^Access$/);
    // Remove users
    cy.selectRow(user1.username);
    cy.selectRow(user2.username);
    cy.clickButton(/^Remove users$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Remove user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.getRowFromList(user1.username).should('not.exist');
    cy.getRowFromList(user2.username).should('not.exist');
    cy.clickButton(/^Clear all filters$/);
  });

  it('team access: remove a single user using the row action', () => {
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.navigateTo(/^Teams$/, true);
    cy.clickRow(team.name);
    cy.hasTitle(team.name);
    cy.clickTab(/^Access$/);
    cy.clickRowAction(user1.username, /^Remove user$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Remove user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
    cy.getRowFromList(user1.username).should('not.exist');
    cy.clickButton(/^Clear all filters$/);
  });

  it('team access: remove a role from user', () => {
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.read_role.id,
    });
    cy.navigateTo(/^Teams$/, true);
    cy.clickRow(team.name);
    cy.hasTitle(team.name);
    cy.clickTab(/^Access$/);
    cy.filterByText(user1.username);
    cy.contains('tr', user1.username)
      .find(
        `div[data-ouia-component-id="Read-${team.summary_fields.object_roles.read_role.id}"] button`
      )
      .click();
    cy.contains('Remove User Access');
    cy.clickButton('Delete');
    cy.filterByText(user1.username);
    cy.contains('tr', user1.username)
      .find(`div[data-ouia-component-id="Read-${team.summary_fields.object_roles.read_role.id}"]`)
      .should('not.exist');
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
      disassociate: true,
    });
  });

  it('team roles', () => {
    cy.navigateTo(/^Teams$/, true);
    cy.clickRow(team.name);
    cy.hasTitle(team.name);
    cy.clickTab(/^Roles$/);
  });

  it('team details edit team', () => {
    cy.navigateTo(/^Teams$/, true);
    cy.clickRow(team.name);
    cy.hasTitle(team.name);
    cy.clickButton(/^Edit team$/);
    cy.hasTitle(/^Edit team$/);
    cy.typeByLabel(/^Name$/, 'a');
    cy.clickButton(/^Save team$/);
    cy.hasTitle(`${team.name}a`);
  });

  it('team details delete team', () => {
    cy.navigateTo(/^Teams$/, true);
    cy.clickRow(team.name);
    cy.hasTitle(team.name);
    cy.clickPageAction(/^Delete team/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete team/);
    cy.hasTitle(/^Teams$/);
  });

  it('teams table row edit team', () => {
    cy.navigateTo(/^Teams$/, true);
    cy.clickRowAction(team.name, /^Edit team$/);
    cy.hasTitle(/^Edit team$/);
  });

  it('teams table row delete team', () => {
    cy.navigateTo(/^Teams$/, true);
    cy.clickRowAction(team.name, /^Delete team$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete team/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('teams toolbar delete teams', () => {
    cy.navigateTo(/^Teams$/, true);
    cy.selectRow(team.name);
    cy.clickToolbarAction(/^Delete selected teams$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete team/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
