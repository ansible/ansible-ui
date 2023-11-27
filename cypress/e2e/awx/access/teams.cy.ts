/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Team } from '../../../../frontend/awx/interfaces/Team';
import { User } from '../../../../frontend/awx/interfaces/User';

describe('teams', function () {
  let team: Team;
  let user1: User;
  let user2: User;

  before(function () {
    cy.awxLogin();
  });

  beforeEach(function () {
    cy.createAwxTeam(this.globalProjectOrg as Organization).then((createdTeam) => {
      team = createdTeam;
    });
    cy.createAwxUser(this.globalProjectOrg as Organization).then((user) => {
      user1 = user;
    });
    cy.createAwxUser(this.globalProjectOrg as Organization).then((user) => {
      user2 = user;
    });
  });

  this.afterEach(function () {
    cy.deleteAwxUser(user1, { failOnStatusCode: false });
    cy.deleteAwxUser(user2, { failOnStatusCode: false });
    cy.deleteAwxTeam(team, { failOnStatusCode: false });
  });

  it('can render the teams list page', function () {
    cy.navigateTo('awx', 'teams');
    cy.verifyPageTitle('Teams');
  });

  it('can create a basic team', function () {
    const teamName = 'E2E Team ' + randomString(4);
    cy.intercept('POST', '/api/v2/teams/').as('newTeam');
    cy.navigateTo('awx', 'teams');
    cy.clickLink(/^Create team$/);
    cy.get('[data-cy="name"]').type(teamName);
    cy.selectDropdownOptionByResourceName(
      'organization',
      `${(this.globalProjectOrg as Organization).name}`
    );
    cy.clickButton(/^Create team$/);
    cy.wait('@newTeam')
      .its('response.body')
      .then((team: Team) => {
        cy.verifyPageTitle(team.name);
        cy.intercept('DELETE', `/api/v2/teams/${team.id}/`).as('deleted');
        cy.selectDetailsPageKebabAction('delete-team');
        cy.wait('@deleted')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(204);
          });
      });
  });

  it('can remove users from the team via the teams list row item', function () {
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

  it('can render the team details page', function () {
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.verifyPageTitle(team.name);
    cy.clickLink(/^Details$/);
    cy.get('[data-cy="name"]').should('contain', team.name);
  });

  it('can edit a team from the details page', function () {
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.clickButton(/^Edit team$/);
    cy.verifyPageTitle('Edit Team');
    cy.get('[data-cy="name"]')
      .clear()
      .type(team.name + 'a');
    cy.clickButton(/^Save team$/);
    cy.verifyPageTitle(`${team.name}a`);
  });

  it('can add users to the team via the team access tab toolbar', function () {
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Access$/, true);
    // Add users to team -> TODO: Replace with Wizard when it is ready
    cy.clickButton(/^Add users$/);
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
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

  it('can remove users from the team via the team access tab toolbar', function () {
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

  it('can remove a single user from the team via the team access tab row action', function () {
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

  it('can remove a role from a user via the team access tab row action', function () {
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

  it('can render the team roles page', function () {
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Roles$/, true);
    cy.url().should('contain', '/roles');
  });

  it('can navigate to the edit form from the team details page', function () {
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.verifyPageTitle(team.name);
    cy.clickButton(/^Edit team$/);
    cy.verifyPageTitle('Edit Team');
  });

  it('can delete a team from the details page', function () {
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.verifyPageTitle(team.name);
    cy.clickPageAction(/^Delete team/);
    cy.intercept('DELETE', `/api/v2/teams/${team.id}/`).as('deleted');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete team/);
    cy.wait('@deleted')
      .its('response')
      .then((response) => {
        expect(response?.statusCode).to.eql(204);
        cy.verifyPageTitle('Teams');
      });
  });

  it('can navigate to the edit form from the team list row item', function () {
    cy.navigateTo('awx', 'teams');
    cy.clickTableRowPinnedAction(team.name, 'edit-team');
    cy.verifyPageTitle('Edit Team');
  });

  it('can delete a team from the teams list row item', function () {
    cy.createAwxTeam(this.globalProjectOrg as Organization).then((testTeam) => {
      cy.navigateTo('awx', 'teams');
      cy.clickTableRowKebabAction(testTeam.name, /^Delete team$/);
      cy.get('#confirm').click();
      cy.intercept('DELETE', `/api/v2/teams/${testTeam.id}/`).as('deleted');
      cy.clickButton(/^Delete team/);
      cy.wait('@deleted')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clickButton(/^Clear all filters$/);
        });
    });
  });

  it('can delete a team from the teams list toolbar', function () {
    cy.createAwxTeam(this.globalProjectOrg as Organization).then((testTeam) => {
      cy.navigateTo('awx', 'teams');
      cy.selectTableRow(testTeam.name);
      cy.clickToolbarKebabAction(/^Delete selected teams$/);
      cy.get('#confirm').click();
      cy.intercept('DELETE', `/api/v2/teams/${testTeam.id}/`).as('deleted');
      cy.clickButton(/^Delete team/);
      cy.wait('@deleted')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clickButton(/^Clear all filters$/);
        });
    });
  });
});
