import { AzureAD } from '../../../../../platform/interfaces/AzureAD';
import { randomE2Ename } from '../../../../support/utils';

describe('Azure AD Authentication form - create, edit, update and delete', () => {
  it('creates an Azure AD authenticator', () => {
    const azureAdAuthenticator = randomE2Ename();
    cy.platformLogin();

    cy.fixture('platform-authenticators/azuread').then((azureADData: AzureAD) => {
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication');

      // Click on the Create Authentication button
      cy.containsBy('a', 'Create authentication').click();

      // Authentication Wizard - Authentication Type Step
      cy.verifyPageTitle('Create Authentication');
      cy.selectAuthenticationType('azuread');
      cy.clickButton('Next');
      // Authentication Wizard - Authentication Details Step
      cy.get('[data-cy="name"]').type(azureAdAuthenticator);
      cy.get('[data-cy="configuration-input-CALLBACK_URL"]').type(azureADData.callbackUrl);
      cy.get('[data-cy="configuration-input-KEY"]').type(azureADData.oidcKey);
      cy.get('[data-cy="configuration-input-SECRET"]').type(azureADData.oidcSecret);
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');
      // Authentication Details Page
      cy.verifyPageTitle(azureAdAuthenticator);

      cy.get('[data-cy="name"]').should('have.text', azureAdAuthenticator);
      cy.get('[data-cy="azure-ad-oauth2-callback-url"]').should(
        'have.text',
        azureADData.callbackUrl
      );
      cy.get('[data-cy="oidc-key"]').should('have.text', azureADData.oidcKey);
      cy.get('[data-cy="oidc-secret"]').should('have.text', '$encrypted$');

      // Authentication List Page
      cy.navigateTo('platform', 'authenticators');

      // Enable the Azure AD authenticator
      cy.getTableRow('name', azureAdAuthenticator).within(() => {
        cy.get('[data-cy=toggle-switch]').click();
      });
    });

    // Logout
    cy.platformLogout();

    // Verify the GH Authenticator is displayed in the login page
    cy.get('form.pf-v5-c-form').within(() => {
      cy.get('h2').should('have.text', 'Log in with').should('be.visible');
      cy.get('a[data-cy="social-auth-ansible_base.authentication.authenticator_plugins.azuread"]')
        .contains(azureAdAuthenticator)
        .should('have.attr', 'href')
        .and(
          'equal',
          `/api/gateway/social/login/ansible_base-authentication-authenticator_plugins-azuread__${azureAdAuthenticator.toLowerCase()}/`
        );
    });

    // Login
    cy.platformLogin();

    // Authentication List Page
    cy.navigateTo('platform', 'authenticators');
    cy.verifyPageTitle('Authentication');

    // Edit the GitHub authenticator
    cy.clickTableRowAction('name', azureAdAuthenticator, 'edit-authenticator');

    // Authentication Wizard
    cy.get('[data-cy="name"]')
      .clear()
      .type(azureAdAuthenticator + '_edited');
    cy.clickButton('Next');
    cy.clickButton('Next');
    cy.clickButton('Finish');

    // Authentication Details Page
    // Verify the edited AzureAD authenticator
    cy.verifyPageTitle(azureAdAuthenticator + '_edited');
    cy.get('[data-cy="name"]').should('have.text', azureAdAuthenticator + '_edited');

    // Authentication List Page
    cy.navigateTo('platform', 'authenticators');
    cy.verifyPageTitle('Authentication');

    // Delete the GitHub authenticator
    cy.clickTableRowAction('name', azureAdAuthenticator + '_edited', 'delete-authentication', {
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
