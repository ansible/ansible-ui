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
    cy.navigateTo('hub', Approvals.url);
    cy.verifyPageTitle(Approvals.title);
    cy.contains('button', 'Clear all filters').click();
  });

  it('should be able to view import logs', () => {
    // View Import Logs
    cy.filterTableBySingleText(collectionName);
    cy.get('[aria-label="Simple table"] [data-cy="actions-dropdown"]').click();
    cy.get(`[data-cy="view-import-logs"] button`).click();
    cy.verifyPageTitle(MyImports.title);
    cy.url().should('include', MyImports.url);
    cy.url().should('include', namespace.name);
    cy.url().should('include', collectionName);
    cy.url().should('include', '1.0.0');
    cy.contains(namespace.name);
    cy.contains(collectionName);
  });

  it('should be able to approve collection', () => {
    // Approve Collection
    cy.filterTableBySingleText(collectionName);
    cy.getByDataCy('approve-and-sign-collection').click();

    cy.getModal().within(() => {
      cy.contains('Select repositories');
      cy.filterTableBySingleText('published', true);
      cy.get(`[name="data-list-check-published"]`).click();
      cy.contains('button', 'Select').click();
    });
    cy.getModal().should('not.exist');
    cy.get('#refresh').click();
    // Verify Approved
    cy.filterTableBySingleText(collectionName, true);
    cy.get('tr').should('have.length', 2);
    cy.getTableRowByText(collectionName, false).within(() => {
      cy.contains(collectionName);
      cy.contains(namespace.name);
      cy.contains('published');
      cy.contains('Signed and Approved');
    });
    // Verify Collection
    cy.navigateTo('hub', Collections.url);
    cy.filterTableBySingleText(collectionName, true);
    cy.contains(collectionName);
    cy.contains(namespace.name);
    cy.contains('published');
  });

  it('should be able to reject collection', () => {
    // Reject Collection
    cy.filterTableBySingleText(collectionName);
    cy.getByDataCy('reject-collection').click();

    cy.getModal().within(() => {
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Reject collections').click();
      cy.containsBy('button', 'Close').click();
    });
    cy.getModal().should('not.exist');
    cy.get('#refresh').click();
    // Verify Rejected
    cy.filterTableBySingleText(collectionName, true);
    cy.get('tr').should('have.length', 2);
    cy.getTableRowByText(collectionName, false).within(() => {
      cy.contains(collectionName);
      cy.contains(namespace.name);
      cy.contains('Rejected');
    });
  });

  it.skip('can upload a signature to a collection', () => {});
});
