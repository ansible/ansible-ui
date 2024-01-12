/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable i18next/no-literal-string */
import { CredentialType } from '../../../interfaces/CredentialType';
import { CredentialTypeDetailInner as CredentialTypeDetails } from './CredentialTypeDetails';
import mockCredentialType from '../../../../../cypress/fixtures/credential_type.json';
import { DateTime } from 'luxon';

describe('CredentialDetails', () => {
  it('Component renders and displays CredentialType', () => {
    cy.mount(<CredentialTypeDetails credentialType={mockCredentialType as CredentialType} />);
  });
  it('Renders name, input config, injector config, created, and modified by fields', () => {
    cy.mount(<CredentialTypeDetails credentialType={mockCredentialType as CredentialType} />);
    cy.get('[data-cy="name"]').should('have.text', 'Amazon Web ServicesRead-only');
    cy.get('[data-cy="input-configuration"]').should('exist');
    cy.get('[data-cy="injector-configuration"]').should('exist');
    cy.get('[data-cy="created"]').should(
      'have.text',
      DateTime.fromISO(mockCredentialType.created).toRelative()
    );
    cy.get('[data-cy="last-modified"]').should(
      'have.text',
      DateTime.fromISO(mockCredentialType.modified).toRelative()
    );
  });
});
