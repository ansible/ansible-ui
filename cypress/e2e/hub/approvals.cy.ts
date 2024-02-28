import { randomE2Ename } from '../../support/utils';
import { Approvals, Collections, MyImports } from './constants';

describe('Approvals', () => {
  it('user can upload a new collection, approve, reject, approve, and view import logs', () => {
    cy.createHubNamespace().then((namespace) => {
      // Need 2 collections otherwise there is a chance the dialog will not show the select
      const collection1Name = randomE2Ename();
      cy.uploadCollection(collection1Name, namespace.name);
      const collection2Name = randomE2Ename();
      cy.uploadCollection(collection2Name, namespace.name);

      cy.navigateTo('hub', Approvals.url);
      cy.verifyPageTitle(Approvals.title);

      // Verify collection 1 shows up in table
      cy.filterTableBySingleText(collection1Name);
      cy.contains('tr', collection1Name);

      // Verify collection 2 shows up in table
      cy.filterTableBySingleText(collection2Name);
      cy.contains('tr', collection2Name);

      // Approve Collection
      cy.filterTableBySingleText(collection1Name);
      cy.clickTableRowPinnedAction(collection1Name, 'sign-and-approve', false);
      cy.getModal().within(() => {
        cy.contains('Select repositories');
        cy.filterTableBySingleText('published');
        cy.get(`[name="data-list-check-published"]`).click();
        cy.contains('button', 'Select').click();
      });
      cy.getModal().should('not.exist');

      // Verify Approved
      cy.navigateTo('hub', Approvals.url);
      cy.filterTableBySingleText(collection1Name);
      cy.get('tr').should('have.length', 2);
      cy.getTableRowByText(collection1Name, false).within(() => {
        cy.contains(collection1Name);
        cy.contains(namespace.name);
        cy.contains('published');
        cy.contains('Signed and Approved');
      });

      // Verify Collection
      cy.navigateTo('hub', Collections.url);
      cy.filterTableBySingleText(collection1Name);
      cy.contains(collection1Name);
      cy.contains(namespace.name);
      cy.contains('published');

      // Reject Collection
      cy.navigateTo('hub', Approvals.url);
      cy.filterTableBySingleText(collection1Name);
      cy.clickTableRowPinnedAction(collection1Name, 'reject', false);
      cy.getModal().within(() => {
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains('Reject collections').click();
        cy.containsBy('button', 'Close').click();
      });
      cy.getModal().should('not.exist');

      // Verify Rejected
      cy.navigateTo('hub', Approvals.url);
      cy.filterTableBySingleText(collection1Name);
      cy.get('tr').should('have.length', 2);
      cy.getTableRowByText(collection1Name, false).within(() => {
        cy.contains(collection1Name);
        cy.contains(namespace.name);
        cy.contains('Rejected');
      });

      // Approve Collection
      cy.navigateTo('hub', Approvals.url);
      cy.filterTableBySingleText(collection1Name);
      cy.clickTableRowPinnedAction(collection1Name, 'sign-and-approve', false);
      cy.getModal().within(() => {
        cy.contains('Select repositories');
        cy.filterTableBySingleText('published');
        cy.get(`[name="data-list-check-published"]`).click();
        cy.contains('button', 'Select').click();
      });
      cy.getModal().should('not.exist');

      // Verify Approved
      cy.navigateTo('hub', Approvals.url);
      cy.filterTableBySingleText(collection1Name);
      cy.get('tr').should('have.length', 2);
      cy.getTableRowByText(collection1Name, false).within(() => {
        cy.contains(collection1Name);
        cy.contains(namespace.name);
        cy.contains('published');
        cy.contains('Signed and Approved');
      });

      // View Import Logs
      cy.navigateTo('hub', Approvals.url);
      cy.filterTableBySingleText(collection1Name);
      cy.clickTableRowPinnedAction(collection1Name, 'view-import-logs', false);
      cy.verifyPageTitle(MyImports.title);
      cy.url().should('include', MyImports.url);
      cy.url().should('include', namespace.name);
      cy.url().should('include', collection1Name);
      cy.url().should('include', '1.0.0');
      cy.contains(namespace.name);
      cy.contains(collection1Name);

      cy.deleteHubCollection({
        repository: { name: 'published' },
        collection_version: { namespace: namespace.name, name: collection1Name },
      });
      cy.deleteHubCollection({
        repository: { name: 'staging' },
        collection_version: { namespace: namespace.name, name: collection2Name },
      });
      cy.deleteHubNamespace(namespace);
    });
  });
});
