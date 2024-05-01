import { randomString } from '../../../../../framework/utils/random-string';
import { GoogleOAuth2 } from '../../../../../platform/interfaces/GoogleOAuth2Authenticator';

describe('Google OAuth2 Authentication form - create, edit, update and delete', () => {
  it('creates a Google OAuth2 authenticator', () => {
    const googleAuthenticator = `E2E Google OAuth2 Authenticator ${randomString(4)}`;
    cy.platformLogin();

    cy.fixture('platform-authenticators/google-oauth2').then((data: GoogleOAuth2) => {
      const googleData = data;
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication');
      // creates a new Google OAuth2 authenticator
      cy.containsBy('a', 'Create authentication').click();
      cy.selectAuthenticationType('google-oauth2');
      cy.clickButton('Next');
      cy.get('[data-cy="name"]').type(googleAuthenticator);
      cy.get('[data-cy="configuration-input-KEY"]').type(googleData.oauth2Key);
      cy.get('[data-cy="configuration-input-SECRET"]').type(googleData.oauth2Secret);
      cy.get('[data-cy="configuration-input-CALLBACK_URL"]').type(googleData.callbackUrl);
      cy.get('[data-cy="configuration-input-ACCESS_TOKEN_URL"]').type(googleData.accessTokenUrl);
      cy.selectResourceFromSpecificDropDown(
        'configuration-input-ACCESS_TOKEN_METHOD-form-group',
        'put'
      );
      cy.get('[data-cy="configuration-input-AUTHORIZATION_URL"]').type(googleData.authorizationUrl);
      cy.selectResourceFromSpecificDropDown(
        'configuration-input-REVOKE_TOKEN_METHOD-form-group',
        'put'
      );
      cy.dataEditorSetFormat('configuration-editor-SCOPE');
      cy.get('[data-cy="configuration-editor-SCOPE"]')
        .find('textarea:not(:disabled)')
        .focus()
        .clear()
        .type('{selectAll}{backspace}')
        .type(JSON.stringify(googleData.scopes), {
          delay: 0,
          parseSpecialCharSequences: false,
        })
        .type('{esc}');
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');
      cy.verifyPageTitle(googleAuthenticator);

      // reads/asserts the created Google OAuth Authenticator
      cy.get('[data-cy="name"]').should('have.text', googleAuthenticator);

      // enable the Google OAuth2 authenticator
      cy.navigateTo('platform', 'authenticators');

      // edit and update
      cy.searchAndDisplayResourceByFilterOption(googleAuthenticator, 'name').then(() => {
        cy.contains('tr', googleAuthenticator).within(() => {
          cy.get('[data-cy=toggle-switch]').click();
          cy.getByDataCy('actions-column-cell').within(() => {
            cy.getByDataCy('edit-authenticator').click();
          });
        });
      });
      cy.get('[data-cy="name"]').clear().type(`${googleAuthenticator} Updated`);
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');

      cy.verifyPageTitle(`${googleAuthenticator} Updated`);

      //delete the created Google OAuth2 authenticator
      cy.navigateTo('platform', 'authenticators');
      cy.clickTableRowAction('name', `${googleAuthenticator} Updated`, 'delete-authentication', {
        inKebab: true,
        disableFilter: true,
      });
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.get('#submit').click();
        cy.contains(/^Success$/).should('be.visible');
        cy.containsBy('button', /^Close$/).click();
      });
    });
  });
});
