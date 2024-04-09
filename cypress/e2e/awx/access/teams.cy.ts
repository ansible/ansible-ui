import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Team } from '../../../../frontend/awx/interfaces/Team';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('teams', function () {
  let team: Team;
  let user1: AwxUser;
  let user2: AwxUser;

  beforeEach(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
    });
    cy.navigateTo('awx', 'teams');
    cy.verifyPageTitle('Teams');
  });

  afterEach(() => {
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('can create a basic team, assert details page and then delete team', () => {
    const teamName = 'E2E Team ' + randomString(4);
    cy.intercept('POST', awxAPI`/teams/`).as('newTeam');
    cy.getByDataCy('create-team').click();
    cy.getByDataCy('name').type(teamName);
    cy.singleSelectByDataCy('organization', organization.name);
    cy.getByDataCy('Submit').click();
    cy.wait('@newTeam')
      .its('response.body')
      .then((thisTeam: Team) => {
        cy.verifyPageTitle(thisTeam.name);
        cy.url().then((currentUrl) => {
          expect(currentUrl.includes(`/access/teams/${thisTeam.id.toString()}/details`)).to.be.true;
        });
        cy.hasDetail('Name', thisTeam.name);
        cy.hasDetail('Organization', organization.name);
        cy.intercept('DELETE', awxAPI`/teams/${thisTeam.id.toString()}/`).as('deleted');
        cy.selectDetailsPageKebabAction('delete-team');
        cy.wait('@deleted')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(204);
          });
      });
  });
});

