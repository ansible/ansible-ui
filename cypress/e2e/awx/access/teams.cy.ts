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
  });

  beforeEach(() => {
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
    cy.deleteAwxOrganization(organization);
  });

  it('can render the teams list page', () => {
    cy.navigateTo('awx', 'teams');
    cy.verifyPageTitle('Teams');
  });

  it('can create a basic team', () => {
    const teamName = 'E2E Team ' + randomString(4);
    cy.navigateTo('awx', 'teams');
    cy.clickLink(/^Create team$/);
    cy.get('[data-cy="name"]').type(teamName);
    cy.selectDropdownOptionByResourceName('organization', organization.name);
    cy.clickButton(/^Create team$/);
    cy.verifyPageTitle(teamName);
  });

  it('can remove users from the team via the teams list row item', () => {
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.requestPost<User>(`/api/v2/users/${user2.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.navigateTo('awx', 'teams');
    cy.searchAndDisplayResource(team.name);
    cy.get(`[data-cy="row-id-${team.id}"]`).within(() => {
      cy.get('[data-cy="actions-dropdown"]').click();
      cy.get('[data-cy="remove-users"]').click();
    });
    cy.get(`[data-cy="row-id-${user1.id}"]`).find('input').click();
    cy.get(`[data-cy="row-id-${user2.id}"]`).find('input').click();
    cy.get('#confirm').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Remove user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
  });

  it('can render the team details page', () => {
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.verifyPageTitle(team.name);
    cy.clickLink(/^Details$/);
    cy.contains('#name', team.name);
  });

  it('can edit a team from the details page', () => {
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.clickButton(/^Edit team$/);
    cy.verifyPageTitle('Edit Team');
    cy.get('[data-cy="name"]').type(team.name + 'a');
    cy.clickButton(/^Save team$/);
    cy.verifyPageTitle(`${team.name}a`);
  });

  it('can add users to the team via the team access tab toolbar', () => {
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Access$/, true);
    // Add users to team -> TODO: Replace with Wizard when it is ready
    cy.clickButton(/^Add users$/);
    cy.get('[data-ouia-component-type="PF4/ModalContent"]').within(() => {
      cy.filterTableByText(user1.username);
      cy.get(`[data-cy="row-id-${user1.id}"]`).find('input').click();
      cy.filterTableByText(user2.username);
      cy.get(`[data-cy="row-id-${user2.id}"]`).find('input').click();
    });
    cy.getDialog().within(() => {
      cy.clickButton(/^Add/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
    });
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
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Access$/, true);
    // Remove users
    cy.selectTableRow(user1.username);
    cy.selectTableRow(user2.username);
    cy.clickToolbarKebabAction(/^Remove users$/);
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
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Access$/, true);
    cy.clickTableRowKebabAction(user1.username, /^Remove user$/);
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
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Access$/, true);
    cy.filterTableByText(user1.username);
    cy.getTableRowByText(user1.username).within(() => {
      cy.get(
        `div[data-ouia-component-id="Read-${team.summary_fields.object_roles.read_role.id}"] button`
      ).click();
    });
    cy.contains('Remove user access');
    cy.clickButton('Delete');
    cy.filterTableByText(user1.username);
    cy.getTableRowByText(user1.username).within(() => {
      cy.get(
        `div[data-ouia-component-id="Read-${team.summary_fields.object_roles.read_role.id}"]`
      ).should('not.exist');
    });
    cy.requestPost<User>(`/api/v2/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
      disassociate: true,
    });
  });

  it('can render the team roles page', () => {
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Roles$/, true);
  });

  it('can navigate to the edit form from the team details page', () => {
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.verifyPageTitle(team.name);
    cy.clickButton(/^Edit team$/);
    cy.verifyPageTitle('Edit Team');
  });

  it('can delete a team from the details page', () => {
    cy.createAwxTeam(organization).then((testTeam) => {
      cy.navigateTo('awx', 'teams');
      cy.clickTableRow(testTeam.name);
      cy.verifyPageTitle(testTeam.name);
      cy.clickPageAction(/^Delete team/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete team/);
      cy.verifyPageTitle('Teams');
    });
  });

  it('can navigate to the edit form from the team list row item', () => {
    cy.navigateTo('awx', 'teams');
    cy.clickTableRowPinnedAction(team.name, 'edit-team');
    cy.verifyPageTitle('Edit Team');
  });

  it('can delete a team from the teams list row item', () => {
    cy.createAwxTeam(organization).then((testTeam) => {
      cy.navigateTo('awx', 'teams');
      cy.clickTableRowKebabAction(testTeam.name, /^Delete team$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete team/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('can delete a team from the teams list toolbar', () => {
    cy.createAwxTeam(organization).then((testTeam) => {
      cy.navigateTo('awx', 'teams');
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
