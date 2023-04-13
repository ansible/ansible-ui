/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable i18next/no-literal-string */
import { CredentialType } from '../../../interfaces/CredentialType';
import { CredentialDetails } from './CredentialDetails';
import mockCredential from '../../../../../cypress/fixtures/credential.json';
import { Credential } from '../../../interfaces/Credential';

describe('CredentialDetails', () => {
  it('Component renders and displays Credential', () => {
    cy.fixture('credentialType').then((credentialType: CredentialType) => {
      cy.intercept('GET', '/api/v2/credential_types/*', credentialType).as(
        'NotEditableCredentialType'
      );
    });
    cy.fixture('credentialType').then((credentialInputSources: CredentialType) => {
      cy.intercept('GET', '/api/v2/credentials/2/input_sources/*', credentialInputSources);
    });
    cy.mount(<CredentialDetails credential={mockCredential as Credential} />);
    cy.contains('dd#name>div', 'Ansible Galaxy').should('exist');
  });
});
