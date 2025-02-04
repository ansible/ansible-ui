import mockCredential from '@ansible/cypress/fixtures/credential.json';
import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import { Credential } from '../../../interfaces/Credential';
import { CredentialType } from '../../../interfaces/CredentialType';
import { CredentialDetailsInner as CredentialDetails } from './CredentialDetails';

describe('CredentialDetails', () => {
  it('Component renders and displays Credential', () => {
    cy.fixture('credentialType').then((credentialType: CredentialType) => {
      cy.intercept('GET', awxAPI`/credential_types/*`, credentialType).as(
        'NotEditableCredentialType'
      );
    });
    cy.fixture('credentialType').then((credentialInputSources: CredentialType) => {
      cy.intercept('GET', awxAPI`/credentials/2/input_sources/*`, credentialInputSources);
    });
    cy.mount(<CredentialDetails credential={mockCredential as Credential} />);
    cy.contains('dd#name>div', 'Ansible Galaxy').should('exist');
  });
});
