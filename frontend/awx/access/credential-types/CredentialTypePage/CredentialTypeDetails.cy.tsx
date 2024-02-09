/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable i18next/no-literal-string */
import mockCredentialType from '../../../../../cypress/fixtures/credential_type.json';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { CredentialType } from '../../../interfaces/CredentialType';
import { CredentialTypeDetailInner as CredentialTypeDetails } from './CredentialTypeDetails';

describe('CredentialDetails', () => {
  it('Component renders and displays CredentialType', () => {
    cy.mount(<CredentialTypeDetails credentialType={mockCredentialType as CredentialType} />);
  });
  it('Renders name, input config, injector config, created, and modified by fields', () => {
    cy.mount(<CredentialTypeDetails credentialType={mockCredentialType as CredentialType} />);
    cy.get('[data-cy="name"]').should('have.text', 'Amazon Web ServicesRead-only');
    cy.get('[data-cy="input-configuration"]').should('exist');
    cy.get('[data-cy="injector-configuration"]').should('exist');
    cy.get('[data-cy="created"]').should('have.text', formatDateString(mockCredentialType.created));
    cy.get('[data-cy="last-modified"]').should(
      'have.text',
      formatDateString(mockCredentialType.modified)
    );
  });
});
