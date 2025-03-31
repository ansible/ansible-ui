// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { HubNamespace } from '@ansible/hub-ui/namespaces/HubNamespace';
import { hubAPI } from '../../support/formatApiPathForHub';
import { randomE2Ename } from '../../support/utils';
import { Collections } from './constants';
import { SAAS_URL, AZURE_URL, OCP_A_URL } from '../../support/constants';

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

    it('can sign a collection', function () {
      cy.checkBuildType().then((buildType) => {
        if (buildType === SAAS_URL || buildType === AZURE_URL || buildType === OCP_A_URL) {
          this.skip();
        } else {
          cy.uploadCollection(collectionName, namespace.name, '1.0.0').then(() => {
            cy.waitForAllTasks();
            cy.getBy('[data-cy="list-view"]').click();
            cy.filterTableBySingleText(collectionName);
            cy.getBy('[data-cy="data-list-action"]').within(() => {
              cy.getBy(`[data-cy="actions-dropdown"]`).click();
            });
            cy.getBy('[data-cy="sign-collection"]').click();
            cy.get('#confirm').click();
            cy.intercept('POST', hubAPI`/_ui/v1/collection_signing/`).as('signed');
            cy.clickButton(/^Sign collections$/);
            cy.wait('@signed');
            cy.waitForAllTasks();
            cy.reload();
            cy.getBy('[data-cy="list-view"]').click();
            cy.get('[data-cy="signed-status"]').should('contain', 'Signed');
            cy.getModal().should('not.exist');
            cy.reload();
            cy.get('[data-cy="signed-status"]').contains(Collections.signedStatus);
            cy.deleteCollectionsInNamespace(namespace.name);
          });
        }
      });
    });

    it('can sign and approve a collection version', function () {
      cy.checkBuildType().then((buildType) => {
        if (buildType === SAAS_URL || buildType === AZURE_URL || buildType === OCP_A_URL) {
          this.skip();
        } else {
          cy.uploadCollection(collectionName, namespace.name, '3.0.0').then(() => {
            cy.navigateTo('hub', Collections.url);
            cy.getBy('[data-cy="list-view"]').click();
            cy.filterTableBySingleText(collectionName);
            cy.getBy('[data-cy="data-list-action"]').within(() => {
              cy.getBy(`[data-cy="actions-dropdown"]`).click();
            });
            cy.getBy('[data-cy="sign-collection"]').click();
            cy.get('#confirm').click();
            cy.intercept('POST', hubAPI`/_ui/v1/collection_signing/`).as('signed');
            cy.clickButton(/^Sign collections$/);
            cy.wait('@signed');
            cy.waitForAllTasks();
            cy.get('[data-cy="signed-status"]').should('contain', 'Signed');
            cy.contains('Signed state').should('be.visible');
            cy.contains('a collection with some deps on other collections').should('be.visible');
            cy.contains('3.0.0').should('be.visible');
            cy.get('a[href*="/content/collections/validated/"]').click();
            cy.url().should('contain', '/details');
            cy.getBy('[data-cy="signed-status"]').contains(Collections.signedStatus);
            cy.getBy(`[data-cy="actions-dropdown"]`).click();
            cy.getBy('[data-cy="delete-entire-collection-from-system"]').click();
            cy.get('#confirm').click();
            cy.clickButton(/^Delete collections/);
          });
        }
      });
    });

    it('can upload and delete collection from system', () => {
      cy.galaxykit('collection upload --skip-upload', namespace.name, collectionName).then(
        (result) => {
          const filePath = result.filename as string;
          cy.uploadHubCollectionFile(filePath);
          cy.get('input[id="radio-non-pipeline"]').click();
          cy.getTableRowBySingleText('validated', true).within(() => {
            cy.get('td[data-cy=checkbox-column-cell]').click();
          });
          cy.get('[data-cy="Submit"]').click();
          cy.verifyPageTitle(Collections.title);
          cy.getByDataCy('table-view').click();
          actionClick(collectionName, 'delete-entire-collection-from-system');
          cy.get('#confirm').click();
          cy.clickButton(/^Delete collections/);
          cy.contains(/^Success$/);
          cy.getModal().should('not.exist');
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
          cy.get(`[data-cy="${collectionName}"]`).should('contain', `${collectionName}`);
          cy.getByDataCy('upload-new-version').click();
          cy.get('#file-browse-button').click();
          cy.get('input[id="file-filename"]').selectFile(result.filename, {
            action: 'drag-drop',
          });
          cy.get('#radio-non-pipeline').click();
          cy.filterTableBySingleText('validated', true);
          cy.getTableRowByText('validated', false).within(() => {
            cy.getByDataCy('checkbox-column-cell').click();
          });
          cy.get('[data-cy="Submit"]').click();
          cy.verifyPageTitle(Collections.title);
          cy.getByDataCy('table-view').click();
          cy.filterTableBySingleText(collectionName, true);
          cy.clickTableRow(collectionName, false);
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
      cy.checkBuildType().then((buildType) => {
        if (buildType !== OCP_A_URL) {
          cy.uploadCollection(collectionName, namespace.name, '1.0.0');
          cy.navigateTo('hub', Collections.url);
          cy.filterTableBySingleText(collectionName);
          cy.get('[data-cy="data-list-name"]').should('have.text', collectionName);
          cy.get('[data-cy="data-list-action"]').within(() => {
            cy.get('[data-cy="actions-dropdown"]').first().click();
          });
          cy.get('[data-cy="copy-version-to-repositories"] button').click();
          cy.collectionCopyVersionToRepositories(collectionName, 2);
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
          cy.contains('tr', 'community').should('not.exist');
        } else {
          cy.log('Test/tests should not run on this deployment.');
        }
      });
    });
  });

  function actionClick(item: string, action: string) {
    cy.filterTableBySingleText(item);
    cy.get('[aria-label="Simple table"] [data-cy="actions-dropdown"]').click();
    cy.get(`[data-cy="${action}"] button`).click();
  }
});
