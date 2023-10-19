import { CredentialType } from '../../../../frontend/awx/interfaces/generated-from-swagger/api';

describe('Credential types', () => {
  let credentialType: CredentialType;

  before(() => {
    cy.awxLogin();

    cy.createAwxCredentialType().then((credType: CredentialType) => {
      credentialType = credType;
    });
  });

  it('renders the credentials list page', () => {
    cy.navigateTo('awx', 'credential-types');
    cy.verifyPageTitle('Credential Types');
  });
});
