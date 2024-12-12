import { UIAuth } from '@ansible/platform-ui/interfaces/UIAuth';
import { gatewayAPI } from '../../../../support/formatApiPathForPlatform';
import { randomE2Ename } from '../../../../support/utils';

describe('Platform Basic Authentication', () => {
  it('create local authenticator in ui, enable it, log out, log in, and check the new authenticator in response', () => {
    cy.navigateTo('platform', 'authentications');
    cy.verifyPageTitle('Authentication Methods');
    const localAuthenticator = randomE2Ename();
    cy.containsBy('a', 'Create authentication').click();
    // Create a new local authenticator
    cy.verifyPageTitle('Create authentication');
    cy.selectAuthenticationType('local');
    cy.clickButton('Next');
    cy.get('[data-cy="name"]').type(localAuthenticator);
    cy.clickButton('Next');
    cy.clickButton('Next');
    cy.clickButton('Finish');
    cy.verifyPageTitle(localAuthenticator);
    cy.navigateTo('platform', 'authentications');
    cy.verifyPageTitle('Authentication Methods');
    // Enable the newly created local authenticator
    cy.intercept('PATCH', gatewayAPI`/authenticators/*/`).as('editedAuth');
    cy.getTableRow('name', localAuthenticator).within(() => {
      cy.get('[data-cy=toggle-switch]').click();
    });
    cy.intercept('GET', gatewayAPI`/authenticators/*`).as('authenticators');
    cy.wait('@editedAuth');
    cy.wait('@authenticators');
    cy.getBy('[data-cy="alert-toaster"]').within(() => {
      cy.get('button').click();
    });
    // Log out
    cy.platformLogout();
    cy.get('.pf-v5-c-login').should('be.visible');
    cy.intercept('GET', gatewayAPI`/ui_auth/`).as('getUIAuthRequest');
    // Login
    cy.platformLogin();
    cy.wait('@getUIAuthRequest')
      .its('response.body')
      .then((responseBody: UIAuth) => {
        const localDbAuth = {
          name: 'Local Database Authenticator',
          type: 'ansible_base.authentication.authenticator_plugins.local',
        };
        expect(responseBody.passwords.some((password) => password.name === localAuthenticator)).to
          .be.true;
        expect(responseBody.passwords).to.deep.include(localDbAuth);
      });
    // Authentication List Page
    cy.navigateTo('platform', 'authentications');
    cy.verifyPageTitle('Authentication Methods');
    // Edit the GitHub authenticator
    cy.clickTableRowAction('name', localAuthenticator, 'edit-authentication');
    // Authentication Wizard
    cy.get('[data-cy="name"]')
      .clear()
      .type(localAuthenticator + '_edited');
    cy.clickButton('Next');
    cy.clickButton('Next');
    cy.clickButton('Finish');
    // Authentication Details Page
    // Verify the edited Local authenticator
    cy.verifyPageTitle(localAuthenticator + '_edited');
    cy.get('[data-cy="name"]').should('have.text', localAuthenticator + '_edited');
    // Authentication List Page
    cy.navigateTo('platform', 'authentications');
    cy.verifyPageTitle('Authentication');
    // Delete the Local authenticator
    cy.clickTableRowAction('name', localAuthenticator + '_edited', 'delete-authentication', {
      inKebab: true,
    });
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.get('#submit').click();
      cy.contains(/^Success$/).should('be.visible');
    });
    cy.getModal().should('not.exist');
    cy.clickButton(/^Clear all filters$/);
  });
});
