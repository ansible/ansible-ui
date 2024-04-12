import { randomE2Ename } from '../../../../support/utils';
import { UIAuth } from '../../../../../platform/interfaces/UIAuth';
import { gatewayV1API } from '../../../../../platform/api/gateway-api-utils';

describe('Platform Basic Authentication', () => {
  it('create local authenticator in ui, enable it, log out, log in, and check the new authenticator in response', () => {
    cy.platformLogin();
    cy.navigateTo('platform', 'authenticators');
    cy.verifyPageTitle('Authentication');

    const localAuthenticator = randomE2Ename();
    cy.containsBy('a', 'Create authentication').click();

    // Create a new local authenticator
    cy.verifyPageTitle('Create Authentication');
    cy.selectAuthenticationType('local');
    cy.clickButton('Next');
    cy.get('[data-cy="name"]').type(localAuthenticator);
    cy.clickButton('Next');
    cy.clickButton('Next');
    cy.clickButton('Finish');
    cy.verifyPageTitle(localAuthenticator);

    cy.navigateTo('platform', 'authenticators');
    cy.verifyPageTitle('Authentication');

    // Enable the newly created local authenticator
    cy.getTableRow('name', localAuthenticator).within(() => {
      cy.get('[data-cy=toggle-switch]').click();
    });

    // Log out
    cy.intercept('GET', gatewayV1API`/ui_auth/`).as('getUIAuthRequest');
    cy.platformLogout();

    // Log back in
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

    // Login
    cy.platformLogin();

    // Authentication List Page
    cy.navigateTo('platform', 'authenticators');
    cy.verifyPageTitle('Authentication');

    // Edit the GitHub authenticator
    cy.clickTableRowAction('name', localAuthenticator, 'edit-authenticator');

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
    cy.navigateTo('platform', 'authenticators');
    cy.verifyPageTitle('Authentication');

    // Delete the Local authenticator
    cy.clickTableRowAction('name', localAuthenticator + '_edited', 'delete-authentication', {
      inKebab: true,
    });
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.get('#submit').click();
      cy.contains(/^Success$/).should('be.visible');
      cy.containsBy('button', /^Close$/).click();
    });
    cy.getModal().should('not.exist');
  });
});
