import { pulpAPI } from '../../support/formatApiPathForHub';
import { SignatureKeys } from './constants';

describe('Signature Keys', () => {
  beforeEach(() => {
    cy.hubLogin();
  });

  it('should display name and public key in the list page', () => {
    const resourceValues = ['name', 'public-key'];
    cy.intercept({ method: 'GET', url: pulpAPI`/signing-services/*` }).as('signatureKeys');
    cy.navigateTo('hub', SignatureKeys.url);
    cy.wait('@signatureKeys')
      .its(`response.body.results[0].public_key`)
      .then((public_key) => {
        cy.get(`[data-cy="${resourceValues[1]}-column-cell"]`)
          .first()
          .within(() => {
            cy.get('.pf-v5-c-truncate__start').should('contain', public_key as string);
          });
      });
    cy.wait('@signatureKeys')
      .its(`response.body.results[0].name`)
      .then((name) => {
        cy.get(`[data-cy="${resourceValues[0]}-column-cell"]`)
          .first()
          .within(() => {
            cy.contains(name as string).should('be.visible');
          });
      });
  });

  it('should display finger print in the list page', () => {
    const resourceValue = 'fingerprint';
    cy.intercept({ method: 'GET', url: pulpAPI`/signing-services/*` }).as('signatureKeys');
    cy.navigateTo('hub', SignatureKeys.url);
    cy.wait('@signatureKeys')
      .its(`response.body.results[0].pubkey_fingerprint`)
      .then((pubkey_fingerprint) => {
        cy.get(`[data-cy="${resourceValue}-column-cell"]`)
          .first()
          .within(() => {
            cy.get('.pf-v5-c-truncate__start').should('contain', pubkey_fingerprint as string);
          });
      });
  });
  it('should contain correct table headers', () => {
    cy.intercept({ method: 'GET', url: pulpAPI`/signing-services/*` }).as('signatureKeys');
    cy.navigateTo('hub', SignatureKeys.url);
    cy.wait('@signatureKeys');
    cy.get('[data-cy="name-column-header"]').should('be.visible');
    cy.get('[data-cy="fingerprint-column-header"]').should('be.visible');
    cy.get('[data-cy="public-key-column-header"]').should('be.visible');
    cy.get('[data-cy="created-column-header"]').should('be.visible');
  });
  it('should contain table with row that contains two CopyCells and download button', () => {
    cy.intercept({ method: 'GET', url: pulpAPI`/signing-services/*` }).as('signatureKeys');
    cy.navigateTo('hub', SignatureKeys.url);
    cy.wait('@signatureKeys');
    cy.get('[data-cy="row-0"]').within(() => {
      cy.get('[data-cy="fingerprint-column-cell"]').should('be.visible');
      cy.get('[data-cy="public-key-column-cell"]').should('be.visible');
      cy.get('[data-cy="download-key"]').should('be.visible');
    });
  });
});
