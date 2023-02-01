/* eslint-disable i18next/no-literal-string */
import { CredentialType } from '../../../interfaces/CredentialType';
import { Credential } from '../../../interfaces/Credential';
import { CredentialPage } from './CredentialPage';

describe('CredentialPage', () => {
  beforeEach(() => {
    cy.fixture('credentialType').then((credentialType: CredentialType) => {
      cy.intercept('GET', '/api/v2/credential_types/*', credentialType).as(
        'NotEditableCredentialType'
      );
    });

    cy.fixture('credentialType').then((credentialType: CredentialType) => {
      cy.intercept('GET', '/api/v2/credentials/2/input_sources/*', credentialType);
    });
  });
  it('Should not show the delete drop down', () => {
    cy.fixture('credential').then((credential: Credential) => {
      credential.summary_fields.user_capabilities.delete = false;
      cy.intercept('GET', '/api/v2/credentials/*', credential).as('NotEditableCredentialType');
    });
    cy.mount(<CredentialPage />);
    cy.get('button#delete-credential').should('not.exist');
  });
  it('Should not show the edit button', () => {
    cy.fixture('credential').then((credential: Credential) => {
      credential.summary_fields.user_capabilities.edit = false;
      cy.intercept('GET', '/api/v2/credentials/*', credential).as('NotEditableCredentialType');
    });
    cy.mount(<CredentialPage />);
    cy.get('button#edit-credential').should('not.exist');
  });
});
