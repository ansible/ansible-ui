import { randomString } from '../../../../framework/utils/random-string';
import { PlatformOrganization } from '../../../../platform/interfaces/PlatformOrganization';
import { PlatformUser } from '../../../../platform/interfaces/PlatformUser';
import { PlatformTeam } from '../../../../platform/interfaces/PlatformTeam';
import { gatewayV1API } from '../../../../platform/api/gateway-api-utils';

describe('Platform Teams - create, edit and delete with existing global platform organization', function () {
  let platformUser1: PlatformUser;
  let platformTeam1: PlatformTeam;
  let platformOrganization: PlatformOrganization;
  before(function () {
    cy.platformLogin();
    cy.createPlatformOrganization().then((platformOrg: PlatformOrganization) => {
      platformOrganization = platformOrg;
      cy.createPlatformTeam(platformOrganization).then((createdPlatformTeam: PlatformTeam) => {
        platformTeam1 = createdPlatformTeam;
        cy.createPlatformUser(platformOrganization).then((createdPlatformUser: PlatformUser) => {
          platformUser1 = createdPlatformUser;
        });
      });
    });
  });

  beforeEach(function () {
    cy.navigateTo('platform', 'teams');
    cy.verifyPageTitle('Teams');
  });

  after(function () {
    cy.deletePlatformUser(platformUser1, { failOnStatusCode: false });
    cy.deletePlatformTeam(platformTeam1, { failOnStatusCode: false });
    cy.deletePlatformOrganization(platformOrganization, { failOnStatusCode: false });
  });

  it('can create a basic team in the ui with no assigned user', function () {
    const globalPlatformOrganization = this.globalPlatformOrganization as PlatformOrganization;
    const teamName = `Platform E2E Team ${randomString(4)}`;
    cy.intercept('POST', gatewayV1API`/teams/`).as('createPlatformTeam');
    cy.containsBy('a', 'Create team').click();
    cy.getByDataCy('name').type(teamName);
    cy.singleSelectByDataCy('organization', `${globalPlatformOrganization.name}`);
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

  it('edits a team from the list view and delete it from the ui', function () {
    const globalPlatformOrganization = this.globalPlatformOrganization as PlatformOrganization;
    cy.createPlatformTeam(globalPlatformOrganization).then((createdPlatformTeam: PlatformTeam) => {
      const platformTeamName = createdPlatformTeam.name;
      cy.setTableView('table');
      cy.getTableRowByText(platformTeamName).within(() => {
        cy.get('#edit-team').click();
      });
      cy.verifyPageTitle('Edit team');
      cy.get('[data-cy="name"]').clear().type(`${platformTeamName} edited from list page`);
      cy.clickButton(/^Save team$/);
      cy.verifyPageTitle('Teams');
      cy.clickButton(/^Clear all filters$/);
      cy.searchAndDisplayResource(`${platformTeamName} edited from list page`).then(() => {
        cy.get('tbody tr').should('have.length', 1);
        cy.get('td[data-cy="name-column-cell"] a').should(
          'contain',
          `${platformTeamName} edited from list page`
        );
      });
      cy.clickButton(/^Clear all filters$/);
      cy.intercept('DELETE', gatewayV1API`/teams/${createdPlatformTeam.id.toString()}/`).as(
        'deleteTeam'
      );
      cy.clickTableRowKebabAction(`${platformTeamName} edited from list page`, 'delete-team');
      cy.clickModalConfirmCheckbox();
      cy.clickButton(/^Delete team/);
      cy.wait('@deleteTeam')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clickButton(/^Clear all filters$/);
          //assert resource does not exist in the search results
          cy.searchAndDisplayResource(`${platformTeamName} edited from list page`).then(() => {
            cy.contains('h2', 'No results found').should('be.visible');
            cy.contains(
              '.pf-v5-c-empty-state__body',
              'No results match this filter criteria. Clear all filters and try again.'
            ).should('be.visible');
          });
          cy.clickButton(/^Clear all filters$/);
        });
    });
  });

  it('can edit a team from the details page and delete it from the ui', function () {
    const globalPlatformOrganization = this.globalPlatformOrganization as PlatformOrganization;
    cy.createPlatformTeam(globalPlatformOrganization).then((createdPlatformTeam: PlatformTeam) => {
      const platformTeam = createdPlatformTeam;
      cy.setTableView('table');
      cy.clickTableRow(platformTeam.name);
      cy.get('[data-cy="edit-team"]').click();
      cy.get('[data-cy="name"]').clear().type(`${platformTeam.name} edited from details page`);
      cy.get('[data-cy="Submit"]').click();
      cy.verifyPageTitle(`${platformTeam.name} edited from details page`);
      cy.clickPageAction('delete-team');
      cy.intercept('DELETE', gatewayV1API`/teams/${platformTeam.id.toString()}/`).as('deleteTeam');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete team/);
      cy.wait('@deleteTeam')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
    });
  });

  it('can delete a team from the details page', function () {
    cy.createPlatformTeam(this.globalPlatformOrganization as PlatformOrganization).then(
      (testPlatformTeam: PlatformTeam) => {
        cy.setTableView('table');
        cy.clickTableRow(testPlatformTeam.name);
        cy.verifyPageTitle(testPlatformTeam.name);
        cy.clickPageAction('delete-team');
        cy.intercept('DELETE', gatewayV1API`/teams/${testPlatformTeam.id.toString()}/`).as(
          'deleteTeam'
        );
        cy.get('#confirm').click();
        cy.clickButton(/^Delete team/);
        cy.wait('@deleteTeam')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(204);
            cy.verifyPageTitle('Teams');
          });
      }
    );
  });

  it('can delete a team from the teams list row item', function () {
    cy.createPlatformTeam(this.globalPlatformOrganization as PlatformOrganization).then(
      (testPlatformTeam: PlatformTeam) => {
        cy.setTableView('table');
        cy.intercept('DELETE', gatewayV1API`/teams/${testPlatformTeam.id.toString()}/`).as(
          'deleteTeam'
        );
        cy.clickTableRowKebabAction(testPlatformTeam.name, 'delete-team');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete team/);
        cy.wait('@deleteTeam')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(204);
            cy.contains(/^Success$/);
            cy.clickButton(/^Close$/);
            cy.clickButton(/^Clear all filters$/);
          });
      }
    );
  });

  it('can delete a team from the teams list toolbar', function () {
    const globalPlatformOrganization = this.globalPlatformOrganization as PlatformOrganization;
    cy.createPlatformTeam(globalPlatformOrganization).then((testPlatformTeam: PlatformTeam) => {
      cy.setTableView('table');
      cy.selectTableRow(testPlatformTeam.name);
      cy.clickToolbarKebabAction('delete-selected-teams');
      cy.get('#confirm').click();
      cy.intercept('DELETE', gatewayV1API`/teams/${testPlatformTeam.id.toString()}/`).as(
        'deleteTeam'
      );
      cy.clickButton(/^Delete team/);
      cy.wait('@deleteTeam')
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

describe.skip('Platform Teams - create, edit and delete with new organization and user', function () {
  let platformUser: PlatformUser;
  let platformOrganization: PlatformOrganization;

  before(function () {
    cy.platformLogin();
  });

  beforeEach(function () {
    cy.navigateTo('platform', 'teams');
    cy.verifyPageTitle('Teams');
  });

  it('can create a team with an organization and a single user', function () {
    cy.createPlatformOrganization().then((platformOrg: PlatformOrganization) => {
      platformOrganization = platformOrg;
      cy.createPlatformUser().then((createdPlatformUser: PlatformUser) => {
        platformUser = createdPlatformUser;
        const teamName = `Platform E2E Team ${randomString(4)}`;
        cy.intercept('POST', gatewayV1API`/teams/`).as('createPlatformTeam');
        cy.containsBy('button', 'Create team').click();
        cy.getByDataCy('name').type(teamName);
        cy.singleSelectByDataCy('organization', `${platformOrganization.name}`);
        cy.singleSelectBy('[data-cy="users"]', platformUser.username);
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
        cy.deletePlatformUser(platformUser, { failOnStatusCode: false });
      });
      cy.deletePlatformOrganization(platformOrganization, { failOnStatusCode: false });
    });
  });
  // tests for tabs Roles, Users, Administrators, and Resource Access
  it.skip('can remove users from the team via the teams list row item', function () {});
  it.skip('can add users to the team via the team access tab toolbar', function () {});
  it.skip('can remove users from the team via the team access tab toolbar', function () {});
  it.skip('can remove a single user from the team via the team access tab row action', function () {});
  it.skip('can remove a role from a user via the team access tab row action', function () {});
  it.skip('can render the team roles page', function () {});
  it.skip('can add a role to a user via the team roles page', function () {});
  it.skip('can remove a role from a user via the team roles page', function () {});
});
