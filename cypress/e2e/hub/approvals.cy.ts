import { Approvals, MyImports } from './constants';
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

  // unskip after https://github.com/ansible/ansible-ui/pull/1473 (AAH-2509) is merged.
  it.skip('user can view import logs', () => {
    cy.navigateTo('hub', Approvals.url);
    cy.filterTableByTypeAndText('Collection', thisCollectionName);
    cy.filterTableByTypeAndText('Namespace', namespace);

    // 'Needs review' is selected by default, so unselect it
    cy.filterByMultiSelection('Status', 'Needs review');
    cy.clickTableRowPinnedAction(namespace, 'view-import-logs', false);

    cy.url().should('include', MyImports.url);
    cy.url().should('include', namespace);
    cy.url().should('include', thisCollectionName);
    cy.url().should('include', '1.0.0');

    cy.verifyPageTitle(MyImports.title);
    cy.contains(namespace);
    cy.contains(thisCollectionName);
  });
});
