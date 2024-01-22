import { APITokens } from './constants';

describe('API Tokens', () => {
  before(() => {
    cy.hubLogin();
  });
  it('should render the api tokens page', () => {
    cy.navigateTo('hub', APITokens.url);
    cy.verifyPageTitle(APITokens.title);
  });
  it('should render API token and warning when Generate token clicked', () => {
    cy.navigateTo('hub', APITokens.url);
    cy.verifyPageTitle(APITokens.title);
    // a warning about generating token is shown
    cy.get('[data-cy="generate_token_warning"]').should('be.visible');
    cy.get('[data-cy="generate_token"]').click();
    // a warning about new token is shown
    cy.get('[data-cy="copy_token_warning"]').should('be.visible');
    // new token is shown
    cy.get('[data-cy="copy_token_cell"]').should('be.visible');
  });
});
