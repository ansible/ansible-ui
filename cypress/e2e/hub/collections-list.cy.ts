// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { hubAPI } from '../../support/formatApiPathForHub';
import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
import { randomE2Ename } from '../../support/utils';
import { Collections } from './constants';

describe('GalaxyKit Installation Check for Collections List', () => {
  before(function () {
    cy.isGalaxyKitInstalled().then((isInstalled) => {
      if (!isInstalled) {
        cy.log(`GalaxyKit is not installed, skipping the test suite`);
        this.skip();
      }
    });
  });

  describe('Collections List', () => {
    let namespace: HubNamespace;
    let collectionName: string;

    before(() => {
      cy.createHubNamespace().then((namespaceResult) => {
        namespace = namespaceResult;
      });
    });

    after(() => {
      cy.deleteHubNamespace({ ...namespace, failOnStatusCode: false });
    });

    beforeEach(() => {
      collectionName = randomE2Ename();
      cy.navigateTo('hub', Collections.url);
      cy.verifyPageTitle(Collections.title);
    });

    it('can sign a collection', () => {
      cy.uploadCollection(collectionName, namespace.name, '1.0.0').then(() => {
        cy.waitForAllTasks();
        // Sign collection
        cy.getBy('[data-cy="list-view"]').click();
        cy.filterTableBySingleText(collectionName);
        cy.getBy('[data-cy="data-list-action"]').within(() => {
          cy.clickKebabAction('actions-dropdown', 'sign-collection');
        });
        cy.get('#confirm').click();
        cy.intercept('POST', hubAPI`/_ui/v1/collection_signing/`).as('signed');
        cy.clickButton(/^Sign collections$/);
        cy.wait('@signed'); // The response is a 202 that kicks off a task for signing the collection
        cy.waitForAllTasks();
        cy.get('[data-label="Status"]').should('contain', 'Success');
        cy.clickButton(/^Close$/);
        cy.getModal().should('not.exist');
        cy.reload();
        // Verify collection has been signed
        cy.get('[data-cy="label-signed"]').contains(Collections.signedStatus);
        cy.deleteCollectionsInNamespace(namespace.name);
      });
    });

    it('can sign and approve a collection version', () => {
      cy.uploadCollection(collectionName, namespace.name, '3.0.0').then(() => {
        cy.navigateTo('hub', Collections.url);
        cy.getBy('[data-cy="list-view"]').click();
        cy.filterTableBySingleText(collectionName);
        cy.getBy('[data-cy="data-list-action"]').within(() => {
          cy.clickKebabAction('actions-dropdown', 'sign-collection');
        });
        cy.get('#confirm').click();
        cy.intercept('POST', hubAPI`/_ui/v1/collection_signing/`).as('signed');
        cy.clickButton(/^Sign collections$/);
        cy.wait('@signed'); // The response is a 202 that kicks off a task for signing the collection
        cy.waitForAllTasks();
        cy.get('[data-label="Status"]').should('contain', 'Success');
        cy.clickButton(/^Close$/);
        cy.contains('Signed state').should('be.visible');
        cy.contains('a collection with some deps on other collections').should('be.visible');
        cy.contains('3.0.0').should('be.visible');
        cy.get('a[href*="/content/collections/validated/"]').click();
        cy.url().should('contain', '/details');
        cy.getBy('[data-cy="label-signed"]').contains(Collections.signedStatus);
        cy.clickKebabAction('actions-dropdown', 'delete-entire-collection-from-system');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete collections/);
      });
    });

    it('can upload and delete collection from system', () => {
      cy.galaxykit('collection upload --skip-upload', namespace.name, collectionName).then(
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
          actionClick(collectionName, 'delete-entire-collection-from-system');
          cy.get('#confirm').click();
          cy.clickButton(/^Delete collections/);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.getModal().should('not.exist');
          // Verify collection has been deleted from system
          cy.getByDataCy('table-view').click();
          cy.filterTableBySingleText(collectionName, true);
          cy.contains('No results found');
        }
      );
    });

    it('can upload and then delete a new version to an existing collection', () => {
      cy.uploadCollection(collectionName, namespace.name, '1.0.0');
      cy.galaxykit('collection upload --skip-upload', namespace.name, collectionName, '1.2.3').then(
        (result: { filename: string }) => {
          cy.getByDataCy('table-view').click();
          cy.filterTableBySingleText(collectionName, true);
          cy.clickTableRow(collectionName, false);
          // Details Page
          cy.get(`[data-cy="${collectionName}"]`).should('contain', `${collectionName}`);
          // Upload new version
          cy.getByDataCy('upload-new-version').click();
          cy.get('#file-browse-button').click();
          cy.get('input[id="file-filename"]').selectFile(result.filename, {
            action: 'drag-drop',
          });
          // Upload page
          cy.get('#radio-non-pipeline').click();
          cy.filterTableBySingleText('validated', true);
          cy.getTableRowByText('validated', false).within(() => {
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
          cy.get('[data-ouia-component-id="Permanently delete collections versions"]').within(
            () => {
              cy.get('[data-ouia-component-id="confirm"]').click();
              cy.get('[data-ouia-component-id="submit"]').click();
            }
          );
        }
      );
    });

    it('can copy a version to repository and then delete it from repository', () => {
      cy.uploadCollection(collectionName, namespace.name, '1.0.0');
      cy.navigateTo('hub', Collections.url);
      cy.filterTableBySingleText(collectionName);
      cy.get('[data-cy="data-list-name"]').should('have.text', collectionName);
      cy.get('[data-cy="data-list-action"]').within(() => {
        cy.get('[data-cy="actions-dropdown"]').first().click();
      });
      cy.get('[data-cy="copy-version-to-repositories"] button').click();
      cy.collectionCopyVersionToRepositories(collectionName);
      cy.navigateTo('hub', Collections.url);
      cy.getByDataCy('table-view').click();
      cy.filterTableBySingleText(collectionName);
      cy.contains('tr', 'community').within(() => {
        cy.getByDataCy('actions-dropdown').click();
      });
      cy.contains('button', 'Delete entire collection from repository').click();
      cy.get('#confirm').click();
      cy.clickButton(/^Delete collections/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.contains('tr', 'community').should('not.exist');
    });
  });

  function actionClick(item: string, action: string) {
    cy.filterTableBySingleText(item);
    cy.get('[aria-label="Simple table"] [data-cy="actions-dropdown"]').click();
    cy.get(`[data-cy="${action}"] button`).click();
  }
});
