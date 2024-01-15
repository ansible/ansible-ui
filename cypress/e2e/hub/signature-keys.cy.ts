import { SignatureKeys } from './constants';

describe('Signature Keys', () => {
  before(() => {
    cy.hubLogin();
  });

  it('should render the signature keys page', () => {
    cy.navigateTo('hub', SignatureKeys.url);
    cy.verifyPageTitle(SignatureKeys.title);
  });
  it('no content', () => {
    cy.contains('No signature keys yet').should('be.visible');
  });
  it.skip('should contain correct table headers', () => {
    cy.navigateTo('hub', SignatureKeys.url);
    cy.get('[data-cy="name-column-header"]').should('be.visible');
    cy.get('[data-cy="fingerprint-column-header"]').should('be.visible');
    cy.get('[data-cy="public-_key-column-header"]').should('be.visible');
    cy.get('[data-cy="created-column-header"]').should('be.visible');
  });
  it.skip('should contain table with row that contains two CopyCells and download button', () => {
    cy.navigateTo('hub', SignatureKeys.url);
    // assuming we always have at least one signature key
    cy.get('[data-cy="row-0"]').within(() => {
      cy.get('[data-cy="fingerprint-column-cell"]').should('be.visible');
      cy.get('[data-cy="public-key-column-cell"]').should('be.visible');
      cy.get('[data-cy="download-key"]').should('be.visible');
    });
  });
});
