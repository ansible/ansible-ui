/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';

describe.skip('Users Tests', () => {
  let organization: Organization;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
    });
  });

  after(() => {
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  describe('Users List Actions', () => {
    let user: AwxUser;

    beforeEach(() => {
      cy.createAwxUser({ organization: organization.id }).then((testUser) => {
        user = testUser;
      });

      cy.navigateTo('awx', 'users');
      cy.verifyPageTitle('Users');
    });

    afterEach(() => {
      cy.deleteAwxUser(user, { failOnStatusCode: false });
    });

    it('filters users by id', () => {
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
      cy.clickLink(/^Create user$/);
      cy.get('[data-cy="username"]').type(userName);
      cy.get('[data-cy="password"]').type(password);
      cy.get('[data-cy="confirmpassword"]').type(password);
      cy.singleSelectBy('[data-cy="organization"]', organization.name);
      cy.clickButton(/^Create user$/);
      cy.verifyPageTitle(userName);
      cy.clickPageAction('delete-user');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete user/);
      cy.verifyPageTitle('Users');
    });

    it('navigates to the edit form from the users list row item', () => {
      cy.clickTableRowPinnedAction(user.username, 'edit-user');
      cy.verifyPageTitle('Edit User');
    });

    it('edits a user from the details page', () => {
      cy.clickTableRowLink('username', user.username);
      cy.verifyPageTitle(user.username);
      cy.url().should('contain', '/details');
      cy.clickButton(/^Edit user$/);
      cy.verifyPageTitle('Edit User');
      cy.get('[data-cy="username"]').type(user.username + 'a');
      cy.clickButton(/^Save user$/);
      cy.verifyPageTitle(`${user.username}a`);
    });
  });

  describe('Users Delete Actions', () => {
    let user: AwxUser;

    beforeEach(() => {
      cy.createAwxUser({ organization: organization.id }).then((testUser) => {
        user = testUser;
      });

      cy.navigateTo('awx', 'users');
      cy.verifyPageTitle('Users');
    });

    it('deletes a user from the details page', () => {
      cy.clickTableRowLink('username', user.username);
      cy.verifyPageTitle(user.username);
      cy.clickPageAction('delete-user');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete user/);
      cy.verifyPageTitle('Users');
    });

    it('deletes a user from the users list row item', () => {
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
      cy.selectTableRow(user.username);
      cy.clickToolbarKebabAction('delete-selected-users');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete user/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
