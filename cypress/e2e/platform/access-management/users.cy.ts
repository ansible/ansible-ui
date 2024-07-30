import { randomString } from '../../../../framework/utils/random-string';
import { gatewayV1API } from '../../../../platform/api/gateway-api-utils';
import { PlatformTeam } from '../../../../platform/interfaces/PlatformTeam';
import { PlatformUser } from '../../../../platform/interfaces/PlatformUser';
import { PlatformOrganization } from '../../../../platform/interfaces/PlatformOrganization';

describe('Users - Create, Edit and Delete', () => {
  beforeEach(() => {
    cy.navigateTo('platform', 'users');
    cy.verifyPageTitle('Users');
  });

  it('edits a user from the list view and deletes it from the ui', () => {
    cy.createPlatformUser().then((createdPlatformUser: PlatformUser) => {
      cy.clickTableRowAction('username', createdPlatformUser.username, 'edit-user', {
        inKebab: false,
      });
      cy.verifyPageTitle(`Edit ${createdPlatformUser.username}`);
      cy.get('[data-cy="username"]').clear().type(`edited-${createdPlatformUser.username}`);
      cy.get('[data-cy="Submit"]').click();
      cy.verifyPageTitle('Users');
      cy.selectTableRowByCheckbox('username', `edited-${createdPlatformUser.username}`);
      cy.clickToolbarKebabAction('delete-selected-users');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete user/);
      cy.clickButton('Close');
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('edits a user from the details page and deletes it from the ui', () => {
    cy.createPlatformUser().then((createdPlatformUser: PlatformUser) => {
      cy.clickTableRowLink('username', createdPlatformUser.username);
      cy.contains('a[role="tab"]', 'Details').click();
      cy.get('[data-cy="edit-user"]').click();
      cy.verifyPageTitle(`Edit ${createdPlatformUser.username}`);
      cy.get('[data-cy="username"]').clear().type(`edited-${createdPlatformUser.username}`);
      cy.get('[data-cy="Submit"]').click();
      cy.clickPageAction('delete-user');
      cy.intercept('DELETE', gatewayV1API`/users/${createdPlatformUser.id.toString()}/`).as(
        'deleteUser'
      );
      cy.get('#confirm').click();
      cy.clickButton(/^Delete user/);
      cy.wait('@deleteUser')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
    });
  });

  it('bulk deletes users from the toolbar action', () => {
    cy.createPlatformUser().then((createdPlatformUser1: PlatformUser) => {
      cy.createPlatformUser().then((createdPlatformUser2: PlatformUser) => {
        cy.selectTableRowByCheckbox('username', createdPlatformUser1.username);
        cy.selectTableRowByCheckbox('username', createdPlatformUser2.username);
        cy.clickToolbarKebabAction('delete-selected-users');
        cy.getModal().within(() => {
          cy.get('#confirm').click();
          cy.get('#submit').click();
          cy.contains(/^Success$/).should('be.visible');
          cy.containsBy('button', /^Close$/).click();
        });
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });
});

describe('User Types - Creates Users of Type Normal, Platform Auditor and System Admin', () => {
  beforeEach(() => {
    cy.intercept('GET', gatewayV1API`/users/?order_by=username&page=1&page_size=10`).as('getUsers');
    cy.navigateTo('platform', 'users');
    cy.wait('@getUsers');
    cy.verifyPageTitle('Users');
  });

  it('creates a system administrator in the ui and then deletes it', () => {
    const userName = `platform-e2e-admin-user-${randomString(3).toLowerCase()}`;
    const firstName = `FirstName${randomString(2)}`;
    const lastName = `LastName ${randomString(2)}`;
    const userEmail = `user${randomString(3)}@email.com`;
    const password = 'password';

    cy.get('[data-cy="create-user"]').click();
    cy.get('[data-cy="username"]').type(userName);
    cy.get('[data-cy="password"]').type(password);
    cy.get('[data-cy="confirmpassword"]').type(password);
    cy.singleSelectByDataCy('usertype', 'System administrator');
    cy.get('[data-cy="first-name"]').type(firstName);
    cy.get('[data-cy="last-name"]').type(lastName);
    cy.get('[data-cy="email"]').type(userEmail);
    cy.intercept('POST', gatewayV1API`/users/`).as('createdUser');
    cy.get('[data-cy="Submit"]').click();
    cy.wait('@createdUser')
      .its('response.body')
      .then((createdUser: PlatformUser) => {
        cy.verifyPageTitle(createdUser.username);
        cy.navigateTo('platform', 'users');
        cy.verifyPageTitle('Users');
        cy.selectTableRowByCheckbox('username', `${createdUser.username}`);
        cy.clickToolbarKebabAction('delete-selected-users');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete user/);
        cy.clickButton('Close');
      });
    cy.clickButton(/^Clear all filters$/);
  });

  it('creates a platform auditor in the ui and then deletes it', () => {
    const userName = `platform-e2e-auditor-user-${randomString(3).toLowerCase()}`;
    const firstName = `FirstName${randomString(2)}`;
    const lastName = `LastName ${randomString(2)}`;
    const userEmail = `user${randomString(3)}@email.com`;
    const password = 'password';

    cy.get('[data-cy="create-user"]').click();
    cy.get('[data-cy="username"]').type(userName);
    cy.get('[data-cy="password"]').type(password);
    cy.get('[data-cy="confirmpassword"]').type(password);
    cy.singleSelectByDataCy('usertype', 'Platform auditor');
    cy.get('[data-cy="first-name"]').type(firstName);
    cy.get('[data-cy="last-name"]').type(lastName);
    cy.get('[data-cy="email"]').type(userEmail);
    cy.intercept('POST', gatewayV1API`/users/`).as('createdUser');
    cy.get('[data-cy="Submit"]').click();
    cy.wait('@createdUser')
      .its('response.body')
      .then((createdUser: PlatformUser) => {
        cy.verifyPageTitle(createdUser.username);
        cy.get('[data-cy="user-type"]').should('contain', 'Platform auditor');
        cy.navigateTo('platform', 'users');
        cy.verifyPageTitle('Users');
        cy.selectTableRowByCheckbox('username', `${createdUser.username}`);
        cy.clickToolbarKebabAction('delete-selected-users');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete user/);
        cy.clickButton('Close');
      });
    cy.clickButton(/^Clear all filters$/);
  });

  it.skip('creates a normal user, logs in as the normal user, and verifies auth type is set to local', () => {
    const userName = `platform-e2e-normal-user-${randomString(3).toLowerCase()}`;
    const firstName = `FirstName${randomString(2)}`;
    const lastName = `LastName ${randomString(2)}`;
    const userEmail = `user${randomString(3)}@email.com`;
    const password = 'password';

    cy.get('[data-cy="create-user"]').click();
    cy.get('[data-cy="username"]').type(userName);
    cy.get('[data-cy="password"]').type(password);
    cy.get('[data-cy="confirmpassword"]').type(password);
    cy.get('[data-cy="first-name"]').type(firstName);
    cy.get('[data-cy="last-name"]').type(lastName);
    cy.get('[data-cy="email"]').type(userEmail);
    cy.intercept('POST', gatewayV1API`/users/`).as('createdUser');
    cy.get('[data-cy="Submit"]').click();
    cy.wait('@createdUser')
      .its('response.body')
      .then((createdNormalUser: PlatformUser) => {
        cy.verifyPageTitle(createdNormalUser.username);
        cy.platformLogout();
        // login as normal user credentials
        cy.get('[data-cy="username"]').type(createdNormalUser.username);
        cy.get('[data-cy="password"]').type(password);
        cy.get('[data-cy="Submit"]').click();
        cy.get('[data-ouia-component-id="account-menu"]').should(
          'contain',
          `${createdNormalUser.username}`
        );
        cy.navigateTo('platform', 'users');
        cy.verifyPageTitle('Users');
        cy.intercept('GET', gatewayV1API`/users/${createdNormalUser.id.toString()}/`).as(
          'normalUser'
        );
        cy.clickTableRowLink('username', createdNormalUser.username);

        cy.contains('a[role="tab"]', 'Details').click();
        // verify auth type is set to local
        cy.wait('@normalUser').then(() => {
          cy.contains('[data-cy="authentication-method"]', 'Local').should('be.visible');
        });
        // logout as normal user
        cy.platformLogout();
        // log back in as admin to delete newly created user
        cy.platformLogin();
        cy.intercept('GET', gatewayV1API`/users/?order_by=username&page=1&page_size=10`).as(
          'getUsers'
        );
        cy.navigateTo('platform', 'users');
        cy.wait('@getUsers').then(() => {
          cy.deletePlatformUser(createdNormalUser, { failOnStatusCode: false });
        });
      });
  });
});

describe('Users - Teams and Roles Tab Tests', () => {
  let platformTeam: PlatformTeam;
  let platformOrg: PlatformOrganization;
  beforeEach(function () {
    cy.createPlatformOrganization().then((org) => {
      platformOrg = org;
      cy.createPlatformTeam({
        organization: platformOrg.id,
      }).then((testPlatformTeam: PlatformTeam) => {
        platformTeam = testPlatformTeam;
      });
      cy.navigateTo('platform', 'users');
      cy.verifyPageTitle('Users');
    });
  });

  it('should add and remove a team from teams tab', () => {
    cy.createPlatformUser().then((createdPlatformUser: PlatformUser) => {
      cy.clickTableRowLink('username', createdPlatformUser.username);
      cy.clickTab('Teams', true);
      cy.get('[data-cy="add-team(s)"]').click();
      cy.getModal().within(() => {
        cy.filterTableByTextFilter('name', platformTeam.name, { disableFilterSelection: true });
        cy.selectTableRowByCheckbox('name', platformTeam.name, { disableFilter: true });
        cy.getBy('#submit').click();
      });
      cy.getModal().should('not.exist');
      cy.filterTableByTextFilter('name', platformTeam.name, { disableFilterSelection: true });
      cy.selectTableRowByCheckbox('name', platformTeam.name, { disableFilter: true });
      cy.clickToolbarKebabAction('remove-selected-teams');
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.get('#submit').click();
        cy.contains(/^Success$/).should('be.visible');
        cy.containsBy('button', /^Close$/).click();
      });
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
