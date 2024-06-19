/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Team } from '../../../../frontend/awx/interfaces/Team';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('teams', function () {
  let team: Team;
  let user1: AwxUser;
  let user2: AwxUser;

  before(function () {
    cy.awxLogin();
  });

  beforeEach(function () {
    cy.createAwxUser(this.globalOrganization as Organization).then((user) => {
      user1 = user;
      cy.createAwxTeam(this.globalOrganization as Organization).then((createdTeam) => {
        team = createdTeam;
        cy.giveUserTeamAccess(team.name, user1.id, 'Read');
      });
    });
    cy.createAwxUser(this.globalOrganization as Organization).then((user) => {
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
    cy.intercept('POST', awxAPI`/teams/`).as('newTeam');
    cy.navigateTo('awx', 'teams');
    cy.containsBy('a', /^Create team$/).click();
    cy.getByDataCy('name').type(teamName);
    cy.singleSelectByDataCy('organization', (this.globalOrganization as Organization).name);
    cy.getByDataCy('Submit').click();
    cy.wait('@newTeam')
      .its('response.body')
      .then((team: Team) => {
        cy.verifyPageTitle(team.name);
        cy.intercept('DELETE', awxAPI`/teams/${team.id.toString()}/`).as('deleted');
        cy.selectDetailsPageKebabAction('delete-team');
        cy.wait('@deleted')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(204);
          });
      });
  });

  it('can remove users from the team via the teams list row item', function () {
    cy.requestPost<AwxUser>(awxAPI`/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.requestPost<AwxUser>(awxAPI`/users/${user2.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });

    cy.navigateTo('awx', 'teams');

    // Remove users
    cy.filterTableByMultiSelect('name', [team.name]);
    cy.clickTableRowAction('name', team.name, 'remove-users', {
      inKebab: true,
      disableFilter: true,
    });

    // Select users
    cy.getModal().within(() => {
      cy.selectTableRowByCheckbox('username', user1.username);
      cy.selectTableRowByCheckbox('username', user2.username);
      cy.get('#submit').click();
    });

    // Confirm and remove users
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.get('#submit').click();
      cy.contains(/^Success$/).should('be.visible');
      cy.containsBy('button', /^Close$/).click();
    });

    // Verify modal is closed
    cy.getModal().should('not.exist');
  });

  it('can render the team details page', function () {
    cy.navigateTo('awx', 'teams');
    cy.filterTableByMultiSelect('name', [team.name]);
    cy.clickTableRowLink('name', team.name, { disableFilter: true });
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Details$/, true);
    cy.hasDetail('Name', team.name);
  });

  it('can edit a team from the details page', function () {
    cy.navigateTo('awx', 'teams');
    cy.filterTableByMultiSelect('name', [team.name]);
    cy.clickTableRowLink('name', team.name, { disableFilter: true });
    cy.clickButton(/^Edit team$/);
    cy.verifyPageTitle('Edit Team');
    cy.get('[data-cy="name"]')
      .clear()
      .type(team.name + 'a');
    cy.clickButton(/^Save team$/);
    cy.verifyPageTitle(`${team.name}a`);
  });

  // FLAKY_06_14_2024
  it.skip('can add users to the team via the team access tab toolbar', function () {
    cy.navigateTo('awx', 'teams');
    cy.filterTableByMultiSelect('name', [team.name]);
    cy.clickTableRowLink('name', team.name, { disableFilter: true });
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Users$/, true);
    cy.get('[data-cy="add-users"]').click();
    cy.getTableRow('username', `${user2.username}`).within(() => {
      cy.get('input[type="checkbox"]').click({ force: true });
    });
    cy.clickButton(/^Next$/);
    cy.getTableRow('name', 'Team Admin', {
      disableFilter: true,
      disableFilterSelection: true,
    }).within(() => {
      cy.get('input[type="checkbox"]').click({ force: true });
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Finish$/);
    cy.clickModalButton('Close');
    cy.getTableRow('username', user2.username, {
      disableFilter: true,
      disableFilterSelection: true,
    }).should('be.visible');

    cy.requestPost<AwxUser>(awxAPI`/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
      disassociate: true,
    });
    cy.requestPost<AwxUser>(awxAPI`/users/${user2.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
      disassociate: true,
    });
  });

  // FLAKY_06_14_2024
  it.skip('can remove users from the team via the team access tab toolbar', function () {
    cy.requestPost<AwxUser>(awxAPI`/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.requestPost<AwxUser>(awxAPI`/users/${user2.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.navigateTo('awx', 'teams');
    cy.filterTableByMultiSelect('name', [team.name]);
    cy.clickTableRowLink('name', team.name, { disableFilter: true });
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Users$/, true);
    // Remove users
    cy.getTableRow('username', `${user1.username}`).within(() => {
      cy.get('input[type="checkbox"]').click({ force: true });
    });
    cy.clickToolbarKebabAction('remove-selected-roles');
    cy.get('#confirm').click();
    cy.clickButton(/^Remove user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.get(`tr[data-cy=row-id-${user1.id}]`).should('not.exist');
  });

  it('can remove a role from a user via the team access tab row action', function () {
    cy.navigateTo('awx', 'teams');
    cy.filterTableByMultiSelect('name', [team.name]);
    cy.clickTableRowLink('name', team.name, { disableFilter: true });
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Users$/, true);
    cy.getTableRow('username', user1.username).within(() => {
      cy.get(`button[data-cy="remove-role"]`).click();
    });
    cy.contains('Remove users');
    cy.clickModalConfirmCheckbox();
    cy.clickButton('Remove users');
    cy.clickModalButton('Close');
    cy.get('tbody').within(() => {
      cy.get('tr').should('not.have.length');
    });
  });

  it('can render the team roles page', function () {
    cy.navigateTo('awx', 'teams');
    cy.filterTableByMultiSelect('name', [team.name]);
    cy.clickTableRowLink('name', team.name, { disableFilter: true });
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Roles$/, true);
    cy.url().should('contain', '/roles');
  });

  it('can navigate to the edit form from the team details page', function () {
    cy.navigateTo('awx', 'teams');
    cy.filterTableByMultiSelect('name', [team.name]);
    cy.clickTableRowLink('name', team.name, { disableFilter: true });
    cy.verifyPageTitle(team.name);
    cy.clickButton(/^Edit team$/);
    cy.verifyPageTitle('Edit Team');
  });

  it('can delete a team from the details page', function () {
    cy.navigateTo('awx', 'teams');
    cy.filterTableByMultiSelect('name', [team.name]);
    cy.clickTableRowLink('name', team.name, { disableFilter: true });
    cy.verifyPageTitle(team.name);
    cy.clickPageAction('delete-team');
    cy.intercept('DELETE', awxAPI`/teams/${team.id.toString()}/`).as('deleted');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete team/);
    cy.wait('@deleted')
      .its('response')
      .then((response) => {
        expect(response?.statusCode).to.eql(204);
        cy.verifyPageTitle('Teams');
      });
  });

  // FLAKY_06_13_2024
  it.skip('can navigate to the edit form from the team list row item', function () {
    cy.navigateTo('awx', 'teams');
    cy.filterTableByMultiSelect('name', [team.name]);
    cy.clickTableRowAction('name', team.name, 'edit-team', { disableFilter: true });
    cy.verifyPageTitle('Edit Team');
  });

  it('can delete a team from the teams list row item', function () {
    cy.createAwxTeam(this.globalOrganization as Organization).then((testTeam) => {
      cy.navigateTo('awx', 'teams');
      cy.filterTableByMultiSelect('name', [testTeam.name]);
      cy.clickTableRowAction('name', testTeam.name, 'delete-team', {
        disableFilter: true,
        inKebab: true,
      });
      cy.get('#confirm').click();
      cy.intercept('DELETE', awxAPI`/teams/${testTeam.id.toString()}/`).as('deleted');
      cy.clickButton(/^Delete team/);
      cy.wait('@deleted')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clearAllFilters();
        });
    });
  });

  // FLAKY_06_19_2024
  it.skip('can delete a team from the teams list toolbar', function () {
    cy.createAwxTeam(this.globalOrganization as Organization).then((testTeam) => {
      cy.navigateTo('awx', 'teams');
      cy.filterTableByMultiSelect('name', [testTeam.name]);
      cy.selectTableRowByCheckbox('name', testTeam.name, { disableFilter: true });
      cy.clickToolbarKebabAction('delete-selected-teams');
      cy.get('#confirm').click();
      cy.intercept('DELETE', awxAPI`/teams/${testTeam.id.toString()}/`).as('deleted');
      cy.clickButton(/^Delete team/);
      cy.wait('@deleted')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clearAllFilters();
        });
    });
  });
});
