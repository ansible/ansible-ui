import { Approvals } from './constants';
import { randomString } from '../../../framework/utils/random-string';

describe('Approvals', () => {
  let thisCollectionName: string;
  let namespace: string;

  before(() => {
    cy.hubLogin();
    cy.getNamespace('ibm');
    cy.navigateTo('hub', Approvals.url);
  });

  after(() => {
    cy.deleteCollection(thisCollectionName, 'ibm', 'published');
  });

  it('it should render the approvals page', () => {
    cy.verifyPageTitle(Approvals.title);
  });

  it('user can upload a new collection and approve it', () => {
    thisCollectionName = 'test' + randomString(4).toLowerCase();
    namespace = 'ibm';

    cy.uploadCollection(thisCollectionName, namespace);
    cy.navigateTo('hub', Approvals.url);
    cy.verifyPageTitle(Approvals.title);
    cy.clickTableRowPinnedAction(thisCollectionName, 'approve');

    //Verify Approve and sign collections modal
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.get('header').contains('Approve collections');
      cy.get('button').contains('Approve collections').should('have.attr', 'aria-disabled', 'true');
      cy.get('[data-cy="namespace-column-cell"]').should('have.text', namespace);
      cy.get('[data-cy="collection-column-cell"]').should('have.text', thisCollectionName);
      cy.get('[data-cy="version-column-cell"]').should('have.text', '1.0.0');
      cy.get('[data-cy="status-column-cell"]').should('have.text', '' || 'Needs review');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Approve collections').click();
    });

    cy.assertModalSuccess();
    cy.clickModalButton('Close');
  });
});
