import { randomE2Ename } from '../../support/utils';
import { Approvals, Collections, MyImports } from './constants';

describe('Approvals', () => {
  it('user can upload a new collection, approve, reject, approve, and view import logs', () => {
    // Need at least one extra repository so the select repostories modal can be tested
    cy.createHubRepository().then((repository) => {
      cy.createHubNamespace().then((namespace) => {
        cy.navigateTo('hub', Approvals.url);
        cy.verifyPageTitle(Approvals.title);

        const collectionName = randomE2Ename();
        cy.uploadCollection(collectionName, namespace.name);
        cy.filterTableBySingleText(collectionName);
        cy.contains('tr', collectionName);

        // Approve Collection
        cy.filterTableBySingleText(collectionName);
        cy.clickTableRowPinnedAction(collectionName, 'sign-and-approve', false);
        cy.getModal().within(() => {
          cy.contains('Select repositories');
          cy.filterTableBySingleText('published');
          cy.get(`[name="data-list-check-published"]`).click();
          cy.contains('button', 'Select').click();
        });
        cy.getModal().should('not.exist');

        // Verify Approved
        cy.navigateTo('hub', Approvals.url);
        cy.filterTableBySingleText(collectionName);
        cy.get('tr').should('have.length', 2);
        cy.getTableRowByText(collectionName, false).within(() => {
          cy.contains(collectionName);
          cy.contains(namespace.name);
          cy.contains('published');
          cy.contains('Signed and Approved');
        });

        // Verify Collection
        cy.navigateTo('hub', Collections.url);
        cy.filterTableBySingleText(collectionName);
        cy.contains(collectionName);
        cy.contains(namespace.name);
        cy.contains('published');

        // Reject Collection
        cy.navigateTo('hub', Approvals.url);
        cy.filterTableBySingleText(collectionName);
        cy.clickTableRowPinnedAction(collectionName, 'reject', false);
        cy.getModal().within(() => {
          cy.get('input[id="confirm"]').click();
          cy.get('button').contains('Reject collections').click();
          cy.containsBy('button', 'Close').click();
        });
        cy.getModal().should('not.exist');

        // Verify Rejected
        cy.navigateTo('hub', Approvals.url);
        cy.filterTableBySingleText(collectionName);
        cy.get('tr').should('have.length', 2);
        cy.getTableRowByText(collectionName, false).within(() => {
          cy.contains(collectionName);
          cy.contains(namespace.name);
          cy.contains('Rejected');
        });

        // Approve Collection
        cy.navigateTo('hub', Approvals.url);
        cy.filterTableBySingleText(collectionName);
        cy.clickTableRowPinnedAction(collectionName, 'sign-and-approve', false);
        cy.getModal().within(() => {
          cy.contains('Select repositories');
          cy.filterTableBySingleText('published');
          cy.get(`[name="data-list-check-published"]`).click();
          cy.contains('button', 'Select').click();
        });
        cy.getModal().should('not.exist');

        // Verify Approved
        cy.navigateTo('hub', Approvals.url);
        cy.filterTableBySingleText(collectionName);
        cy.get('tr').should('have.length', 2);
        cy.getTableRowByText(collectionName, false).within(() => {
          cy.contains(collectionName);
          cy.contains(namespace.name);
          cy.contains('published');
          cy.contains('Signed and Approved');
        });

        // View Import Logs
        cy.navigateTo('hub', Approvals.url);
        cy.filterTableBySingleText(collectionName);
        cy.clickTableRowPinnedAction(collectionName, 'view-import-logs', false);
        cy.verifyPageTitle(MyImports.title);
        cy.url().should('include', MyImports.url);
        cy.url().should('include', namespace.name);
        cy.url().should('include', collectionName);
        cy.url().should('include', '1.0.0');
        cy.contains(namespace.name);
        cy.contains(collectionName);

        cy.deleteHubCollection({
          repository: { name: 'published' },
          collection_version: { namespace: namespace.name, name: collectionName },
        });
        cy.deleteHubNamespace(namespace);
      });
      cy.deleteHubRepository(repository);
    });
  });
});
