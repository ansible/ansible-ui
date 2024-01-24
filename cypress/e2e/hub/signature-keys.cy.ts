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
  it('should display empty state when no content when no data', () => {
    cy.navigateTo('hub', SignatureKeys.url);
    cy.get('[data-cy="empty-state-title"]')
      .should('contain', 'No signature keys yet')
      .should('be.visible');
  });
  it('should display name and public key mocked data in the list page', () => {
    // backend on CI not supporting signing yet so it's not possible to create signature key, mocking instead
    const resourceValues = ['name', 'public-key'];
    cy.intercept(
      { method: 'GET', url: pulpAPI`/signing-services/*` },
      { fixture: 'hubSignatureKeys.json' }
    ).as('signatureKeys');
    cy.navigateTo('hub', SignatureKeys.url);
    cy.wait('@signatureKeys')
      .its(`response.body.results[0].public_key`)
      .then((public_key) => {
        cy.get(`[data-cy="${resourceValues[1]}-column-cell"]`).within(() => {
          cy.get('.pf-v5-c-truncate__start').should('contain', public_key as string);
        });
      });
    cy.wait('@signatureKeys')
      .its(`response.body.results[0].name`)
      .then((name) => {
        cy.get(`[data-cy="${resourceValues[0]}-column-cell"]`).within(() => {
          cy.contains(name as string).should('be.visible');
        });
      });
  });

  it('should display finger print mocked data in the list page', () => {
    // backend on CI not supporting signing yet so it's not possible to create signature key, mocking instead
    const resourceValue = 'fingerprint';
    cy.intercept(
      { method: 'GET', url: pulpAPI`/signing-services/*` },
      { fixture: 'hubSignatureKeys.json' }
    ).as('signatureKeys');
    cy.navigateTo('hub', SignatureKeys.url);
    cy.wait('@signatureKeys')
      .its(`response.body.results[0].pubkey_fingerprint`)
      .then((pubkey_fingerprint) => {
        cy.get(`[data-cy="${resourceValue}-column-cell"]`).within(() => {
          cy.get('.pf-v5-c-truncate__start').should('contain', pubkey_fingerprint as string);
        });
      });
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