<<<<<<< HEAD
describe('Teams: Edit and Delete', () => {
  let team: Team;
  let organization: Organization;

  beforeEach(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxTeam(organization).then((createdTeam) => {
        team = createdTeam;
      });
=======
  it('can remove users from the team via the teams list row item', function () {
    cy.requestPost<AwxUser>(awxAPI`/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.requestPost<AwxUser>(awxAPI`/users/${user2.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
>>>>>>> 2614040b4 (ActiveUserProviders Fix and Streamline Providers and Hooks (#1961))
    });

    cy.navigateTo('awx', 'teams');
    cy.verifyPageTitle('Teams');
  });

  afterEach(() => {
    cy.deleteAwxTeam(team, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('can edit a team from the details page', () => {
    cy.filterTableBySingleSelect('name', team.name);
    cy.clickTableRowLink('name', team.name, { disableFilter: true });
    cy.verifyPageTitle(team.name);
    cy.hasDetail('Name', team.name);
    cy.hasDetail('Organization', organization.name);
    cy.clickButton(/^Edit team$/);
    cy.verifyPageTitle('Edit Team');
    cy.get('[data-cy="name"]')
      .clear()
      .type(team.name + '-edited');

    cy.intercept('PATCH', awxAPI`/teams/*/`).as('editTeam');
    cy.clickButton(/^Save team$/);
    cy.wait('@editTeam')
      .its('response.statusCode')
      .then((statusCode) => {
        expect(statusCode).to.eql(200);
      });
    cy.verifyPageTitle(`${team.name}-edited`);
  });

  it('can navigate to the edit form from the team list row item', () => {
    cy.filterTableBySingleSelect('name', team.name);
    cy.clickTableRowAction('name', team.name, 'edit-team', { disableFilter: true });
    cy.verifyPageTitle('Edit Team');
    cy.get('[data-cy="name"]')
      .clear()
      .type(team.name + '-edited');

    cy.intercept('PATCH', awxAPI`/teams/*/`).as('editTeam');
    cy.clickButton(/^Save team$/);
    cy.wait('@editTeam')
      .its('response.statusCode')
      .then((statusCode) => {
        expect(statusCode).to.eql(200);
      });
    cy.clearAllFilters();
    cy.filterTableBySingleSelect('name', `${team.name}-edited`);
  });

  it('can delete a team from the details page', () => {
    cy.filterTableBySingleSelect('name', team.name);
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

  it('can delete a team from the teams list row item', () => {
    cy.filterTableBySingleSelect('name', team.name);
    cy.clickTableRowAction('name', team.name, 'delete-team', {
      disableFilter: true,
      inKebab: true,
    });
    cy.get('#confirm').click();
    cy.intercept('DELETE', awxAPI`/teams/${team.id.toString()}/`).as('deleted');
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

describe('Teams: Add and Remove users', () => {
  let team: Team;
  let user1: AwxUser;
  let organization: Organization;

  beforeEach(() => {
    cy.createAwxOrganization().then((o) => {
      organization = o;
      cy.createAwxUser(organization).then((user) => {
        user1 = user;
        cy.createAwxTeam(organization).then((createdTeam) => {
          team = createdTeam;
          cy.giveUserTeamAccess(team.name, user1.id, 'Read');
        });
      });
    });
    cy.navigateTo('awx', 'teams');
    cy.verifyPageTitle('Teams');
  });

  afterEach(() => {
    cy.deleteAwxUser(user1, { failOnStatusCode: false });
    cy.deleteAwxTeam(team, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('can remove users from the team via the teams list row item', () => {
    cy.requestPost<AwxUser>(awxAPI`/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });

    // Remove users
    cy.filterTableBySingleSelect('name', team.name);
    cy.clickTableRowAction('name', team.name, 'remove-users', {
      inKebab: true,
      disableFilter: true,
    });

    // Select users
    cy.getModal().within(() => {
      cy.selectTableRowByCheckbox('username', user1.username);
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

  it('can add users to the team via the team access tab toolbar', () => {
    cy.filterTableBySingleSelect('name', team.name);
    cy.clickTableRowLink('name', team.name, { disableFilter: true });
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Users$/, true);
    cy.get('[data-cy="add-users"]').click();
    cy.getTableRow('username', `${user1.username}`).within(() => {
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
    cy.getTableRow('username', user1.username, {
      disableFilter: true,
      disableFilterSelection: true,
    }).should('be.visible');
  });

  it('can remove users from the team via the team access tab toolbar', () => {
    cy.requestPost<AwxUser>(awxAPI`/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });

    cy.filterTableBySingleSelect('name', team.name);
    cy.clickTableRowLink('name', team.name, { disableFilter: true });
    cy.verifyPageTitle(team.name);
<<<<<<< HEAD
    cy.clickTab(/^Users$/, true);
=======
    cy.clickTab(/^Access$/, true);
    // Add users to team -> TODO: Replace with Wizard when it is ready
    cy.clickButton(/^Add users$/);
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.filterTableByText(user1.username);
      cy.get(`[data-cy="row-id-${user1.id}"]`).find('input').click();
      cy.filterTableByText(user2.username);
      cy.get(`[data-cy="row-id-${user2.id}"]`).find('input').click();
    });
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.clickButton(/^Add/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
    });
    cy.getTableRowByText(user1.username).should('be.visible');
    cy.getTableRowByText(user2.username).should('be.visible');
    cy.requestPost<AwxUser>(awxAPI`/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
      disassociate: true,
    });
    cy.requestPost<AwxUser>(awxAPI`/users/${user2.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
      disassociate: true,
    });
    cy.clickButton(/^Clear all filters$/);
  });

  it('can remove users from the team via the team access tab toolbar', function () {
    cy.requestPost<AwxUser>(awxAPI`/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.requestPost<AwxUser>(awxAPI`/users/${user2.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Access$/, true);
>>>>>>> 2614040b4 (ActiveUserProviders Fix and Streamline Providers and Hooks (#1961))
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

<<<<<<< HEAD
  it('can remove a role from a user via the team access tab row action', () => {
    cy.filterTableBySingleSelect('name', team.name);
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
});

describe('Teams: Bulk delete', () => {
  let team: Team;
  let organization: Organization;
  const arrayOfElementText: string[] = [];

  beforeEach(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      for (let i = 0; i < 5; i++) {
        cy.createAwxTeam(organization).then((createdTeam) => {
          team = createdTeam;
          arrayOfElementText.push(team.name);
        });
      }
    });

    cy.navigateTo('awx', 'teams');
    cy.verifyPageTitle('Teams');
  });

  afterEach(() => {
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('can bulk delete teams from the teams list toolbar', () => {
    cy.filterTableByMultiSelect('name', arrayOfElementText);
    cy.get('tbody tr').should('have.length', 5);
    cy.getByDataCy('select-all').click();
    cy.clickToolbarKebabAction('delete-selected-teams');

=======
  it('can remove a single user from the team via the team access tab row action', function () {
    cy.requestPost<AwxUser>(awxAPI`/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.navigateTo('awx', 'teams');
    cy.clickTableRow(team.name);
    cy.verifyPageTitle(team.name);
    cy.clickTab(/^Access$/, true);
    cy.clickTableRowKebabAction(user1.username, 'remove-user');
    cy.get('#confirm').click();
    cy.clickButton(/^Remove user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
    cy.getTableRowByText(user1.username).should('not.exist');
    cy.clickButton(/^Clear all filters$/);
  });

  it('can remove a role from a user via the team access tab row action', function () {
    cy.requestPost<AwxUser>(awxAPI`/users/${user1.id.toString()}/roles/`, {
      id: team.summary_fields.object_roles.member_role.id,
    });
    cy.requestPost<AwxUser>(awxAPI`/users/${user1.id.toString()}/roles/`, {
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
    cy.requestPost<AwxUser>(awxAPI`/users/${user1.id.toString()}/roles/`, {
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
    cy.clickPageAction('delete-team');
    cy.intercept('DELETE', awxAPI`/teams/${team.id.toString()}/`).as('deleted');
>>>>>>> 2614040b4 (ActiveUserProviders Fix and Streamline Providers and Hooks (#1961))
    cy.get('#confirm').click();
    cy.intercept('DELETE', awxAPI`/teams/*/`).as('deleted');
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
