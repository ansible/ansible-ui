import { CredentialTypeCredentials } from './CredentialTypeCredentials';

describe('CredentialTypeCredentials', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/credential_types/*' },
      { fixture: 'credentialType' }
    );
  });

  it('fetches credentials for the correct credential type', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/credential_types/1/credentials/*',
      },
      {
        fixture: 'credentials.json',
      }
    ).as('credentials');
    cy.mount(<CredentialTypeCredentials />);
    cy.wait('@credentials').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
    });
  });
});
