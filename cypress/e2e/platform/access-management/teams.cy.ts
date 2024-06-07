import { randomString } from '../../../../framework/utils/random-string';
import { gatewayV1API } from '../../../../platform/api/gateway-api-utils';
import { PlatformOrganization } from '../../../../platform/interfaces/PlatformOrganization';
import { PlatformTeam } from '../../../../platform/interfaces/PlatformTeam';
import { PlatformUser } from '../../../../platform/interfaces/PlatformUser';
import { randomE2Ename } from '../../../support/utils';

describe('Platform Teams - create, edit and delete with existing global platform organization', function () {
  let platformTeam: PlatformTeam;

  beforeEach(function () {
    cy.platformLogin();
    cy.createPlatformTeam({
      organization: (this.globalPlatformOrganization as PlatformOrganization).id,
    }).then((testPlatformTeam: PlatformTeam) => {
      platformTeam = testPlatformTeam;
    });
    cy.navigateTo('platform', 'teams');
    cy.verifyPageTitle('Teams');
    cy.setTableView('table');
  });

  afterEach(() => {
    cy.deletePlatformTeam(platformTeam, { failOnStatusCode: false });
  });

  it('can create a basic team in the ui', function () {
    const globalPlatformOrganization = this.globalPlatformOrganization as PlatformOrganization;
    cy.intercept('POST', gatewayV1API`/teams/`).as('createPlatformTeam');
    cy.containsBy('a', 'Create team').click();
    const teamName = randomE2Ename();
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

  it('edits a team with a user from the list view and delete it from the ui', function () {
    const globalPlatformOrganization = this.globalPlatformOrganization as PlatformOrganization;
    cy.createPlatformUser({ organizations: [globalPlatformOrganization.id] }).then(
      (createdPlatformUser: PlatformUser) => {
        cy.createPlatformTeam({
          name: `E2E Platform Team ${randomString(5)}`,
          organization: globalPlatformOrganization.id,
        }).then((createdPlatformTeam: PlatformTeam) => {
          cy.associateUsersWithPlatformTeam(createdPlatformTeam, [createdPlatformUser]).then(() => {
            cy.getTableRowByText(createdPlatformTeam.name).within(() => {
              cy.get('#edit-team').click();
            });
            cy.verifyPageTitle('Edit team');
            cy.get('[data-cy="name"]')
              .clear()
              .type(`${createdPlatformTeam.name} edited from list page`);
            cy.clickButton(/^Save team$/);
            cy.verifyPageTitle('Teams');
            cy.clickButton(/^Clear all filters$/);
            cy.searchAndDisplayResource(`${createdPlatformTeam.name} edited from list page`).then(
              () => {
                cy.get('tbody tr').should('have.length', 1);
                cy.get('td[data-cy="name-column-cell"] a').should(
                  'contain',
                  `${createdPlatformTeam.name} edited from list page`
                );
              }
            );
            cy.clickButton(/^Clear all filters$/);
            cy.intercept('DELETE', gatewayV1API`/teams/${createdPlatformTeam.id.toString()}/`).as(
              'deleteTeam'
            );
            cy.clickTableRowKebabAction(
              `${createdPlatformTeam.name} edited from list page`,
              'delete-team'
            );
            cy.clickModalConfirmCheckbox();
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
        cy.deletePlatformUser(createdPlatformUser, { failOnStatusCode: false });
      }
    );
  });

  it('can edit a team with an org and a user from the details page and delete it from the ui', function () {
    const globalPlatformOrganization = this.globalPlatformOrganization as PlatformOrganization;
    cy.createPlatformUser({ organizations: [globalPlatformOrganization.id] }).then(
      (createdPlatformUser: PlatformUser) => {
        cy.createPlatformTeam({
          name: `E2E Platform Team ${randomString(5)}`,
          organization: globalPlatformOrganization.id,
          users: [createdPlatformUser.id],
        }).then((createdPlatformTeam: PlatformTeam) => {
          cy.associateUsersWithPlatformTeam(createdPlatformTeam, [createdPlatformUser]).then(() => {
            const platformTeam = createdPlatformTeam;
            cy.clickTableRow(platformTeam.name);
            cy.get('[data-cy="edit-team"]').click();
            cy.get('[data-cy="name"]')
              .clear()
              .type(`${platformTeam.name} edited from details page`);
            cy.get('[data-cy="Submit"]').click();
            cy.verifyPageTitle(`${platformTeam.name} edited from details page`);
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
        });
        cy.deletePlatformUser(createdPlatformUser, { failOnStatusCode: false });
      }
    );
  });

  it('can bulk delete a team from the teams list toolbar', function () {
    cy.createPlatformTeam({
      name: `E2E Platform Team ${randomString(5)}`,
      organization: (this.globalPlatformOrganization as PlatformOrganization).id,
    }).then((testPlatformTeam1: PlatformTeam) => {
      cy.createPlatformTeam({
        name: `E2E Platform Team ${randomString(5)}`,
        organization: (this.globalPlatformOrganization as PlatformOrganization).id,
      }).then((testPlatformTeam2: PlatformTeam) => {
        cy.selectTableRow(testPlatformTeam1.name);
        cy.selectTableRow(testPlatformTeam2.name);
        cy.clickToolbarKebabAction('delete-selected-teams');
        cy.get('#confirm').click();
        cy.intercept('DELETE', gatewayV1API`/teams/${testPlatformTeam1.id.toString()}/`).as(
          'deleteTeam1'
        );
        cy.intercept('DELETE', gatewayV1API`/teams/${testPlatformTeam2.id.toString()}/`).as(
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
});

describe('Platform Teams - tabs tests', function () {
  let platformTeam: PlatformTeam;

  beforeEach(function () {
    cy.platformLogin();
    cy.createPlatformTeam({
      name: `E2E Platform Team ${randomString(5)}`,
      organization: (this.globalPlatformOrganization as PlatformOrganization).id,
    }).then((testPlatformTeam: PlatformTeam) => {
      platformTeam = testPlatformTeam;
      cy.navigateTo('platform', 'teams');
      cy.verifyPageTitle('Teams');
      cy.setTableView('table');
    });
  });

  afterEach(() => {
    cy.deletePlatformTeam(platformTeam, { failOnStatusCode: false });
  });

  // tests for tabs Roles, Users, Administrators, and Resource Access

  // Team - Users Tab
  it('can add and remove users to the team via the team users tab', function () {
    const globalOrg = this.globalPlatformOrganization as PlatformOrganization;
    cy.createPlatformUser({ organizations: [globalOrg.id] }).then((user1) => {
      cy.createPlatformUser({ organizations: [globalOrg.id] }).then((user2) => {
        cy.createPlatformTeam({ organization: globalOrg.id }).then((team) => {
          cy.associateUsersWithPlatformTeam(team, [user1, user2]).then(() => {
            // Team Page
            cy.clickTableRowLink('name', team.name);

            // Team - Users Tab
            cy.clickTab('Users', true);

            // Add Users
            cy.getByDataCy('add-user(s)').click();
            cy.getModal().within(() => {
              cy.selectTableRowByCheckbox('username', user1.username);
              cy.selectTableRowByCheckbox('username', user2.username);
              cy.getBy('#submit').click();
            });
            cy.getModal().should('not.exist');

            // Remove User
            cy.clickTableRowAction('username', user1.username, 'remove-user', {
              inKebab: true,
            });
            cy.getModal().within(() => {
              cy.getBy('#confirm').click();
              cy.getBy('#submit').click();
              cy.clickButton(/^Close$/);
            });
            cy.getModal().should('not.exist');

            cy.deletePlatformTeam(team, { failOnStatusCode: false });
          });
        });
        cy.deletePlatformUser(user2, { failOnStatusCode: false });
      });
      cy.deletePlatformUser(user1, { failOnStatusCode: false });
    });
  });

  // Team - Administrators Tab
  it('can add and remove users as administrators to the team from the administrators tab', function () {
    const globalOrg = this.globalPlatformOrganization as PlatformOrganization;
    cy.createPlatformUser({ organizations: [globalOrg.id] }).then((user1) => {
      cy.createPlatformUser({ organizations: [globalOrg.id] }).then((user2) => {
        cy.createPlatformTeam({ organization: globalOrg.id }).then((team) => {
          cy.associateUsersWithPlatformTeam(team, [user1, user2]).then(() => {
            // Team Page
            cy.clickTableRowLink('name', team.name);

            // Team - Administrators Tab
            cy.clickTab('Administrators', true);

            // Add Administrators
            cy.getByDataCy('add-administrator(s)').click();
            cy.getModal().within(() => {
              cy.selectTableRowByCheckbox('username', user1.username);
              cy.selectTableRowByCheckbox('username', user2.username);
              cy.getBy('#submit').click();
            });
            cy.getModal().should('not.exist');

            // Remove Administrator
            cy.clickTableRowAction('username', user1.username, 'remove-administrator', {
              inKebab: true,
            });
            cy.getModal().within(() => {
              cy.getBy('#confirm').click();
              cy.getBy('#submit').click();
              cy.clickButton(/^Close$/);
            });
            cy.getModal().should('not.exist');

            // Clean up
            cy.deletePlatformTeam(team, { failOnStatusCode: false });
          });
        });
        cy.deletePlatformUser(user2, { failOnStatusCode: false });
      });
      cy.deletePlatformUser(user1, { failOnStatusCode: false });
    });
  });

  // Roles tab
  it.skip('can add and remove a role from a user via the team roles tab', function () {});
  // Resource Access tab
  it.skip('can add and remove resource access to the team from the resource access tab', function () {});
});
