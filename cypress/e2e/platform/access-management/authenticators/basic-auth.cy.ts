import { randomString } from '../../../../../framework/utils/random-string';
import { gatewayV1API } from '../../../../support/formatApiPathForPlatform';
import { UIAuth } from '../../../../../platform/interfaces/UIAuth';

describe.skip('Platform Basic Authentication', () => {
  it.skip('create local authenticator in ui, enable it, log out, log in, and check the new authenticator in response', () => {
    cy.platformLogin();
    cy.navigateTo('platform', 'authenticators');
    cy.verifyPageTitle('Authentication');

    const localAuthenticator = `Platform Basic Auth ${randomString(2)}`;

    // Create a new local authenticator
    cy.getByDataCy('create-authentication').click();
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
    cy.searchAndDisplayResourceByFilterOption(localAuthenticator, 'name');
    cy.contains('tr', localAuthenticator).within(() => {
      cy.get('[data-cy=toggle-switch]').click();
      cy.get('.pf-v5-c-switch__label.pf-m-on')
        .should('contain.text', 'Enabled')
        .should('be.be.visible');
    });
    cy.contains('h4', `${localAuthenticator} enabled.`);
    cy.get('.pf-v5-c-alert__action').click();

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
    cy.platformLogin();
    cy.navigateTo('platform', 'authenticators');
    cy.verifyPageTitle('Authentication');
    cy.searchAndDisplayResourceByFilterOption(localAuthenticator, 'name');
    cy.clickTableRowAction('name', localAuthenticator, 'delete-authentication', {
      inKebab: true,
    });
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.get('#submit').click();
      cy.contains(/^Success$/).should('be.visible');
      cy.containsBy('button', /^Close$/).click();
    });
    cy.clickButton(/^Clear all filters$/);
  });
});
