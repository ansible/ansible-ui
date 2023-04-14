/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { User } from '../../../../frontend/awx/interfaces/User';

describe('users', () => {
  let organization: Organization;
  let user: User;

  before(() => {
    cy.awxLogin();

    cy.createAwxOrganization().then((org) => {
      organization = org;
    });
  });

  after(() => {
    cy.requestDelete(`/api/v2/organizations/${organization.id}/`, true);
  });

  beforeEach(() => {
    cy.createAwxUser(organization).then((testUser) => (user = testUser));
  });

  afterEach(() => {
    cy.deleteAwxUser(user);
  });

  it('renders the users list page', () => {
    cy.navigateTo(/^Users$/);
    cy.hasTitle(/^Users$/);
  });

  it('creates and then deletes a basic user', () => {
    const userName = 'E2E_User_' + randomString(4);
    const password = randomString(12);
    cy.navigateTo(/^Users$/);
    cy.clickLink(/^Create user$/);
    cy.typeInputByLabel(/^Username$/, userName);
    cy.typeInputByLabel(/^Password$/, password);
    cy.typeInputByLabel(/^Confirm password$/, password);
    cy.typeInputByLabel(/^Organization$/, organization.name);
    cy.clickButton(/^Create user$/);
    cy.hasTitle(userName);
    // Clean up this user
    cy.clickPageAction(/^Delete user/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.hasTitle(/^Users$/);
  });

  it('renders the user details page', () => {
    cy.navigateTo(/^Users$/);
    cy.clickTableRow(user.username);
    cy.hasTitle(user.username);
    cy.clickLink(/^Details$/);
    cy.contains('#username', user.username);
  });

  it('edits a user from the details page', () => {
    cy.navigateTo(/^Users$/);
    cy.clickTableRow(user.username);
    cy.hasTitle(user.username);
    cy.clickButton(/^Edit user$/);
    cy.hasTitle(/^Edit user$/);
    cy.typeInputByLabel(/^Username$/, user.username + 'a');
    cy.clickButton(/^Save user$/);
    cy.hasTitle(`${user.username}a`);
  });

  it('deletes a user from the details page', () => {
    cy.navigateTo(/^Users$/);
    cy.clickTableRow(user.username);
    cy.hasTitle(user.username);
    cy.clickPageAction(/^Delete user/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.hasTitle(/^Users$/);
  });

  it('navigates to the edit form from the users list row item', () => {
    cy.navigateTo(/^Users$/);
    cy.clickTableRowPinnedAction(user.username, 'Edit user');
    cy.hasTitle(/^Edit user$/);
  });

  it('deletes a user from the users list row item', () => {
    cy.navigateTo(/^Users$/);
    cy.clickTableRowKebabAction(user.username, /^Delete user$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('deletes a user from the users list toolbar', () => {
    cy.navigateTo(/^Users$/);
    cy.selectTableRow(user.username);
    cy.clickToolbarKebabAction(/^Delete selected users$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
