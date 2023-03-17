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

    cy.requestPost<Organization>('/api/v2/organizations/', {
      name: 'E2E Users ' + randomString(4),
    }).then((testOrg) => {
      organization = testOrg;
    });
  });

  after(() => {
    cy.requestDelete(`/api/v2/organizations/${organization.id}/`, true);
  });

  beforeEach(() => {
    cy.requestPost<User>('/api/v2/users/', {
      username: 'E2E_User_' + randomString(4),
      password: randomString(12),
    }).then((testUser) => (user = testUser));
  });

  afterEach(() => {
    cy.requestDelete(`/api/v2/users/${user.id}/`, true);
  });

  it('user page', () => {
    cy.navigateTo(/^Users$/, false);
    cy.hasTitle(/^Users$/);
  });

  it('create user', () => {
    const userName = 'E2E_User_' + randomString(4);
    const password = randomString(12);
    cy.navigateTo(/^Users$/, false);
    cy.clickLink(/^Create user$/);
    cy.typeByLabel(/^Username$/, userName);
    cy.typeByLabel(/^Password$/, password);
    cy.typeByLabel(/^Confirm password$/, password);
    cy.typeByLabel(/^Organization$/, organization.name);
    cy.clickButton(/^Create user$/);
    cy.hasTitle(userName);
    // Clean up this user
    cy.clickPageAction(/^Delete user/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.hasTitle(/^Users$/);
  });

  it('user details', () => {
    cy.navigateTo(/^Users$/, false);
    cy.clickRow(user.username);
    cy.hasTitle(user.username);
    cy.clickButton(/^Details$/);
    cy.contains('#username', user.username);
  });

  it('user details edit user', () => {
    cy.navigateTo(/^Users$/, false);
    cy.clickRow(user.username);
    cy.hasTitle(user.username);
    cy.clickButton(/^Edit user$/);
    cy.hasTitle(/^Edit user$/);
    cy.typeByLabel(/^Username$/, 'a');
    cy.clickButton(/^Save user$/);
    cy.hasTitle(`${user.username}a`);
  });

  it('user details delete user', () => {
    cy.navigateTo(/^Users$/, false);
    cy.clickRow(user.username);
    cy.hasTitle(user.username);
    cy.clickPageAction(/^Delete user/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.hasTitle(/^Users$/);
  });

  it('users table row edit user', () => {
    cy.navigateTo(/^Users$/, false);
    cy.clickRowAction(user.username, /^Edit user$/);
    cy.hasTitle(/^Edit user$/);
  });

  it('users table row delete user', () => {
    cy.navigateTo(/^Users$/, false);
    cy.clickRowAction(user.username, /^Delete user$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('users toolbar delete users', () => {
    cy.navigateTo(/^Users$/, false);
    cy.selectRow(user.username);
    cy.clickToolbarAction(/^Delete selected users$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete user/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
