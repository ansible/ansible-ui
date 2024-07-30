import { gatewayV1API } from '../../../../platform/api/gateway-api-utils';
import { PlatformOrganization } from '../../../../platform/interfaces/PlatformOrganization';
import { PlatformTeam } from '../../../../platform/interfaces/PlatformTeam';
import { PlatformUser } from '../../../../platform/interfaces/PlatformUser';
import { randomE2Ename } from '../../../support/utils';

describe('Platform Teams - Create, Edit and Delete', function () {
  let platformTeam: PlatformTeam;
  let platformOrganization: PlatformOrganization;

  beforeEach(function () {
    cy.createPlatformOrganization().then((org) => {
      platformOrganization = org;
      cy.createPlatformTeam({
        organization: platformOrganization.id,
      }).then((testPlatformTeam: PlatformTeam) => {
        platformTeam = testPlatformTeam;
      });
      cy.navigateTo('platform', 'teams');
      cy.verifyPageTitle('Teams');
      cy.setTableView('table');
    });
  });

  afterEach(() => {
    cy.deletePlatformOrganization(platformOrganization, { failOnStatusCode: false });
  });

  it('can create a basic team in the ui', function () {
    cy.intercept('POST', gatewayV1API`/teams/`).as('createPlatformTeam');
    cy.containsBy('a', 'Create team').click();
    const teamName = `Platform E2E Team ${randomE2Ename()}`;
    cy.getByDataCy('name').type(teamName);
    cy.singleSelectByDataCy('organization', `${platformOrganization.name}`);
    cy.getByDataCy('Submit').click();

    cy.wait('@createPlatformTeam')
      .its('response.body')
      .then((platformTeam: PlatformTeam) => {
        cy.verifyPageTitle(platformTeam.name);
        cy.intercept('DELETE', gatewayV1API`/teams/${platformTeam.id.toString()}/`).as(
          'deletePlatformTeam'
        );
        cy.selectDetailsPageKebabAction('delete-team');
        cy.wait('@deletePlatformTeam')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(204);
          });
      });
  });

  it('can edit a team with a user from the list view and delete it from the ui', function () {
    cy.createPlatformUser().then((createdPlatformUser: PlatformUser) => {
      cy.associateUsersWithPlatformTeam(platformTeam, [createdPlatformUser]).then(() => {
        cy.filterTableByTextFilter('name', platformTeam.name, { disableFilterSelection: true });
        cy.getTableRowByText(platformTeam.name).within(() => {
          cy.get('#edit-team').click();
        });
        cy.verifyPageTitle(`Edit ${platformTeam.name}`);
        cy.get('[data-cy="name"]').clear().type(`${platformTeam.name} edited from list page`);
        cy.clickButton(/^Save team$/);
        cy.verifyPageTitle('Teams');
        cy.clickButton(/^Clear all filters$/);
        cy.searchAndDisplayResource(`${platformTeam.name} edited from list page`).then(() => {
          cy.get('tbody tr').should('have.length', 1);
          cy.get('td[data-cy="name-column-cell"] a').should(
            'contain',
            `${platformTeam.name} edited from list page`
          );
        });
        cy.clickButton(/^Clear all filters$/);
        cy.intercept('DELETE', gatewayV1API`/teams/${platformTeam.id.toString()}/`).as(
          'deleteTeam'
        );
        cy.filterTableByTextFilter('name', `${platformTeam.name} edited from list page`, {
          disableFilterSelection: true,
        });
        cy.clickTableRowAction(
          'name',
          `${platformTeam.name} edited from list page`,
          'delete-team',
          { disableFilter: true, inKebab: true }
        );
        cy.clickModalConfirmCheckbox();
        cy.getModal().within(() => {
          cy.clickButton(/^Delete team/);
          cy.wait('@deleteTeam')
            .its('response')
            .then((response) => {
              expect(response?.statusCode).to.eql(204);
              cy.contains(/^Success$/);
              cy.clickButton(/^Close$/);
            });
        });
        cy.getModal().should('not.exist');
        cy.clickButton(/^Clear all filters$/);
      });
      cy.deletePlatformUser(createdPlatformUser, { failOnStatusCode: false });
    });
  });

  it('can edit a team with an org and a user from the details page and delete it from the ui', function () {
    cy.createPlatformUser().then((createdPlatformUser: PlatformUser) => {
      cy.associateUsersWithPlatformTeam(platformTeam, [createdPlatformUser]).then(() => {
        cy.clickTableRowLink('name', platformTeam.name, { disableFilter: true });
        cy.clickPageAction('edit-team');
        cy.verifyPageTitle(`Edit ${platformTeam.name}`);
        cy.getByDataCy('name').clear().type(`${platformTeam.name} edited from details page`);
        cy.getByDataCy('Submit').click();
        cy.verifyPageTitle(platformTeam.name);
        cy.clickPageAction('delete-team');
        cy.intercept('DELETE', gatewayV1API`/teams/${platformTeam.id.toString()}/`).as(
          'deleteTeam'
        );
        cy.get('#confirm').click();
        cy.clickButton(/^Delete team/);
        cy.wait('@deleteTeam')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(204);
          });
      });
      cy.deletePlatformUser(createdPlatformUser, { failOnStatusCode: false });
    });
  });

  it('can bulk delete a team from the teams list toolbar', function () {
    cy.createPlatformTeam({
      name: `Platform E2E Team ${randomE2Ename()}`,
      organization: platformOrganization.id,
    }).then((testPlatformTeam1: PlatformTeam) => {
      cy.selectTableRow(platformTeam.name);
      cy.selectTableRow(testPlatformTeam1.name);
      cy.clickToolbarKebabAction('delete-selected-teams');
      cy.get('#confirm').click();
      cy.intercept('DELETE', gatewayV1API`/teams/${platformTeam.id.toString()}/`).as('deleteTeam1');
      cy.intercept('DELETE', gatewayV1API`/teams/${testPlatformTeam1.id.toString()}/`).as(
        'deleteTeam2'
      );
      cy.clickButton(/^Delete team/);
      cy.wait(['@deleteTeam1', '@deleteTeam2']).then((deleteTeamArr) => {
        expect(deleteTeamArr[0]?.response?.statusCode).to.eql(204);
        expect(deleteTeamArr[1]?.response?.statusCode).to.eql(204);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });
});

describe('Platform Teams - Tabs Tests', function () {
  let platformTeam: PlatformTeam;
  let platformOrganization: PlatformOrganization;

  beforeEach(function () {
    cy.createPlatformOrganization().then((org) => {
      platformOrganization = org;
      cy.createPlatformTeam({
        name: `Platform E2E Team ${randomE2Ename()}`,
        organization: platformOrganization.id,
      }).then((testPlatformTeam: PlatformTeam) => {
        platformTeam = testPlatformTeam;
        cy.navigateTo('platform', 'teams');
        cy.verifyPageTitle('Teams');
        cy.setTableView('table');
      });
    });
  });

  afterEach(() => {
    cy.deletePlatformTeam(platformTeam, { failOnStatusCode: false });
    cy.deletePlatformOrganization(platformOrganization, { failOnStatusCode: false });
  });

  // tests for tabs Roles, Users, Administrators, and Resource Access

  // Team - Users Tab
  it('can add and remove users to the team via the team users tab', function () {
    cy.createPlatformUser().then((user1) => {
      cy.createPlatformUser().then((user2) => {
        cy.associateUsersWithPlatformOrganization(platformOrganization, [user1, user2]).then(() => {
          cy.associateUsersWithPlatformTeam(platformTeam, [user1, user2]).then(() => {
            cy.filterTableByTextFilter('name', platformTeam.name, { disableFilterSelection: true });
            cy.clickTableRowLink('name', platformTeam.name, { disableFilter: true });
            cy.clickTab('Users', true);
            cy.getByDataCy('add-user(s)').click();
            cy.getModal().within(() => {
              cy.selectTableRowByCheckbox('username', user1.username);
              cy.selectTableRowByCheckbox('username', user2.username);
              cy.getBy('#submit').click();
            });
            cy.getModal().should('not.exist');
            cy.clickTableRowAction('username', user1.username, 'remove-user', {
              inKebab: true,
            });
            cy.getModal().within(() => {
              cy.getBy('#confirm').click();
              cy.getBy('#submit').click();
              cy.clickButton(/^Close$/);
            });
            cy.getModal().should('not.exist');
          });
          cy.deletePlatformUser(user2, { failOnStatusCode: false });
        });
      });
      cy.deletePlatformUser(user1, { failOnStatusCode: false });
    });
  });

  // Team - Administrators Tab
  it('can add and remove users to the team from the administrators tab', function () {
    cy.createPlatformUser().then((user1) => {
      cy.createPlatformUser().then((user2) => {
        cy.associateUsersWithPlatformOrganization(platformOrganization, [user1, user2]).then(() => {
          cy.associateUsersWithPlatformTeam(platformTeam, [user1, user2]).then(() => {
            cy.filterTableByTextFilter('name', platformTeam.name, { disableFilterSelection: true });
            cy.clickTableRowLink('name', platformTeam.name, { disableFilter: true });
            cy.clickTab('Administrators', true);
            cy.getByDataCy('add-administrator(s)').click();
            cy.getModal().within(() => {
              cy.selectTableRowByCheckbox('username', user1.username);
              cy.selectTableRowByCheckbox('username', user2.username);
              cy.getBy('#submit').click();
            });
            cy.getModal().should('not.exist');
            cy.clickTableRowAction('username', user1.username, 'remove-administrator', {
              inKebab: true,
            });
            cy.getModal().within(() => {
              cy.getBy('#confirm').click();
              cy.getBy('#submit').click();
              cy.clickButton(/^Close$/);
            });
            cy.getModal().should('not.exist');
          });
          cy.deletePlatformUser(user2, { failOnStatusCode: false });
        });
      });
      cy.deletePlatformUser(user1, { failOnStatusCode: false });
    });
  });

  // Roles tab
  it.skip('can add and remove a role from a user via the team roles tab', function () {});
  // Resource Access tab
  it.skip('can add and remove resource access to the team from the resource access tab', function () {});
});
