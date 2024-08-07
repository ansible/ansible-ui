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
      cy.intercept('GET', '/api/v2/credential_types*', credentialType);
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
    cy.getByDataCy('actions-dropdown').click();
    cy.contains('#delete-credential', /^Delete credential$/).should(
      'have.attr',
      'aria-disabled',
      'true'
    );
  });

  it('Should disable edit button', () => {
    cy.fixture('credential').then((credential: Credential) => {
      credential.summary_fields.user_capabilities.edit = false;
      cy.intercept('GET', '/api/v2/credentials/*', credential);
    });
    cy.mount(<CredentialPage />);
    cy.contains('#edit-credential', /^Edit credential$/).should(
      'have.attr',
      'aria-disabled',
      'true'
    );
  });
  it('Should render all the tabs', () => {
    const tabNames: string[] = [
      'Back to Credentials',
      'Details',
      'Job Templates',
      'Team Access',
      'User Access',
    ];
    cy.mount(<CredentialPage />);

    cy.get('.pf-v5-c-tabs__list').within(() => {
      cy.get('.pf-v5-c-tabs__item').should('have.length', 5);
      cy.get('.pf-v5-c-tabs__item').each((tab, index) => {
        cy.wrap(tab).should('contain', tabNames[index]);
      });
    });
  });
});
