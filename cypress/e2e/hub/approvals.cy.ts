import { Repository } from '../../../frontend/hub/administration/repositories/Repository';
import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
import { randomE2Ename } from '../../support/utils';
import { Approvals, Collections, MyImports } from './constants';

describe('Approvals', () => {
  let repository: Repository;
  let namespace: HubNamespace;
  let collectionName: string;

  before(() => {
    // Need at least two repositories so the select repostories modal can be tested
    cy.createHubRepository({ repository: { pulp_labels: { pipeline: 'approved' } } }).then(
      (repositoryResult) => {
        repository = repositoryResult;
        cy.createHubNamespace().then((namespaceResult) => {
          namespace = namespaceResult;
          collectionName = randomE2Ename();
          cy.uploadCollection(collectionName, namespace.name);
        });
      }
    );
  });

  after(() => {
    cy.deleteHubCollectionByName(collectionName);
    cy.deleteHubNamespace(namespace);
    cy.deleteHubRepository(repository);
  });

  beforeEach(() => {
    cy.hubLogin();
  });

  it('user should be able to view import logs', () => {
    cy.navigateTo('hub', Approvals.url);
    cy.verifyPageTitle(Approvals.title);
    cy.clearAllFilters();

    // View Import Logs
    cy.filterTableBySingleText(collectionName);
    cy.clickTableRowPinnedAction(collectionName, 'view-import-logs', false);
    cy.verifyPageTitle(MyImports.title);
    cy.url().should('include', MyImports.url);
    cy.url().should('include', namespace.name);
    cy.url().should('include', collectionName);
    cy.url().should('include', '1.0.0');
    cy.contains(namespace.name);
    cy.contains(collectionName);
  });

  it('user should be able to approve collection', () => {
    cy.navigateTo('hub', Approvals.url);
    cy.verifyPageTitle(Approvals.title);
    cy.clearAllFilters();

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
  });

  it('user should be able to reject collection', () => {
    cy.navigateTo('hub', Approvals.url);
    cy.verifyPageTitle(Approvals.title);
    cy.clearAllFilters();

    // Reject Collection
    cy.filterTableBySingleText(collectionName);
    cy.clickTableRowPinnedAction(collectionName, 'reject', false);
    cy.getModal().within(() => {
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Reject collections').click();
      cy.containsBy('button', 'Close').click();
    });
    cy.getModal().should('not.exist');

    // Verify Rejected
    cy.filterTableBySingleText(collectionName);
    cy.get('tr').should('have.length', 2);
    cy.getTableRowByText(collectionName, false).within(() => {
      cy.contains(collectionName);
      cy.contains(namespace.name);
      cy.contains('Rejected');
    });
  });
});
