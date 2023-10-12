/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { User } from '../../../../frontend/awx/interfaces/User';

describe('Users List Actions', () => {
  let organization: Organization;
  let user: User;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxUser(organization).then((testUser) => {
        user = testUser;
      });
    });
  });

  after(() => {
    cy.deleteAwxUser(user);
    cy.deleteAwxOrganization(organization);
  });

  it('renders the users list page', () => {
    cy.navigateTo('awx', 'users');
    cy.verifyPageTitle('Users');
  });

  it('creates and then deletes a basic user', () => {
    const userName = 'E2E_User_' + randomString(4);
    const password = randomString(12);
    cy.navigateTo('awx', 'users');
    cy.clickLink(/^Create user$/);
    cy.get('[data-cy="user-username"]').type(userName);
    cy.get('[data-cy="user-password"]').type(password);
    cy.get('[data-cy="confirmpassword"]').type(password);
    cy.get('[data-cy="user-summary-fields-organization-name"]').type(organization.name);
    cy.clickButton(/^Create user$/);
    cy.verifyPageTitle(userName);
    // Clean up this user
    cy.clickPageAction(/^Delete user/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.verifyPageTitle('Users');
  });

  it('renders the user details page', () => {
    cy.navigateTo('awx', 'users');
    cy.clickTableRow(user.username);
    cy.verifyPageTitle(user.username);
    cy.clickLink(/^Details$/);
    cy.contains('#username', user.username);
  });

  it('edits a user from the details page', () => {
    cy.navigateTo('awx', 'users');
    cy.clickTableRow(user.username);
    cy.verifyPageTitle(user.username);
    cy.clickButton(/^Edit user$/);
    cy.verifyPageTitle('Edit User');
    cy.get('[data-cy="user-username"]').type(user.username + 'a');
    cy.clickButton(/^Save user$/);
    cy.verifyPageTitle(`${user.username}a`);
  });

  it('navigates to the edit form from the users list row item', () => {
    cy.navigateTo('awx', 'users');
    cy.clickTableRowPinnedAction(user.username, 'edit-user');
    cy.verifyPageTitle('Edit User');
  });
});

describe('Users Delete Actions', () => {
  let organization: Organization;
  let user: User;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxUser(organization).then((testUser) => {
        user = testUser;
      });
    });
  });

  after(() => {
    cy.deleteAwxOrganization(organization);
  });

  it('deletes a user from the details page', () => {
    cy.navigateTo('awx', 'users');
    cy.clickTableRow(user.username);
    cy.verifyPageTitle(user.username);
    cy.clickPageAction(/^Delete user/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.verifyPageTitle('Users');
  });

  it('deletes a user from the users list row item', () => {
    cy.navigateTo('awx', 'users');
    cy.clickTableRowKebabAction(user.username, /^Delete user$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('deletes a user from the users list toolbar', () => {
    cy.navigateTo('awx', 'users');
    cy.selectTableRow(user.username);
    cy.clickToolbarKebabAction(/^Delete selected users$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
