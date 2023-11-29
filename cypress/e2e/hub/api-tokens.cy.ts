import { APITokens } from './constants';

describe('API Tokens', () => {
  before(() => {
    cy.hubLogin();
  });
  it('it should render the api tokens page', () => {
    cy.navigateTo('hub', APITokens.url);
    cy.verifyPageTitle(APITokens.title);
  });
});
