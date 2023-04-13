/* eslint-disable i18next/no-literal-string */
import { Credential } from '../../../interfaces/Credential';
import { CredentialType } from '../../../interfaces/CredentialType';
import { CredentialPage } from './CredentialPage';

describe('CredentialPage', () => {
  beforeEach(() => {
    cy.fixture('credential').then((credential: Credential) => {
      cy.intercept('GET', '/api/v2/credential/1/*', credential);
    });
    cy.fixture('credentialType').then((credentialType: CredentialType) => {
      cy.intercept('GET', '/api/v2/credential_types/*', credentialType);
    });

    cy.fixture('credentialType').then((credentialType: CredentialType) => {
      cy.intercept('GET', '/api/v2/credentials/2/input_sources/*', credentialType);
    });
  });

  it('Should show disabled delete button', () => {
    cy.fixture('credential').then((credential: Credential) => {
      credential.summary_fields.user_capabilities.delete = false;
      cy.intercept('GET', '/api/v2/credentials/*', credential);
    });
    cy.mount(<CredentialPage />);
    cy.get('.toggle-kebab')
      .click()
      .get('a.pf-m-aria-disabled ')
      .should('have.attr', 'aria-disabled', 'true');
  });

  it('Should disabled edit button', () => {
    cy.fixture('credential').then((credential: Credential) => {
      credential.summary_fields.user_capabilities.edit = false;
      cy.intercept('GET', '/api/v2/credentials/*', credential);
    });
    cy.mount(<CredentialPage />);
    cy.get('#edit-credential').should('have.attr', 'aria-disabled', 'true');
  });
});
