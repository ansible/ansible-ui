import { randomString } from '../../../../framework/utils/random-string';
import { PlatformOrganization } from '../../../../platform/interfaces/PlatformOrganization';
import { gatewayV1API } from '../../../../platform/api/gateway-api-utils';
import { PlatformUser } from '../../../../platform/interfaces/PlatformUser';

describe('Users - create, edit and delete', () => {
  let organization: PlatformOrganization;
  let platformUser: PlatformUser;
  const userName = 'platform-e2e-user-' + randomString(4).toLowerCase();
  const firstName = 'Bob' + randomString(5);
  const lastName = 'Smith' + randomString(5);
  const userEmail = firstName + lastName + '@email.com';

  before(() => {
    cy.platformLogin();
    cy.createPlatformOrganization().then((org) => {
      organization = org;

      cy.createPlatformUser(org).then((user) => {
        platformUser = user;
      });
    });
  });

  after(() => {
    cy.deletePlatformUser(platformUser, { failOnStatusCode: false });
    cy.deletePlatformOrganization(organization, { failOnStatusCode: false });
  });

  it('renders the users list', () => {
    cy.navigateTo('platform', 'users');
    cy.verifyPageTitle('Users');
    cy.contains('[data-cy="create-user"]', 'Create user')
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('admin user can create normal user, log in as normal user, and verify auth type is set to local', () => {
    cy.navigateTo('platform', 'users');
    cy.verifyPageTitle('Users');
    cy.get('[data-cy="create-user"]').click();
    cy.get('[data-cy="username"]').type(userName);
    cy.get('[data-cy="password"]').type('password123');
    cy.get('[data-cy="confirmpassword"]').type('password123');
    cy.get('[data-cy="first-name"]').type(firstName);
    cy.get('[data-cy="last-name"]').type(lastName);
    cy.get('[data-cy="email"]').type(userEmail);
    cy.singleSelectBy('[data-cy="organizations"]', organization.name);
    cy.intercept('POST', gatewayV1API`/users/`).as('createdUser');
    cy.get('[data-cy="Submit"]').click();
    cy.wait('@createdUser')
      .its('response.body')
      .then((createdUser: PlatformUser) => {
        cy.verifyPageTitle(createdUser.username);
        cy.platformLogout();
        cy.get('[data-cy="username"]').type(createdUser.username);
        cy.get('[data-cy="password"]').type('password123');
        cy.get('[data-cy="Submit"]').click();
        cy.get('[data-ouia-component-id="account-menu"]').should(
          'contain',
          `${createdUser.username}`
        );
        cy.navigateTo('platform', 'users');
        cy.verifyPageTitle('Users');
        cy.filterTableBySingleText(`${createdUser.username}`);
        const userId = `${createdUser.id}`.toString();
        cy.intercept('GET', gatewayV1API`/users/${userId}/`).as('displayedUser');
        cy.get(`a[href*="/access/users/${userId}/details"]`).click();
        cy.wait('@displayedUser').then(() => {
          cy.contains('[data-cy="authentication-type"]', 'Local').should('be.visible');
        });
        // Logout and log back in as admin to delete newly created user
        cy.platformLogout();
        cy.platformLogin();
        cy.deletePlatformUser(createdUser);
      });
  });
});
