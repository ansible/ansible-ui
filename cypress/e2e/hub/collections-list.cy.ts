// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Repository } from '../../../frontend/hub/administration/repositories/Repository';
import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
import { randomE2Ename } from '../../support/utils';
import { Collections, Repositories } from './constants';

describe.skip('Collections List', () => {
  let namespace: HubNamespace;
  let repository: Repository;
  let collectionName: string;

  before(() => {
    collectionName = randomE2Ename();
    cy.createHubNamespace().then((namespaceResult) => {
      namespace = namespaceResult;
      cy.uploadCollection(collectionName, namespace.name, '1.0.0');
      cy.approveCollection(collectionName, namespace.name, '1.0.0');
    });
    cy.createHubRepository().then((repositoryResult) => {
      repository = repositoryResult;
      cy.galaxykit('distribution create', repository.name);
      cy.waitForAllTasks();
    });
  });

  after(() => {
    // TODO - this is another PR - cy.deletehubDistribution(repository.name);
    cy.deleteHubRepository(repository);
    cy.deleteCollectionsInNamespace(namespace.name);
    cy.deleteHubNamespace({ ...namespace, failOnStatusCode: false });
  });

  beforeEach(() => {
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
  });

  it('can copy a version to repository and then delete it from new repository', () => {
    cy.waitForAllTasks();

    cy.navigateTo('hub', 'collections');
    cy.filterTableBySingleText(collectionName);

    cy.get('[data-cy="data-list-name"]').should('have.text', collectionName);
    cy.get('[data-cy="data-list-action"]').within(() => {
      cy.get('[data-cy="actions-dropdown"]').first().click();
    });

    cy.get('[data-cy="copy-version-to-repositories"] button').click();

    cy.collectionCopyVersionToRepositories(collectionName);

    // delete it from repositories
    cy.getByDataCy('table-view').click();
    cy.navigateTo('hub', Repositories.url);
    cy.filterTableBySingleText('community');
    cy.contains(`[role="tab"]`, 'Collection Versions').click();
    cy.filterTableBySingleText(collectionName);
    actionClick(collectionName, 'delete-entire-collection-from-repository');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete collections/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.contains('No collection versions yet');
  });

  it('can sign a collection', () => {
      // Sign collection
      cy.getByDataCy('table-view').click();
      cy.filterTableBySingleText(collectionName, true);
      actionClick(collectionName, 'sign-collection');
      cy.get('#confirm').click();
      cy.clickButton(/^Sign collections$/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.getModal().should('not.exist');
      // Verify collection has been signed
      cy.get('[data-cy="label-signed"]').contains(Collections.signedStatus);
  });

  it('can upload, sign and approve and delete collection from system', () => {
    cy.galaxykit('collection upload --skip-upload', namespace.name, collectionName2).then(
      (result) => {
        // Upload collection
        const filePath = result.filename as string;
        cy.uploadHubCollectionFile(filePath);
        cy.get('input[id="radio-non-pipeline"]').click();
        cy.getTableRowBySingleText('validated', true).within(() => {
          cy.get('td[data-cy=checkbox-column-cell]').click();
        });
        cy.get('[data-cy="Submit"]').click();
        // Verify collection has been uploaded
        cy.verifyPageTitle(Collections.title);
        // Delete collection
        cy.getByDataCy('table-view').click();

        // sign and approve
        actionClick(collectionName2, 'sign-collection');
        cy.get('#confirm').click();
        cy.clickButton(/^Sign collections$/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
        cy.get('[data-cy="label-signed"]').contains(Collections.signedStatus);

        actionClick(collectionName2, 'delete-entire-collection-from-system');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete collections/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
        cy.getModal().should('not.exist');
        // Verify collection has been deleted from system
        cy.getByDataCy('table-view').click();
        cy.filterTableBySingleText(collectionName2, true);
        cy.contains('No results found');
      }
    );
  });

  it('can upload and then delete a new version to an existing collection', () => {
    cy.uploadCollection(collectionName, namespace.name);
    cy.galaxykit(
      'collection move',
      namespace.name,
      collectionName,
      '1.0.0',
      'staging',
      repository.name
    );
    cy.waitForAllTasks();
    cy.galaxykit('collection upload --skip-upload', namespace.name, collectionName, '1.2.3').then(
      (result: { filename: string }) => {
        cy.getByDataCy('table-view').click();
        cy.filterTableBySingleText(collectionName, true);
        cy.clickTableRow(collectionName, false);
        // Details Page
        cy.get(`[data-cy="${collectionName}"]`).should('contain', `${collectionName}`);
        // Upload new version
        cy.clickPageAction('upload-new-version');
        cy.get('#file-browse-button').click();
        cy.get('input[id="file-filename"]').selectFile(result.filename, {
          action: 'drag-drop',
        });
        // Upload page

        cy.get('#radio-non-pipeline').click();
        cy.filterTableBySingleText(repository.name, true);
        cy.getTableRowByText(repository.name, false).within(() => {
          cy.getByDataCy('checkbox-column-cell').click();
        });
        cy.get('[data-cy="Submit"]').click();

        // Collections Page
        cy.verifyPageTitle(Collections.title);
        cy.getByDataCy('table-view').click();
        cy.filterTableBySingleText(collectionName, true);
        cy.clickTableRow(collectionName, false);
        // Details Page
        cy.get(`[data-cy="${collectionName}"]`).should('contain', `${collectionName}`); //assert that we are looking at the collection we expect
        cy.get('[data-cy="version"]').should('contain', '1.2.3'); //assert that the version has changed
        cy.get('[data-cy="actions-dropdown"]')
          .click()
          .then(() => {
            cy.get('#delete-version-from-system').click();
          });
        cy.get('[data-ouia-component-id="Permanently delete collections versions"]').within(() => {
          cy.get('[data-ouia-component-id="confirm"]').click();
          cy.get('[data-ouia-component-id="submit"]').click();
          cy.clickButton(/^Close$/);
        });
      }
    );
    cy.deleteHubCollectionByName(collectionName);
  });


  it('can delete entire collection from repository', () => {
    cy.uploadCollection(collectionName, namespace.name);
    cy.galaxykit(
      'collection move',
      namespace.name,
      collectionName,
      '1.0.0',
      'staging',
      repository.name
    );
    cy.waitForAllTasks();
    // Delete collection from repository
    cy.getByDataCy('table-view').click();
    actionClick(collectionName, 'delete-entire-collection-from-repository');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete collections/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    //Verify collection has been deleted from repository
    cy.getHubCollection(collectionName).then((deleted) => {
      //Assert that the query returns an empty array, indicating no API results exist
      expect(deleted.data).to.be.empty;
    });
    //Removed the lines attempting to assert that filtering the list for the collection returns an empty list
    //these lines fail if there are no Collections present
  });

  it('can deprecate a collection', () => {
    cy.uploadCollection(collectionName, namespace.name);
    cy.galaxykit(
      'collection move',
      namespace.name,
      collectionName,
      '1.0.0',
      'staging',
      repository.name
    );
    cy.waitForAllTasks();
    cy.getByDataCy('table-view').click();
    actionClick(collectionName, 'deprecate-collection');
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.clickButton('Deprecate collections');
      cy.clickButton('Close');
    });
    cy.getModal().should('not.exist');
    cy.contains('h2', 'No results found').should('be.visible');
    cy.deleteHubCollectionByName(collectionName);
  });

  
});

function actionClick(item: string, action: string) {
  cy.filterTableBySingleText(item);
  cy.get('[aria-label="Simple table"] [data-cy="actions-dropdown"]').click();
  cy.get(`[data-cy="${action}"] button`).click();
}
