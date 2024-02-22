import { randomString } from '../../../../framework/utils/random-string';
import { PlatformOrganization } from '../../../../platform/interfaces/PlatformOrganization';

describe('Users - create, edit and delete', () => {
  let organization: PlatformOrganization;
  const userName = 'platform-e2e-user-' + randomString(4).toLowerCase();
  const firstName = 'Bob' + randomString(5);
  const lastName = 'Smith' + randomString(5);
  const userEmail = firstName + lastName + '@email.com';

  before(() => {
    cy.platformLogin();
  });

  beforeEach(() => {
    cy.createPlatformOrganization().then((org) => {
      organization = org;
    });
  });

  it('admin user can create normal user, log in as normal user, and verify auth type is set to local', () => {
    cy.navigateTo('platform', 'users');
    cy.verifyPageTitle('Users');
    // cy.clickByDataCy('create-user');
    cy.get('[data-cy="create-user"]').click();
    // cy.getByDataCy('username').type(userName);
    cy.get('[data-cy="username"]').type(userName);
    // cy.getByDataCy('password').type('password123');
    cy.get('[data-cy="password"]').type('password123');
    // cy.getByDataCy('first-name').type(firstName);
    cy.get('[data-cy="first-name"]').type(firstName);
    // cy.getByDataCy('last-name').type(lastName);
    cy.get('[data-cy="last-name"]').type(lastName);
    // cy.getByDataCy('email').type(userEmail);
    cy.get('[data-cy="email"]').type(userEmail);
    // cy.clickByDataCy('organizations-form-group').then(() => {
    cy.get('[data-cy="organizations-form-group"]')
      .click()
      .then(() => {
        //   cy.clickByDataCy(`${organization.name}`);
        cy.get(`[data-cy="${organization.name}"]`).click();
      });
    // cy.clickByDataCy('page-title');
    cy.get('[data-cy="page-title"]').click();
    // cy.clickByDataCy('Submit');
    cy.get('[data-cy="Submit"]').click();
  });
});
