import { randomString } from '../../../../../framework/utils/random-string';
import { AzureAD } from '../../../../../platform/interfaces/AzureAD';
import { gatewayV1API } from '../../../../support/formatApiPathForPlatform';

describe('Azure AD Authentication form - create, edit, update and delete', () => {
  it('creates an Azure AD authenticator', () => {
    const azureAdAuthenticator = `E2E Azure AD Authenticator ${randomString(4)}`;
    cy.platformLogin();

    cy.fixture('platform-authenticators/azuread').then((data: AzureAD) => {
      const azureAdData = data;
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication');
      // create a new Azure AD authenticator
      cy.containsBy('a', 'Create authentication').click();
      cy.selectAuthenticationType('azuread');
      cy.clickButton('Next');
      cy.get('[data-cy="name"]').type(azureAdAuthenticator);
      cy.get('[data-cy="configuration-input-CALLBACK_URL"]').type(azureAdData.callbackUrl);
      cy.get('[data-cy="configuration-input-KEY"]').type(azureAdData.oidcKey);
      cy.get('[data-cy="configuration-input-SECRET"]').type(azureAdData.oidcSecret);
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');
      cy.verifyPageTitle(azureAdAuthenticator);

      // reads/asserts created the Azure AD authenticator
      cy.get('[data-cy="name"]').should('have.text', azureAdAuthenticator);
      cy.get('[data-cy="azure-ad-oauth2-callback-url"]').should(
        'have.text',
        azureAdData.callbackUrl
      );
      cy.get('[data-cy="oidc-key"]').should('have.text', azureAdData.oidcKey);
      cy.get('[data-cy="oidc-secret"]').should('have.text', '$encrypted$');
      // enable the Azure AD authenticator
      cy.navigateTo('platform', 'authenticators');

      // edit and updates the created Azure AD authenticator
      cy.searchAndDisplayResourceByFilterOption(azureAdAuthenticator, 'name').then(() => {
        cy.contains('tr', azureAdAuthenticator).within(() => {
          cy.get('[data-cy=toggle-switch]').click();
          cy.getByDataCy('actions-column-cell').within(() => {
            cy.getByDataCy('edit-authenticator').click();
          });
        });
      });
      cy.get('[data-cy="name"]').clear().type(`${azureAdAuthenticator} Updated`);
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');

      cy.verifyPageTitle(`${azureAdAuthenticator} Updated`);

      //delete the created Azure AD authenticator
      cy.intercept('GET', gatewayV1API`/authenticators/?order_by=order&page=1&page_size=10`).as(
        'getAuthenticators'
      );
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication');
      cy.wait('@getAuthenticators').then(() => {
        cy.searchAndDisplayResourceByFilterOption(`${azureAdAuthenticator} Updated`, 'name');
        cy.clickTableRowAction('name', `${azureAdAuthenticator} Updated`, 'delete-authentication', {
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
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
