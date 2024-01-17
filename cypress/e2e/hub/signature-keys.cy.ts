import { SignatureKeys } from './constants';
import { pulpAPI } from '../../support/formatApiPathForHub';

describe('Signature Keys', () => {
  before(() => {
    cy.hubLogin();
  });

  it('should render the signature keys page', () => {
    cy.navigateTo('hub', SignatureKeys.url);
    cy.verifyPageTitle(SignatureKeys.title);
  });
  it('should show no content when no data', () => {
    cy.contains('No signature keys yet').should('be.visible');
  });
  it('should contain correct table headers', () => {
    // backend on CI not supporting signing yet so it's not possible to create signature key, mocking instead
    cy.intercept(
      { method: 'GET', url: pulpAPI`/signing-services/*` },
      { fixture: 'hubSignatureKeys.json' }
    ).as('signatureKeys');
    cy.navigateTo('hub', SignatureKeys.url);
    cy.wait('@signatureKeys');
    cy.get('[data-cy="name-column-header"]').should('be.visible');
    cy.get('[data-cy="fingerprint-column-header"]').should('be.visible');
    cy.get('[data-cy="public-key-column-header"]').should('be.visible');
    cy.get('[data-cy="created-column-header"]').should('be.visible');
  });
  it('should contain table with row that contains two CopyCells and download button', () => {
    cy.intercept(
      { method: 'GET', url: pulpAPI`/signing-services/*` },
      { fixture: 'hubSignatureKeys.json' }
    ).as('signatureKeys');
    cy.navigateTo('hub', SignatureKeys.url);
    cy.wait('@signatureKeys');
    cy.get('[data-cy="row-0"]').within(() => {
      cy.get('[data-cy="fingerprint-column-cell"]').should('be.visible');
      cy.get('[data-cy="public-key-column-cell"]').should('be.visible');
      cy.get('[data-cy="download-key"]').should('be.visible');
    });
  });
});
