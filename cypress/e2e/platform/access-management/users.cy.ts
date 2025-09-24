import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { PlatformOrganization } from '@ansible/platform-ui/interfaces/PlatformOrganization';
import { PlatformTeam } from '@ansible/platform-ui/interfaces/PlatformTeam';
import { PlatformUser } from '@ansible/platform-ui/interfaces/PlatformUser';
import { gatewayAPI } from '../../../support/formatApiPathForPlatform';

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
      cy.verifyPageTitle(createdPlatformUser.username);
      cy.clickTab(/^Back to Users$/, true, false);
      cy.selectTableRowByCheckbox('username', `edited-${createdPlatformUser.username}`);
      cy.clickToolbarKebabAction('delete-users');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete user/);
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
      cy.intercept('DELETE', gatewayAPI`/users/${createdPlatformUser.id.toString()}/`).as(
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
        cy.clickToolbarKebabAction('delete-users');
        cy.getModal().within(() => {
          cy.get('#confirm').click();
          cy.get('#submit').click();
          cy.contains(/^Success$/).should('be.visible');
        });
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });
});

describe('User Types - Creates Users of Type Normal, Platform Auditor and System Admin', () => {
  beforeEach(() => {
    cy.intercept('GET', gatewayAPI`/users/?order_by=username&page=1&page_size=10`).as('getUsers');
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
    cy.get('[style="display: flex;"] > [data-cy="usertype-form-group"]').click();
    cy.get('#ansible-automation-platform-administrator').click();
    cy.get('[data-cy="first-name"]').type(firstName);
    cy.get('[data-cy="last-name"]').type(lastName);
    cy.get('[data-cy="email"]').type(userEmail);
    cy.intercept('POST', gatewayAPI`/users/`).as('createdUser');
    cy.get('[data-cy="Submit"]').click();
    cy.wait('@createdUser')
      .its('response.body')
      .then((createdUser: PlatformUser) => {
        cy.verifyPageTitle(createdUser.username);
        cy.navigateTo('platform', 'users');
        cy.verifyPageTitle('Users');
        cy.selectTableRowByCheckbox('username', `${createdUser.username}`);
        cy.clickToolbarKebabAction('delete-users');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete user/);
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
    cy.get('[style="display: flex;"] > [data-cy="usertype-form-group"]').click();
    cy.get('#ansible-automation-platform-auditor').click();
    cy.get('[data-cy="first-name"]').type(firstName);
    cy.get('[data-cy="last-name"]').type(lastName);
    cy.get('[data-cy="email"]').type(userEmail);
    cy.intercept('POST', gatewayAPI`/users/`).as('createdUser');
    cy.get('[data-cy="Submit"]').click();
    cy.wait('@createdUser')
      .its('response.body')
      .then((createdUser: PlatformUser) => {
        cy.verifyPageTitle(createdUser.username);
        cy.get('[data-cy="user-type"]').should('contain', 'Platform auditor');
        cy.navigateTo('platform', 'users');
        cy.verifyPageTitle('Users');
        cy.selectTableRowByCheckbox('username', `${createdUser.username}`);
        cy.clickToolbarKebabAction('delete-users');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete user/);
      });
    cy.clickButton(/^Clear all filters$/);
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
      cy.get('[data-cy="assign-teams"]').should('be.visible').click();
      cy.getModal().within(() => {
        cy.filterTableByTextFilter('name', platformTeam.name, { disableFilterSelection: true });
        cy.selectTableRowByCheckbox('name', platformTeam.name, { disableFilter: true });
        cy.getBy('#submit').click();
      });
      cy.getModal().should('not.exist');
      cy.filterTableByTextFilter('name', platformTeam.name, { disableFilterSelection: true });
      cy.selectTableRowByCheckbox('name', platformTeam.name, { disableFilter: true });
      cy.clickToolbarKebabAction('remove-teams');
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.get('#submit').click();
        cy.contains(/^Success$/).should('be.visible');
      });
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
