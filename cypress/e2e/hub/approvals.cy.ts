import { Approvals, Collections, MyImports } from './constants';
import { randomString } from '../../../framework/utils/random-string';
import { randomHubName } from './utils/random-name';

describe('Approvals', () => {
  let thisCollectionName: string;
  let namespace: string;
  let repository: string;
  let anotherRepoName: string;

  before(() => {
    // this is important, we need at least two approved repos (this one and published) to test approve modal
    // there is no way we can test approval to single repo, we have no control over the number of approved repos in system
    // (except mocking the API, which can be done in future).
    anotherRepoName = 'hub_e2e_new_repo_' + randomString(5).toLowerCase();
    cy.galaxykit(`repository create ${anotherRepoName} --pipeline approved`);
    cy.galaxykit('task wait all');
    repository = 'staging';
  });

  after(() => {
    cy.galaxykit(`-i repository delete ${anotherRepoName}`);
  });

  beforeEach(() => {
    thisCollectionName = randomHubName('approvals_collection');
    namespace = randomHubName('approvals_namespace');
    cy.hubLogin();
    cy.createNamespace(namespace);
    cy.galaxykit('task wait all');
    cy.uploadCollection(thisCollectionName, namespace);
    cy.galaxykit('task wait all');

    cy.navigateTo('hub', Approvals.url);
  });

  afterEach(() => {
    cy.deleteCollection(thisCollectionName, namespace, repository);
    cy.galaxykit('task wait all');
    cy.deleteNamespace(namespace);
  });

  it('user can upload a new collection and approve it', () => {
    approve('Needs review');
  });

  function approve(status: string) {
    cy.navigateTo('hub', Approvals.url);
    cy.verifyPageTitle(Approvals.title);
    clickTableRowPinnedAction(thisCollectionName, 'approve');

    //Verify Approve and sign collections modal
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.get('header').contains('Approve collections');
      cy.get('button').contains('Approve collections').should('have.attr', 'aria-disabled', 'true');
      cy.get('[data-cy="namespace-column-cell"]').should('have.text', namespace);
      cy.get('[data-cy="collection-column-cell"]').should('have.text', thisCollectionName);
      cy.get('[data-cy="version-column-cell"]').should('have.text', '1.0.0');
      cy.get('[data-cy="status-column-cell"]').should('have.text', status);
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Approve collections').click();
    });

    // handle modal
    const modal = `[aria-label="Select repositories"] `;
    cy.get(modal).within(() => {
      cy.contains('Select repositories');
      cy.filterTableBySingleText('published{enter}');
      cy.contains('published');
      cy.get(`[name="data-list-check-published"]`).click();
      cy.contains('button', 'Select').click();
    });

    cy.galaxykit('task wait all');
    cy.get(modal).should('not.exist');

    // verify its really approved
    cy.navigateTo('hub', Approvals.url);
    cy.filterTableBySingleText(thisCollectionName + '{enter}');
    cy.contains(thisCollectionName);
    cy.contains(namespace);
    cy.contains('published');

    cy.navigateTo('hub', Collections.url);
    cy.get(`[aria-label="Type to filter"]`).type(thisCollectionName + '{enter}');
    cy.contains('Clear all filters');
    cy.contains(thisCollectionName);
    cy.contains(namespace);
    cy.contains('published');

    repository = 'published';
  }

  it('user can upload a new collection and reject it', () => {
    reject('Needs review');
  });

  function reject(status: string) {
    cy.navigateTo('hub', Approvals.url);
    cy.verifyPageTitle(Approvals.title);
    clickTableRowPinnedAction(thisCollectionName, 'reject');

    //Verify Reject modal
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.get('header').contains('Reject collections');
      cy.get('button').contains('Reject collections').should('have.attr', 'aria-disabled', 'true');
      cy.get('[data-cy="namespace-column-cell"]').should('have.text', namespace);
      cy.get('[data-cy="collection-column-cell"]').should('have.text', thisCollectionName);
      cy.get('[data-cy="version-column-cell"]').should('have.text', '1.0.0');
      cy.get('[data-cy="status-column-cell"]').should('have.text', status);
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Reject collections').click();
    });

    cy.galaxykit('task wait all');
    cy.assertModalSuccess();
    cy.clickModalButton('Close');

    // verify its really rejected
    cy.navigateTo('hub', Approvals.url);
    cy.filterTableBySingleText(thisCollectionName + '{enter}');
    cy.contains(thisCollectionName);
    cy.contains(namespace);
    cy.contains('rejected');

    repository = 'rejected';
  }

  it('user can approve a collection and then reject it', () => {
    approve('Needs review');
    reject('Approved');
  });

  it('user can reject a collection and then approve it', () => {
    reject('Needs review');
    approve('Rejected');
  });

  it('user can view import logs', () => {
    cy.filterTableBySingleText(thisCollectionName);
    clickTableRowPinnedAction(thisCollectionName, 'view-import-logs');

    cy.url().should('include', MyImports.url);
    cy.url().should('include', namespace);
    cy.url().should('include', thisCollectionName);
    cy.url().should('include', '1.0.0');

    cy.verifyPageTitle(MyImports.title);
    cy.contains(namespace);
    cy.contains(thisCollectionName);

    repository = 'staging';
  });
});

function clickTableRowPinnedAction(text: string, action: string) {
  cy.filterTableBySingleText(text + '{enter}');
  cy.get(`[data-cy="actions-column-cell"] [data-cy="${action}"]`).click();
}
