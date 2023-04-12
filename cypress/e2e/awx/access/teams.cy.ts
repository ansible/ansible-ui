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

    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxTeam(organization).then((createdTeam) => {
        team = createdTeam;
      });
      cy.createAwxUser(organization).then((user) => {
        user1 = user;
      });
      cy.createAwxUser(organization).then((user) => {
        user2 = user;
      });
    });
  });

  after(() => {
    cy.deleteAwxUser(user1);
    cy.deleteAwxUser(user2);
    cy.deleteAwxTeam(team);
    cy.deleteAwxOrganization(organization);
  });

  it('can render the teams list page', () => {
    cy.navigateTo(/^Teams$/);
    cy.hasTitle(/^Teams$/);
  });

  it('can create a basic team', () => {
    const teamName = 'E2E Team ' + randomString(4);
    cy.navigateTo(/^Teams$/);
    cy.clickLink(/^Create team$/);
    cy.typeInputByLabel(/^Name$/, teamName);
    cy.selectDropdownOptionByLabel(/^Organization$/, organization.name);
    cy.clickButton(/^Create team$/);
    cy.hasTitle(teamName); // This team will be cleaned up when we delete the org at the end of the tests
  });

  it('can remove users from the team via the teams list row item', () => {
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.requestPost<User>(`/api/v2/users/${user2.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.navigateTo(/^Teams$/);
    cy.clickTableRowAction(team.name, /^Remove users from team$/);
    cy.selectTableRowInDialog(user1.username);
    cy.selectTableRowInDialog(user2.username);
    cy.get('#confirm').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Remove user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
  });

  it('can render the team details page', () => {
    cy.navigateTo(/^Teams$/);
    cy.clickTableRow(team.name);
    cy.hasTitle(team.name);
    cy.clickButton(/^Details$/);
    cy.contains('#name', team.name);
  });

  it('can edit a team from the details page', () => {
    cy.navigateTo(/^Teams$/);
    cy.clickTableRow(team.name);
    cy.clickButton(/^Edit team$/);
    cy.hasTitle(/^Edit team$/);
    cy.typeInputByLabel(/^Name$/, team.name + 'a');
    cy.clickButton(/^Save team$/);
    cy.hasTitle(`${team.name}a`);
  });

  it('can add users to the team via the team access tab toolbar', () => {
    cy.navigateTo(/^Teams$/);
    cy.clickTableRow(team.name);
    cy.hasTitle(team.name);
    cy.clickTab(/^Access$/);
    // Add users to team -> TODO: Replace with Wizard when it is ready
    cy.clickButton(/^Add users$/);
    cy.selectTableRowInDialog(user1.username);
    cy.selectTableRowInDialog(user2.username);
    cy.clickButton(/^Add/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.getTableRowByText(user1.username).should('be.visible');
    cy.getTableRowByText(user2.username).should('be.visible');
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

  it('can remove users from the team via the team access tab toolbar', () => {
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.requestPost<User>(`/api/v2/users/${user2.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.navigateTo(/^Teams$/);
    cy.clickTableRow(team.name);
    cy.hasTitle(team.name);
    cy.clickTab(/^Access$/);
    // Remove users
    cy.selectTableRow(user1.username);
    cy.selectTableRow(user2.username);
    cy.clickButton(/^Remove users$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Remove user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.getTableRowByText(user1.username).should('not.exist');
    cy.getTableRowByText(user2.username).should('not.exist');
    cy.clickButton(/^Clear all filters$/);
  });

  it('can remove a single user from the team via the team access tab row action', () => {
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.navigateTo(/^Teams$/);
    cy.clickTableRow(team.name);
    cy.hasTitle(team.name);
    cy.clickTab(/^Access$/);
    cy.clickTableRowAction(user1.username, /^Remove user$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Remove user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
    cy.getTableRowByText(user1.username).should('not.exist');
    cy.clickButton(/^Clear all filters$/);
  });

  it('can remove a role from a user via the team access tab row action', () => {
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.read_role.id,
    });
    cy.navigateTo(/^Teams$/);
    cy.clickTableRow(team.name);
    cy.hasTitle(team.name);
    cy.clickTab(/^Access$/);
    cy.filterTableByTypeAndText(/^Name$/, user1.username);
    cy.contains('tr', user1.username)
      .find(
        `div[data-ouia-component-id="Read-${team.summary_fields.object_roles.read_role.id}"] button`
      )
      .click();
    cy.contains('Remove User Access');
    cy.clickButton('Delete');
    cy.filterTableByText(user1.username);
    cy.contains('tr', user1.username)
      .find(`div[data-ouia-component-id="Read-${team.summary_fields.object_roles.read_role.id}"]`)
      .should('not.exist');
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
      disassociate: true,
    });
  });

  it('can render the team roles page', () => {
    cy.navigateTo(/^Teams$/);
    cy.clickTableRow(team.name);
    cy.hasTitle(team.name);
    cy.clickTab(/^Roles$/);
  });

  it('can navigate to the edit form from the team details page', () => {
    cy.navigateTo(/^Teams$/);
    cy.clickTableRow(team.name);
    cy.hasTitle(team.name);
    cy.clickButton(/^Edit team$/);
    cy.hasTitle(/^Edit team$/);
  });

  it('can delete a team from the details page', () => {
    cy.createAwxTeam(organization).then((testTeam) => {
      cy.navigateTo(/^Teams$/);
      cy.clickTableRow(testTeam.name);
      cy.hasTitle(testTeam.name);
      cy.clickPageAction(/^Delete team/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete team/);
      cy.hasTitle(/^Teams$/);
    });
  });

  it('can navigate to the edit form from the team list row item', () => {
    cy.navigateTo(/^Teams$/);
    cy.clickTableRowAction(team.name, /^Edit team$/);
    cy.hasTitle(/^Edit team$/);
  });

  it('can delete a team from the teams list row item', () => {
    cy.createAwxTeam(organization).then((testTeam) => {
      cy.navigateTo(/^Teams$/);
      cy.clickTableRowAction(testTeam.name, /^Delete team$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete team/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('can delete a team from the teams list toolbar', () => {
    cy.createAwxTeam(organization).then((testTeam) => {
      cy.navigateTo(/^Teams$/);
      cy.selectTableRow(testTeam.name);
      cy.clickToolbarKebabAction(/^Delete selected teams$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete team/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
