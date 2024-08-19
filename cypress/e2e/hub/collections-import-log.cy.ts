import { Repository } from '../../../frontend/hub/administration/repositories/Repository';
import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
import { hubAPI } from '../../support/formatApiPathForHub';
import { randomE2Ename } from '../../support/utils';
import { Collections } from './constants';

describe('Collections Import Log', () => {
  let namespace: HubNamespace;
  let repository: Repository;
  let collectionName: string;

  before(() => {
    collectionName = randomE2Ename();
    cy.createHubNamespace().then((namespaceResult) => {
      namespace = namespaceResult;
      cy.uploadCollection(collectionName, namespace.name, '1.0.0');
      cy.approveCollection(collectionName, namespace.name, '1.0.0');
      cy.waitForAllTasks();
    });
    cy.createHubRepository().then((repositoryResult) => {
      repository = repositoryResult;
      cy.galaxykit('distribution create', repository.name);
      cy.waitForAllTasks();
    });
  });

  after(() => {
    cy.deleteHubRepository(repository);
    cy.deleteCollectionsInNamespace(namespace.name);
    cy.deleteHubNamespace({ ...namespace, failOnStatusCode: false });
  });

  beforeEach(() => {
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
  });

  it('Collections Import Log tab collections error state', () => {
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');
    cy.intercept('GET', hubAPI`/_ui/v1/imports/collections/*`, {
      statusCode: 500,
      body: { error: 'Internal Server Error' },
    }).as('getImportLogMockError');
    cy.get('[data-cy="collection-import-log-tab"]').click();
    cy.wait('@getImportLogMockError');
    cy.contains('Internal Server Error').should('be.visible');
  });
  it('Collections Import Log tab collection detail error state', () => {
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');
    cy.intercept('GET', /\/_ui\/v1\/imports\/collections\/[^/]+\/([^?]*)/, {
      statusCode: 500,
      body: {
        error: 'Internal Server Error',
      },
    }).as('getImportLogMockError');
    cy.get('[data-cy="collection-import-log-tab"]').click();
    cy.wait('@getImportLogMockError');
    cy.contains('Internal Server Error').should('be.visible');
  });
  it('Collections Import Log tab non-empty state', () => {
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');
    cy.get('[data-cy="collection-import-log-tab"]').click();
    cy.getByDataCy('label-status').should('be.visible');
    cy.getByDataCy('label-approval-status').should('be.visible');
    cy.getByDataCy('label-version').should('be.visible');
    cy.contains('Completed').should('be.visible');
    cy.contains('Approved').should('be.visible');
    cy.contains('1.0.0').should('be.visible');
    // Code editor for log messages
    cy.getByDataCy('import-log').should('be.visible');
  });
});
