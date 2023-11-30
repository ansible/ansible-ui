import { SignatureKeys } from './constants';

describe('Signature Keys', () => {
  before(() => {
    cy.hubLogin();
  });

  it('it should render the signature keys page', () => {
    cy.navigateTo('hub', SignatureKeys.url);
    cy.verifyPageTitle(SignatureKeys.title);
  });
});
