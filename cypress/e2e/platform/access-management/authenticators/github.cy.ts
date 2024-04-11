import { randomString } from '../../../../../framework/utils/random-string';
import { GithubAuthenticator } from '../../../../../platform/interfaces/GithubAuthenticator';
import { UIAuth } from '../../../../../platform/interfaces/UIAuth';
import { gatewayV1API } from '../../../../support/formatApiPathForPlatform';
import { AuthOption } from '../../../../../platform/interfaces/UIAuth';

describe('GitHub Authentication form - create, edit, update and delete', () => {
  it('creates a GitHub authenticator', () => {
    const githubAuthenticator = `E2E-GH-Authenticator-${randomString(2)}`;
    cy.platformLogin();

    cy.fixture('platform-authenticators/github').then((data: GithubAuthenticator) => {
      const githubData = data;
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication');
      // create a new GitHub authenticator
      cy.containsBy('a', 'Create authentication').click();
      cy.verifyPageTitle('Create Authentication');
      cy.selectAuthenticationType('github');
      cy.clickButton('Next');
      cy.get('[data-cy="name"]').type(githubAuthenticator);
      cy.get('[data-cy="configuration-input-CALLBACK_URL"]').type(githubData.callbackUrl);
      cy.get('[data-cy="configuration-input-KEY"]').type(githubData.oauth2Key);
      cy.get('[data-cy="configuration-input-SECRET"]').type(githubData.oauth2Secret);
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');
      cy.verifyPageTitle(githubAuthenticator);
      // assert that the authentication details are correct
      cy.get('[data-cy="name"]').should('have.text', githubAuthenticator);
      cy.get('[data-cy="github-oauth2-callback-url"]').should('have.text', githubData.callbackUrl);
      cy.get('[data-cy="github-oauth2-key"]').should('have.text', githubData.oauth2Key);
      cy.get('[data-cy="github-oauth2-secret"]').should('have.text', '$encrypted$');
      // enable the GitHub authenticator
      cy.navigateTo('platform', 'authenticators');

      // edit and update
      cy.searchAndDisplayResourceByFilterOption(githubAuthenticator, 'name').then(() => {
        cy.contains('tr', githubAuthenticator).within(() => {
          cy.get('[data-cy=toggle-switch]').click();
          cy.getByDataCy('actions-column-cell').within(() => {
            cy.getByDataCy('edit-authenticator').click();
          });
        });
      });
      cy.get('[data-cy="name"]').clear().type(`${githubAuthenticator}Edited`);
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');

      cy.verifyPageTitle(`${githubAuthenticator}Edited`);
      cy.intercept('GET', gatewayV1API`/ui_auth/`).as('getGHAuthRequest');
      cy.platformLogout();

      // logout and verify the created GH Authenticator is displayed in the login page
      const authName = `${githubAuthenticator}`;
      cy.get('form.pf-v5-c-form').within(() => {
        cy.get('h2').should('have.text', 'Log in with').should('be.visible');
        cy.get('a[data-cy="social-auth-ansible_base.authentication.authenticator_plugins.github"]')
          .contains(authName)
          .should('have.attr', 'href')
          .and(
            'equal',
            `/api/gateway/social/login/ansible_base-authentication-authenticator_plugins-github__${authName.toLowerCase()}/`
          );
      });

      // verify in the backend that the created GH Authenticator is displayed
      cy.wait('@getGHAuthRequest')
        .its('response.body')
        .then((responseBody: UIAuth) => {
          const ghAuthenticatorCreated = responseBody?.ssos.find(
            (sso) => sso.name === `${githubAuthenticator}Edited`
          );
          expect(ghAuthenticatorCreated as AuthOption).to.exist;
          expect(ghAuthenticatorCreated as AuthOption).to.have.property(
            'name',
            `${githubAuthenticator}Edited`
          );
          expect(ghAuthenticatorCreated as AuthOption).to.have.property(
            'type',
            'ansible_base.authentication.authenticator_plugins.github'
          );
          expect(ghAuthenticatorCreated?.login_url).to.include(githubAuthenticator.toLowerCase());
        });
      cy.platformLogin();
      cy.intercept('GET', gatewayV1API`/authenticators/?order_by=order&page=1&page_size=10`).as(
        'getAuthenticators'
      );

      //delete the created GitHub authenticator
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication');
      cy.wait('@getAuthenticators').then(() => {
        cy.clickTableRowAction('name', `${githubAuthenticator}Edited`, 'delete-authentication', {
          inKebab: true,
          disableFilter: true,
        });
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
