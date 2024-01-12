/* eslint-disable i18next/no-literal-string */
import { CredentialType } from '../../../interfaces/CredentialType';
import { CredentialTypePage } from './CredentialTypePage';

describe('CredentialTypePage', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/credential_types/*/', hostname: 'localhost' },
      { fixture: 'credential_type.json' }
    );
    cy.mount(<CredentialTypePage />);
  });
  it('Displays breadcrumbs back to Credential Types list page', () => {
    cy.get('.pf-v5-c-tabs__item').eq(0).should('have.text', 'Back to Credential Types');
  });
  it('Should show disabled edit button', () => {
    cy.fixture('credentialType').then((credentialType: CredentialType) => {
      credentialType.summary_fields.user_capabilities.delete = false;
    });
    cy.mount(<CredentialTypePage />);
    cy.get('[data-cy="edit-credential-type"]').should('have.attr', 'aria-disabled', 'true');
  });

  it('Should show disabled delete button', () => {
    cy.fixture('credentialType').then((credentialType: CredentialType) => {
      credentialType.summary_fields.user_capabilities.delete = false;
    });
    cy.mount(<CredentialTypePage />);
    cy.get('button[aria-label="Actions"]').click();
    cy.contains('a.pf-v5-c-dropdown__menu-item', 'Delete credential type').should(
      'have.attr',
      'aria-disabled',
      'true'
    );
  });
});
