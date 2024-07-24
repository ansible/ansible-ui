/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';

describe('Users List Actions', () => {
  let organization: Organization;
  let user: AwxUser;

  beforeEach(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxUser({ organization: organization.id }).then((testUser) => {
        user = testUser;
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('renders the users list page', () => {
    cy.navigateTo('awx', 'users');
    cy.verifyPageTitle('Users');
  });

  it('filters users by id', () => {
    cy.navigateTo('awx', 'users');
    cy.filterTableByMultiSelect('id', [user.id.toString()]);
    cy.get('tr').should('have.length.greaterThan', 0);
    if (user.id) {
      cy.contains(user.id).should('be.visible');
    }
    cy.clearAllFilters();
  });

  it('creates and then deletes a basic user', () => {
    const userName = 'E2E_User_' + randomString(4);
    const password = randomString(12);
    cy.navigateTo('awx', 'users');
    cy.clickLink(/^Create user$/);
    cy.get('[data-cy="username"]').type(userName);
    cy.get('[data-cy="password"]').type(password);
    cy.get('[data-cy="confirmpassword"]').type(password);
    cy.singleSelectBy('[data-cy="organization"]', organization.name);
    cy.clickButton(/^Create user$/);
    cy.verifyPageTitle(userName);
    // Clean up this user
    cy.clickPageAction('delete-user');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.verifyPageTitle('Users');
  });

  it('renders the user details page', () => {
    cy.navigateTo('awx', 'users');
    cy.clickTableRowLink('username', user.username);
    cy.verifyPageTitle(user.username);
    cy.clickLink(/^Details$/);
    cy.contains('#username', user.username);
  });

  it('edits a user from the details page', () => {
    cy.navigateTo('awx', 'users');
    cy.clickTableRowLink('username', user.username);
    cy.verifyPageTitle(user.username);
    cy.clickButton(/^Edit user$/);
    cy.verifyPageTitle('Edit User');
    cy.get('[data-cy="username"]').type(user.username + 'a');
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
  let user: AwxUser;

  beforeEach(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxUser({ organization: organization.id }).then((testUser) => {
        user = testUser;
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('deletes a user from the details page', () => {
    cy.navigateTo('awx', 'users');
    cy.clickTableRowLink('username', user.username);
    cy.verifyPageTitle(user.username);
    cy.clickPageAction('delete-user');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.verifyPageTitle('Users');
  });

  it('deletes a user from the users list row item', () => {
    cy.navigateTo('awx', 'users');
    cy.clickTableRowAction('username', user.username, 'delete-user', {
      inKebab: true,
    });
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('deletes a user from the users list toolbar', () => {
    cy.navigateTo('awx', 'users');
    cy.selectTableRow(user.username);
    cy.clickToolbarKebabAction('delete-selected-users');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
