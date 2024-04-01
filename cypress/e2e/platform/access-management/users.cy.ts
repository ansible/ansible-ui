import { randomString } from '../../../../framework/utils/random-string';
import { gatewayV1API } from '../../../../platform/api/gateway-api-utils';
import { PlatformUser } from '../../../../platform/interfaces/PlatformUser';

describe('Users - create, edit and delete', () => {
  before(() => {
    cy.platformLogin();
  });

  beforeEach(() => {
    cy.navigateTo('platform', 'users');
    cy.verifyPageTitle('Users');
  });

  it('edits a user from the list view and delete it from the ui', () => {
    cy.createPlatformUser().then((createdPlatformUser: PlatformUser) => {
      cy.searchAndDisplayResourceByFilterOption(createdPlatformUser.username, 'username').then(
        () => {
          cy.clickTableRowAction('username', createdPlatformUser.username, 'edit-user', {
            inKebab: true,
          });
          cy.verifyPageTitle('Edit user');
          cy.get('[data-cy="username"]').clear().type(`edited-${createdPlatformUser.username}`);
          cy.get('[data-cy="Submit"]').click();
          cy.verifyPageTitle('Users');
          cy.filterTableBySingleText(`edited-${createdPlatformUser.username}`);
          cy.get('#select-all').click();
          cy.clickToolbarKebabAction('delete-selected-users');
          cy.get('#confirm').click();
          cy.clickButton(/^Delete user/);
          cy.clickButton('Close');
        }
      );
    });
  });

  it('edits a user from the details page and delete it from the ui', () => {
    cy.createPlatformUser().then((createdPlatformUser: PlatformUser) => {
      cy.searchAndDisplayResourceByFilterOption(createdPlatformUser.username, 'username').then(
        () => {
          cy.clickTableRowLink('username', createdPlatformUser.username);
          cy.contains('a[role="tab"]', 'Details').click();
          cy.get('[data-cy="edit-user"]').click();
          cy.verifyPageTitle('Edit user');
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
        }
      );
    });
  });

  it('bulk delete users from the toolbar action', () => {
    cy.createPlatformUser().then((createdPlatformUser1: PlatformUser) => {
      cy.createPlatformUser().then((createdPlatformUser2: PlatformUser) => {
        cy.searchAndDisplayResourceByFilterOption(createdPlatformUser1.username, 'username').then(
          () => {
            cy.get('td[data-cy="username-column-cell"]')
              .should('have.text', createdPlatformUser1.username)
              .parent('tr')
              .find('td[data-cy="checkbox-column-cell"]')
              .click();
          }
        );
        cy.clickButton(/^Clear all filters$/);
        cy.searchAndDisplayResourceByFilterOption(createdPlatformUser2.username, 'username').then(
          () => {
            cy.get('td[data-cy="username-column-cell"]')
              .should('have.text', createdPlatformUser2.username)
              .parent('tr')
              .find('td[data-cy="checkbox-column-cell"]')
              .click();
          }
        );
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

describe('User Types - creates users of type normal, system auditor and system admin', () => {
  before(() => {
    cy.platformLogin();
  });

  beforeEach(() => {
    cy.navigateTo('platform', 'users');
    cy.verifyPageTitle('Users');
  });

  it('create a user of type system auditor in the ui and delete it', () => {
    const userName = `platform-e2e-admin-${randomString(3).toLowerCase()}`;
    const firstName = `FirstName${randomString(2)}`;
    const lastName = `LastName ${randomString(2)}`;
    const userEmail = `user${randomString(3)}@email.com`;
    const password = 'password';

    cy.get('[data-cy="create-user"]').click();
    cy.get('[data-cy="username"]').type(userName);
    cy.get('[data-cy="password"]').type(password);
    cy.get('[data-cy="confirmpassword"]').type(password);
    cy.singleSelectByDataCy('usertype', 'System auditor');
    cy.get('[data-cy="first-name"]').type(firstName);
    cy.get('[data-cy="last-name"]').type(lastName);
    cy.get('[data-cy="email"]').type(userEmail);
    cy.intercept('POST', gatewayV1API`/users/`).as('createdUser');
    cy.get('[data-cy="Submit"]').click();
    cy.wait('@createdUser')
      .its('response.body')
      .then((createdUser: PlatformUser) => {
        cy.verifyPageTitle(createdUser.username);
        cy.log(createdUser.username);
        cy.navigateTo('platform', 'users');
        cy.verifyPageTitle('Users');
        cy.filterTableBySingleText(`${createdUser.username}`);
        cy.get('#select-all').click();
        cy.clickToolbarKebabAction('delete-selected-users');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete user/);
        cy.clickButton('Close');
      });
  });

  it('create a user of type system administrator in the ui and delete it', () => {
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
        cy.log(createdUser.username);
        cy.navigateTo('platform', 'users');
        cy.verifyPageTitle('Users');
        cy.filterTableBySingleText(`${createdUser.username}`);
        cy.get('#select-all').click();
        cy.clickToolbarKebabAction('delete-selected-users');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete user/);
        cy.clickButton('Close');
      });
  });

  it('admin creates a normal user, log in as normal user, and verify auth type is set to local', () => {
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
        cy.log(createdNormalUser.username);
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
        cy.searchAndDisplayResourceByFilterOption(createdNormalUser.username, 'username');
        cy.clickTableRowLink('username', createdNormalUser.username);

        cy.contains('a[role="tab"]', 'Details').click();
        // verify auth type is set to local
        cy.wait('@normalUser').then(() => {
          cy.contains('[data-cy="authentication-type"]', 'Local').should('be.visible');
        });
        // logout as normal user
        cy.platformLogout();
        // log back in as admin to delete newly created user
        cy.platformLogin();
        cy.navigateTo('platform', 'users');
        cy.deletePlatformUser(createdNormalUser, { failOnStatusCode: false });
      });
  });
});
