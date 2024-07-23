import { GithubAuthenticator } from '../../../../../platform/interfaces/GithubAuthenticator';
import { randomE2Ename } from '../../../../support/utils';

describe('GitHub Authentication form - create, edit, update and delete', () => {
  it('creates a GitHub authenticator', () => {
    const name = randomE2Ename();

    cy.fixture('platform-authenticators/github').then((githubData: GithubAuthenticator) => {
      // Authentication List Page
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication Methods');

      // Click on the Create Authentication button
      cy.containsBy('a', 'Create authentication').click();

      // Authentication Wizard - Authentication Type Step
      cy.verifyPageTitle('Create authentication');
      cy.selectAuthenticationType('github');
      cy.clickButton('Next');

      // Authentication Wizard - Authentication Details Step
      cy.get('[data-cy="name"]').type(name);
      cy.get('[data-cy="configuration-input-KEY"]').type(githubData.oauth2Key);
      cy.get('[data-cy="configuration-input-SECRET"]').type(githubData.oauth2Secret);
      cy.clickButton('Next');

      // Authentication Wizard - Authentication Mapping Step
      cy.clickButton('Next');

      // Authentication Wizard - Review Step
      cy.clickButton('Finish');

      // Authentication Details Page
      cy.verifyPageTitle(name);
      cy.get('[data-cy="name"]').should('have.text', name);
      cy.get('[data-cy="github-oauth2-key"]').should('have.text', githubData.oauth2Key);
      cy.get('[data-cy="github-oauth2-secret"]').should('have.text', '$encrypted$');

      // Authentication List Page
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication Methods');

      // Enable the GitHub authenticator
      cy.getTableRow('name', name).within(() => {
        cy.get('[data-cy=toggle-switch]').click();
      });

      // Logout
      cy.platformLogout();

      // Verify the GH Authenticator is displayed in the login page
      cy.contains('Log in with').should('be.visible');
      cy.get('a[data-cy="social-auth-ansible_base.authentication.authenticator_plugins.github"]')
        .contains(name)
        .should('have.attr', 'href')
        .and(
          'equal',
          `/api/gateway/social/login/ansible_base-authentication-authenticator_plugins-github__${name.toLowerCase()}/`
        );

      // Login
      cy.platformLogin();

      // Authentication List Page
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication Methods');

      // Edit the GitHub authenticator
      cy.clickTableRowAction('name', name, 'edit-authenticator');

      // Authentication Wizard
      cy.get('[data-cy="name"]')
        .clear()
        .type(name + '_edited');
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');

      // Authentication Details Page
      // Verify the edited GitHub authenticator
      cy.verifyPageTitle(name + '_edited');
      cy.get('[data-cy="name"]').should('have.text', name + '_edited');

      // Authentication List Page
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication Methods');
      // Delete the GitHub authenticator
      cy.clickTableRowAction('name', name + '_edited', 'delete-authentication', { inKebab: true });
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.get('#submit').click();
        cy.contains(/^Success$/).should('be.visible');
        cy.containsBy('button', /^Close$/).click();
      });
      cy.getModal().should('not.exist');
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
