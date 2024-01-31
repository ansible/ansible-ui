import { Approvals } from './constants';
import { randomString } from '../../../framework/utils/random-string';

describe('Approvals', () => {
  let thisCollectionName: string;
  let namespace: string;
  let repository: string;

  beforeEach(() => {
    thisCollectionName = 'hub_e2e_' + randomString(5).toLowerCase();
    namespace = 'hub_e2e_namespace' + randomString(5).toLowerCase();
    cy.hubLogin();
    cy.getNamespace(namespace);
    cy.uploadCollection(thisCollectionName, namespace);
    cy.galaxykit('task wait all');

    cy.navigateTo('hub', Approvals.url);
  });

  afterEach(() => {
    cy.deleteCollection(thisCollectionName, namespace, repository);
    cy.deleteNamespace(namespace);
  });

  it('user can upload a new collection and approve it', () => {
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
      cy.get('[data-cy="status-column-cell"]').should('have.text', 'Needs review');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Approve collections').click();
    });

    cy.galaxykit('task wait all');
    cy.assertModalSuccess();
    cy.clickModalButton('Close');

    repository = 'published';
  });

  it('user can upload a new collection and reject it', () => {
    cy.navigateTo('hub', Approvals.url);
    cy.verifyPageTitle(Approvals.title);
    cy.clickTableRowPinnedAction(thisCollectionName, 'reject');

    //Verify Reject modal
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.get('header').contains('Reject collections');
      cy.get('button').contains('Reject collections').should('have.attr', 'aria-disabled', 'true');
      cy.get('[data-cy="namespace-column-cell"]').should('have.text', namespace);
      cy.get('[data-cy="collection-column-cell"]').should('have.text', thisCollectionName);
      cy.get('[data-cy="version-column-cell"]').should('have.text', '1.0.0');
      cy.get('[data-cy="status-column-cell"]').should('have.text', 'Needs review');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Reject collections').click();
    });

    cy.galaxykit('task wait all');
    cy.assertModalSuccess();
    cy.clickModalButton('Close');

    repository = 'rejected';
  });

  it('user can approve a collection and then reject it', () => {
    cy.navigateTo('hub', Approvals.url);
    cy.verifyPageTitle(Approvals.title);
    cy.clickTableRowPinnedAction(thisCollectionName, 'approve');

    //Verify Approve modal
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.get('header').contains('Approve collections');
      cy.get('button').contains('Approve collections').should('have.attr', 'aria-disabled', 'true');
      cy.get('[data-cy="namespace-column-cell"]').should('have.text', namespace);
      cy.get('[data-cy="collection-column-cell"]').should('have.text', thisCollectionName);
      cy.get('[data-cy="version-column-cell"]').should('have.text', '1.0.0');
      cy.get('[data-cy="status-column-cell"]').should('have.text', 'Needs review');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Approve collections').click();
    });

    cy.galaxykit('task wait all');
    cy.assertModalSuccess();
    cy.clickModalButton('Close');

    repository = 'published';

    cy.clickButton(/^Clear all filters$/);
    cy.clickTableRowPinnedAction(thisCollectionName, 'reject');

    //Verify Reject modal
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.get('header').contains('Reject collections');
      cy.get('button').contains('Reject collections').should('have.attr', 'aria-disabled', 'true');
      cy.get('[data-cy="namespace-column-cell"]').should('have.text', namespace);
      cy.get('[data-cy="collection-column-cell"]').should('have.text', thisCollectionName);
      cy.get('[data-cy="version-column-cell"]').should('have.text', '1.0.0');
      cy.get('[data-cy="status-column-cell"]').should('have.text', 'Approved');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Reject collections').click();
    });

    cy.galaxykit('task wait all');
    cy.assertModalSuccess();
    cy.clickModalButton('Close');

    repository = 'rejected';
  });

  it('user can reject a collection and then approve it', () => {
    cy.navigateTo('hub', Approvals.url);
    cy.verifyPageTitle(Approvals.title);
    cy.clickTableRowPinnedAction(thisCollectionName, 'reject');

    //Verify Reject modal
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.get('header').contains('Reject collections');
      cy.get('button').contains('Reject collections').should('have.attr', 'aria-disabled', 'true');
      cy.get('[data-cy="namespace-column-cell"]').should('have.text', namespace);
      cy.get('[data-cy="collection-column-cell"]').should('have.text', thisCollectionName);
      cy.get('[data-cy="version-column-cell"]').should('have.text', '1.0.0');
      cy.get('[data-cy="status-column-cell"]').should('have.text', 'Needs review');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Reject collections').click();
    });

    cy.galaxykit('task wait all');
    cy.assertModalSuccess();
    cy.clickModalButton('Close');

    repository = 'rejected';

    cy.clickButton(/^Clear all filters$/);
    cy.clickTableRowPinnedAction(thisCollectionName, 'approve');

    //Verify Approval modal
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.get('header').contains('Approve collections');
      cy.get('button').contains('Approve collections').should('have.attr', 'aria-disabled', 'true');
      cy.get('[data-cy="namespace-column-cell"]').should('have.text', namespace);
      cy.get('[data-cy="collection-column-cell"]').should('have.text', thisCollectionName);
      cy.get('[data-cy="version-column-cell"]').should('have.text', '1.0.0');
      cy.get('[data-cy="status-column-cell"]').should('have.text', 'Rejected');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Approve collections').click();
    });

    cy.galaxykit('task wait all');
    cy.assertModalSuccess();
    cy.clickModalButton('Close');

    repository = 'published';
  });
});
