import { randomString } from '../../../../framework/utils/random-string';
import { PlatformOrganization } from '../../../../platform/interfaces/PlatformOrganization';
import { PlatformUser } from '../../../../platform/interfaces/PlatformUser';
import { PlatformTeam } from '../../../../platform/interfaces/PlatformTeam';
import { gatewayV1API } from '../../../../platform/api/gateway-api-utils';

describe('Platform Teams - create, edit and delete with existing global platform organization', function () {
  let platformTeam: PlatformTeam;

  before(function () {
    cy.platformLogin();
  });

  beforeEach(function () {
    cy.createPlatformTeam({
      name: `E2E Platform Team ${randomString(5)}`,
      organization: (this.globalPlatformOrganization as PlatformOrganization).id,
      users: [],
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

  it('can create a team, with an organization and a single user', function () {
    cy.createPlatformOrganization().then((platformOrg: PlatformOrganization) => {
      cy.createPlatformUser(platformOrg).then((createdPlatformUser: PlatformUser) => {
        const teamName = `Platform E2E Team ${randomString(4)}`;
        cy.intercept('POST', gatewayV1API`/teams/`).as('createPlatformTeam');
        cy.containsBy('a', 'Create team').click();
        cy.getByDataCy('name').type(teamName);
        cy.singleSelectByDataCy('organization', `${platformOrg.name}`);
        cy.singleSelectBy('[data-cy="users"]', createdPlatformUser.username);
        cy.getByDataCy('Submit').click();
        cy.wait('@createPlatformTeam')
          .its('response.body')
          .then((platformTeam: PlatformTeam) => {
            cy.verifyPageTitle(platformTeam.name);
            //assert the organization assigned to the team is displayed on the details page
            cy.get('[data-cy="organization"]')
              .should('have.text', `${platformOrg.name}`)
              .should('have.visible');

            //assert the count of the assigned user to the team is displayed on the details page
            expect(platformTeam?.users?.length).to.equal(1);
            cy.contains('a[role="tab"]', 'Users')
              .click()
              .then(() => {
                //assert the users tab displays the user record and the user name
                cy.get('tbody tr').should('have.length', platformTeam?.users?.length);
                cy.get('td[data-cy="username-column-cell"] a').should(
                  'contain.text',
                  createdPlatformUser.username
                );
                cy.contains('a[role="tab"]', 'Details').click();

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
            cy.deletePlatformUser(createdPlatformUser, { failOnStatusCode: false });
          });
        cy.deletePlatformOrganization(platformOrg, { failOnStatusCode: false });
      });
    });
  });

  it('edits a team with a user from the list view and delete it from the ui', function () {
    const globalPlatformOrganization = this.globalPlatformOrganization as PlatformOrganization;
    cy.createPlatformUser(globalPlatformOrganization).then((createdPlatformUser: PlatformUser) => {
      cy.createPlatformTeam({
        name: `E2E Platform Team ${randomString(5)}`,
        organization: globalPlatformOrganization.id,
        users: [createdPlatformUser.id],
      }).then((createdPlatformTeam: PlatformTeam) => {
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
      cy.deletePlatformUser(createdPlatformUser, { failOnStatusCode: false });
    });
  });

  it('can edit a team with an org and a user from the details page and delete it from the ui', function () {
    const globalPlatformOrganization = this.globalPlatformOrganization as PlatformOrganization;
    cy.createPlatformUser(globalPlatformOrganization).then((createdPlatformUser: PlatformUser) => {
      cy.createPlatformTeam({
        name: `E2E Platform Team ${randomString(5)}`,
        organization: globalPlatformOrganization.id,
        users: [createdPlatformUser.id],
      }).then((createdPlatformTeam: PlatformTeam) => {
        const platformTeam = createdPlatformTeam;
        cy.clickTableRow(platformTeam.name);
        cy.get('[data-cy="edit-team"]').click();
        cy.get('[data-cy="name"]').clear().type(`${platformTeam.name} edited from details page`);
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
      cy.deletePlatformUser(createdPlatformUser, { failOnStatusCode: false });
    });
  });

  it('can bulk delete a team from the teams list toolbar', function () {
    cy.createPlatformTeam({
      name: `E2E Platform Team ${randomString(5)}`,
      organization: (this.globalPlatformOrganization as PlatformOrganization).id,
      users: [],
    }).then((testPlatformTeam1: PlatformTeam) => {
      cy.createPlatformTeam({
        name: `E2E Platform Team ${randomString(5)}`,
        organization: (this.globalPlatformOrganization as PlatformOrganization).id,
        users: [],
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

  it('edits a team from list view and associates multiple users, removes users, assert users are disassociated with the team', function () {
    //creates a team with global organization and user createdPlatformUser1 and associates createdPlatformUser2 and createdPlatformUser3
    //disassociates createdPlatformUser1 and createdPlatformUser2 from the team and asserts the users are disassociated with the team
    const globalPlatformOrganization = this.globalPlatformOrganization as PlatformOrganization;
    cy.createPlatformUser(globalPlatformOrganization).then((createdPlatformUser1: PlatformUser) => {
      cy.createPlatformTeam({
        name: `E2E Platform Team ${randomString(5)}`,
        organization: globalPlatformOrganization.id,
        users: [createdPlatformUser1.id],
      }).then((createdPlatformTeam: PlatformTeam) => {
        const platformTeamName = createdPlatformTeam.name;
        cy.createPlatformUser(globalPlatformOrganization).then(
          (createdPlatformUser2: PlatformUser) => {
            cy.createPlatformUser(globalPlatformOrganization).then(
              (createdPlatformUser3: PlatformUser) => {
                cy.getTableRowByText(platformTeamName).within(() => {
                  cy.get('#edit-team').click();
                });
                cy.verifyPageTitle('Edit team');
                cy.multiSelectBy('[data-cy="users"]', [
                  `${createdPlatformUser2.username}`,
                  `${createdPlatformUser3.username}`,
                ]);
                cy.intercept(
                  'PATCH',
                  gatewayV1API`/teams/${createdPlatformTeam.id.toString()}/`
                ).as('addPlatformTeamUsers');
                cy.getByDataCy('Submit').click();
                cy.wait('@addPlatformTeamUsers')
                  .its('response.body')
                  .then((platformTeam: PlatformTeam) => {
                    //assert the count of the associated users to the team is displayed on the details page
                    expect(platformTeam?.users?.length).to.equal(platformTeam?.users?.length);
                    cy.clickButton(/^Clear all filters$/);
                    cy.getTableRowByText(platformTeamName).within(() => {
                      cy.get('#edit-team').click();
                    });
                  });
                cy.intercept(
                  'PATCH',
                  gatewayV1API`/teams/${createdPlatformTeam.id.toString()}/`
                ).as('removePlatformTeamUsers');
                //disassociate the users createdPlatformUser2, createdPlatformUser3 from the team
                const expectedNames = [
                  `${createdPlatformUser2.username}`,
                  `${createdPlatformUser3.username}`,
                ];

                expectedNames.forEach((name) => {
                  cy.get('span.pf-v5-c-chip__content')
                    .contains(name)
                    .parent()
                    .within(() => {
                      cy.get('~ span.pf-v5-c-chip__actions').click();
                    });
                });
                cy.getByDataCy('Submit').click();
                cy.wait('@removePlatformTeamUsers')
                  .its('response.body')
                  .then((platformTeam: PlatformTeam) => {
                    cy.clickTableRow(platformTeam.name);
                    cy.contains('a[role="tab"]', 'Users')
                      .click()
                      .then(() => {
                        //assert the users count after the removal of the associated users
                        expect(platformTeam?.users?.length).to.equal(platformTeam?.users?.length);
                        //assert the users tab displays the user record and the user name
                        cy.get('tbody tr').should('have.length', platformTeam?.users?.length);
                      });

                    cy.intercept('DELETE', gatewayV1API`/teams/${platformTeam.id.toString()}/`).as(
                      'deletePlatformTeam'
                    );
                    cy.contains('a[role="tab"]', 'Details').click();
                    cy.selectDetailsPageKebabAction('delete-team');
                    cy.wait('@deletePlatformTeam')
                      .its('response')
                      .then((response) => {
                        expect(response?.statusCode).to.eql(204);
                      });
                    cy.deletePlatformUser(createdPlatformUser3, { failOnStatusCode: false });
                  });
              }
            );
            cy.deletePlatformUser(createdPlatformUser2, { failOnStatusCode: false });
          }
        );
      });
      cy.deletePlatformUser(createdPlatformUser1, { failOnStatusCode: false });
    });
  });
});

describe('Platform Teams - tabs tests', function () {
  let platformTeam: PlatformTeam;
  before(function () {
    cy.platformLogin();
  });

  beforeEach(function () {
    cy.createPlatformTeam({
      name: `E2E Platform Team ${randomString(5)}`,
      organization: (this.globalPlatformOrganization as PlatformOrganization).id,
      users: [],
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

  // Users tab
  it('can add and remove users to the team via the team users tab', function () {
    // 1. creates a team with global organization and the users createdUser1 and createdUser2
    // 2. add user createdUser3 to the team from the users tab
    // 3. remove user createdUser1 from the team users tab list row items
    const globalPlatformOrganization = this.globalPlatformOrganization as PlatformOrganization;
    cy.createPlatformUser(globalPlatformOrganization).then((createdUser1: PlatformUser) => {
      cy.createPlatformUser(globalPlatformOrganization).then((createdUser2: PlatformUser) => {
        cy.createPlatformUser(globalPlatformOrganization).then((createdUser3: PlatformUser) => {
          cy.createPlatformTeam({
            name: `E2E Platform Team ${randomString(5)}`,
            organization: globalPlatformOrganization.id,
            users: [createdUser1.id, createdUser2.id],
          }).then((createdPlatformTeam: PlatformTeam) => {
            cy.clickTableRowLink('name', createdPlatformTeam.name);
            cy.clickTab('Users', true);

            // search user createdUser3
            cy.intercept('GET', gatewayV1API`/users/?order_by=username&page=1&page_size=10`).as(
              'getUsers'
            );
            cy.getByDataCy('add-user(s)').click();

            // wait for the users call to be done done and load the users in the modal
            cy.wait('@getUsers');
            cy.searchAndDisplayResourceInModalPlatform(createdUser3.username);
            cy.intercept(
              'GET',
              gatewayV1API`/users/?username__contains=${createdUser3.username}&order_by=username&page=1&page_size=10`
            ).as('getUsersAfterSearch');

            cy.wait('@getUsersAfterSearch');
            cy.intercept(
              'POST',
              gatewayV1API`/teams/${createdPlatformTeam.id.toString()}/users/associate`
            ).as('associateUser3');
            cy.intercept(
              'GET',
              gatewayV1API`/teams/${createdPlatformTeam.id.toString()}/users/?order_by=username&page=1&page_size=10`
            ).as('getUsersList');
            cy.selectItemFromLookupModalPlatform();
            cy.wait('@getUsersList')
              .its('response.body.results')
              .then((results: PlatformUser[]) => {
                const usernames = results?.map((user) => user.username);
                expect(usernames).to.include(createdUser3.username);
              });
            cy.wait('@associateUser3')
              .its('response')
              .then((response) => {
                expect(response?.statusCode).to.eql(204);
              });
            cy.get('tr[data-cy^="row-id-"]').should('have.length', 3);
            cy.intercept(
              'POST',
              gatewayV1API`/teams/${createdPlatformTeam.id.toString()}/users/disassociate`
            ).as('disassociateUser1');
            cy.clickTableRowKebabAction(createdUser1.username, 'remove-user', false);
            cy.clickModalConfirmCheckbox();
            cy.clickButton(/^Remove users/);
            cy.wait('@disassociateUser1')
              .its('response')
              .then((response) => {
                expect(response?.statusCode).to.eql(204);
                cy.contains(/^Success$/);
                cy.clickButton(/^Close$/);
                cy.wait('@getUsersList')
                  .its('response.body.results')
                  .then((results: PlatformUser[]) => {
                    const usernames = results?.map((user) => user.username);
                    expect(usernames).to.not.include(createdUser1.username);
                  });
                cy.get('tr[data-cy^="row-id-"]').should('have.length', 2);
              });
            cy.deletePlatformUser(createdUser1, { failOnStatusCode: false });
            cy.deletePlatformUser(createdUser2, { failOnStatusCode: false });
            cy.deletePlatformUser(createdUser3, { failOnStatusCode: false });
            cy.deletePlatformTeam(createdPlatformTeam, { failOnStatusCode: false });
          });
        });
      });
    });
  });

  // Administrators tab
  it('can add and remove users as administrators to the team from the administrators tab', function () {
    // 1. creates a team with global organization with user createdUser1 createdUser2 as users in the team
    // createdPlatformTeam with user createdUser1 createdUser2
    // createdUser3 to be added as admins
    // 2. add user createdUser3 as administrator to the team from the Administrators tab
    // 3. remove users createdUser3 as admin of the team from the Administrators tab list items
    const globalPlatformOrganization = this.globalPlatformOrganization as PlatformOrganization;
    cy.createPlatformUser(globalPlatformOrganization).then((createdUser1: PlatformUser) => {
      cy.createPlatformUser(globalPlatformOrganization).then((createdUser2: PlatformUser) => {
        cy.createPlatformUser(globalPlatformOrganization).then((createdUser3: PlatformUser) => {
          cy.createPlatformTeam({
            name: `E2E Platform Team ${randomString(5)}`,
            organization: globalPlatformOrganization.id,
            users: [createdUser1.id, createdUser2.id],
          }).then((createdPlatformTeam: PlatformTeam) => {
            cy.clickTableRowLink('name', createdPlatformTeam.name);
            cy.clickTab('Administrators', true);

            // search first user createdUser1 and add as admin
            cy.intercept('GET', gatewayV1API`/users/?order_by=username&page=1&page_size=10`).as(
              'getUsers'
            );
            cy.getByDataCy('add-administrator(s)').click();

            // wait for the users call to be done done and load the users in the add admin modal
            cy.wait('@getUsers');
            cy.searchAndDisplayResourceInModalPlatform(createdUser3.username);
            cy.intercept(
              'GET',
              gatewayV1API`/users/?username__contains=${createdUser3.username}&order_by=username&page=1&page_size=10`
            ).as('getUsersAfterSearch');

            cy.wait('@getUsersAfterSearch');
            cy.intercept(
              'POST',
              gatewayV1API`/teams/${createdPlatformTeam.id.toString()}/admins/associate`
            ).as('associateUser3AsAdmin');
            cy.intercept(
              'GET',
              gatewayV1API`/teams/${createdPlatformTeam.id.toString()}/users/?order_by=username&page=1&page_size=10`
            ).as('getUsersList');
            cy.intercept(
              'GET',
              gatewayV1API`/teams/${createdPlatformTeam.id.toString()}/admins/?order_by=username&page=1&page_size=10`
            ).as('getAdminsList');
            cy.selectItemFromLookupModalPlatform();
            cy.wait('@associateUser3AsAdmin')
              .its('response')
              .then((response) => {
                expect(response?.statusCode).to.eql(204);
                cy.wait('@getAdminsList')
                  .its('response.body.results')
                  .then((results: PlatformUser[]) => {
                    const admins = results?.map((user) => user.username);
                    expect(admins).to.have.lengthOf(1);
                    expect(admins[0]).to.equal(createdUser3.username);
                    cy.get('tr[data-cy^="row-id-"]').should('have.length', 1);
                  });
              });
            cy.intercept(
              'POST',
              gatewayV1API`/teams/${createdPlatformTeam.id.toString()}/admins/disassociate`
            ).as('disassociateUser3AsAdmin');
            cy.clickTableRowKebabAction(createdUser3.username, 'remove-administrator', false);
            cy.clickModalConfirmCheckbox();
            cy.clickButton(/^Remove administrators/);
            cy.wait('@disassociateUser3AsAdmin')
              .its('response')
              .then((response) => {
                expect(response?.statusCode).to.eql(204);
                cy.contains(/^Success$/);
                cy.clickButton(/^Close$/);
                cy.wait('@getAdminsList')
                  .its('response.body.results')
                  .then((results: PlatformUser[]) => {
                    const admins = results?.map((user) => user.username);
                    expect(admins).to.have.lengthOf(0);
                  });
                cy.get('tr[data-cy^="row-id-"]').should('have.length', 0);
              });
            cy.deletePlatformUser(createdUser1, { failOnStatusCode: false });
            cy.deletePlatformUser(createdUser2, { failOnStatusCode: false });
            cy.deletePlatformUser(createdUser3, { failOnStatusCode: false });
            cy.deletePlatformTeam(createdPlatformTeam, { failOnStatusCode: false });
          });
        });
      });
    });
  });

  // Roles tab
  it.skip('can add and remove a role from a user via the team roles tab', function () {});
  // Resource Access tab
  it.skip('can add and remove resource access to the team from the resource access tab', function () {});
});
