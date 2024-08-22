// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
import { randomE2Ename } from '../../support/utils';
import { Collections } from './constants';

function visitCollection(collection: string, namespace: string) {
  cy.navigateTo('hub', Collections.url);
  cy.verifyPageTitle(Collections.title);
  cy.getByDataCy('table-view').click();
  cy.filterTableBySingleText(collection);
  cy.clickLink(collection);
  cy.verifyPageTitle(`${namespace}.${collection}`);
}

describe('Collections Details', () => {
  let namespace: HubNamespace;
  let collectionName: string;

  before(() => {
    cy.createHubNamespace().then((namespaceResult) => {
      namespace = namespaceResult;
    });
  });

  after(() => {
    cy.deleteCollectionsInNamespace(namespace.name);
    cy.deleteHubNamespace({ ...namespace, failOnStatusCode: false });
  });

  beforeEach(() => {
    collectionName = randomE2Ename();
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
  });

  it('can delete entire collection from system', () => {
    cy.uploadCollection(collectionName, namespace.name, '1.0.0');
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');
    cy.selectDetailsPageKebabAction('delete-entire-collection-from-system');
    // Verify collection has been deleted from system
    cy.verifyPageTitle(Collections.title);
    cy.getHubCollection(collectionName).then((deleted) => {
      //Assert that the query returns an empty array, indicating no API results exist
      expect(deleted.data).to.be.empty;
    });
    //Removed the lines attempting to assert that filtering the list for the collection returns an empty list
    //these lines fail if there are no Collections present
  });

  it('can delete entire collection from repository', () => {
    cy.uploadCollection(collectionName, namespace.name, '1.0.0', 'rh-certified');
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');
    cy.selectDetailsPageKebabAction('delete-entire-collection-from-repository');
    // Verify collection has been deleted from system
    cy.verifyPageTitle(Collections.title);
    cy.getHubCollection(collectionName).then((deleted) => {
      //Assert that the query returns an empty array, indicating no API results exist
      expect(deleted.data).to.be.empty;
    });
    //Removed the lines attempting to assert that filtering the list for the collection returns an empty list
    //these lines fail if there are no Collections present
  });

  it('user can delete version from system', () => {
    cy.uploadCollection(collectionName, namespace.name, '1.0.0');
    cy.uploadCollection(collectionName, namespace.name, '1.1.0');

    // Delete version from system
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');

    cy.get(`[data-cy="browse-collection-version"] button`).first().click();
    cy.get('.pf-v5-c-menu__item-text').contains('1.0.0').click();
    cy.url().should(
      'contain',
      `/collections/validated/${namespace.name}/${collectionName}/details?version=1.0.0`
    );
    cy.selectDetailsPageKebabAction('delete-version-from-system');
    cy.clickButton(/^Close$/);
    //Verify the version has been deleted
    cy.navigateTo('hub', Collections.url);
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');
    cy.get(`[data-cy="browse-collection-version"] button`).first().click();
    cy.get('.pf-v5-c-menu__item-text').should('have.length', '1').contains('1.1.0');
    cy.deleteHubCollectionByName(collectionName);
  });

  it('user can delete version from repository', () => {
    cy.uploadCollection(collectionName, namespace.name, '1.0.0');
    cy.uploadCollection(collectionName, namespace.name, '1.1.0');

    // Delete version from repository
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');
    cy.get(`[data-cy="browse-collection-version"] button`).first().click();
    cy.get('.pf-v5-c-menu__item-text').contains('1.0.0').click();
    cy.url().should(
      'contain',
      `/collections/validated/${namespace.name}/${collectionName}/details?version=1.0.0`
    );
    cy.selectDetailsPageKebabAction('delete-version-from-repository');
    cy.clickButton(/^Close$/);
    //Verify the version has been deleted
    cy.navigateTo('hub', Collections.url);
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.url().should(
      'contain',
      `/collections/validated/${namespace.name}/${collectionName}/details`
    );
    cy.get(`[data-cy="browse-collection-version"] button`).first().click();
    cy.get('.pf-v5-c-menu__item-text').should('have.length', '1').contains('1.1.0');
    cy.deleteHubCollectionByName(collectionName);
  });

  it('can copy a version to repository', () => {
    cy.uploadCollection(collectionName, namespace.name, '1.0.0').then(() => {
      cy.navigateTo('hub', Collections.url);
      cy.filterTableBySingleText(collectionName, true);
      cy.clickLink(collectionName);

      cy.clickKebabAction('actions-dropdown', 'copy-version-to-repositories');
      cy.collectionCopyVersionToRepositories(collectionName);

      cy.deleteHubCollectionByName(collectionName);
    });
  });

  it('can sign a collection', () => {
    cy.uploadCollection(collectionName, namespace.name, '1.0.0').then(() => {
      // Sign collection
      visitCollection(collectionName, namespace.name);
      cy.selectDetailsPageKebabAction('sign-collection');
      cy.clickButton(/^Close$/);
      cy.getModal().should('not.exist');
      // Verify collection has been signed
      cy.get('[data-cy="label-signed"]').contains(Collections.signedStatus);
      cy.deleteHubCollectionByName(collectionName);
    });
  });

  it('can sign a selected version of a collection', () => {
    cy.uploadCollection(collectionName, namespace.name).then(() => {
      cy.waitForAllTasks();
      cy.galaxykit('collection upload --skip-upload', namespace.name, collectionName, '1.2.3').then(
        (result: { filename: string }) => {
          //Visit the details screen of the newly uploaded collection
          visitCollection(collectionName, namespace.name);
          //Assert baseline version nuumber
          cy.getByDataCy('version').should('contain', '1.0.0');
          cy.get(`[data-cy="${collectionName}"]`).should('contain', `${collectionName}`);
          //Upload new version to the collection
          cy.clickPageAction('upload-new-version');
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
          //Navigate back to the details screen of the collection after upload
          cy.getByDataCy('table-view').click();
          cy.filterTableBySingleText(collectionName, true);
          cy.clickTableRow(collectionName, false);
          cy.verifyPageTitle(collectionName);
          cy.get(`[data-cy="browse-collection-version"] button`).first().click();

          cy.contains('[type="button"]', '1.0.0 updated').click();

          //Select the first version of the collection in order to sign it
          cy.getByDataCy('version').should('contain', '1.0.0');
          cy.getByDataCy('signed-state').should('contain', 'Unsigned');
          // FIXME: here, the version changes from 1.0.0 to 1.2.3 .. could be autoreload when no version is explicitly selected, or sign-version forgetting state?
          cy.selectDetailsPageKebabAction('sign-version');
          cy.getModal().then(() => {
            cy.clickButton(/^Close$/);
          });
          //Reload the page to reflect and assert the newly signed version
          cy.reload();
          cy.getByDataCy('version').should('contain', '1.0.0');
          cy.getByDataCy('signed-state').should('contain', 'Signed');
          //Display the other version of the collection to assert that it is not signed
          cy.get(`[data-cy="browse-collection-version"] button`).first().click();

          cy.contains('[type="button"]', '(latest)').click();

          cy.getByDataCy('version').should('contain', '1.2.3');
          cy.getByDataCy('signed-state').should('contain', 'Unsigned');
          //Delete the collection
          cy.deleteHubCollectionByName(collectionName);
        }
      );
    });
  });

  it('can deprecate/undeprecate a collection', () => {
    cy.uploadCollection(collectionName, namespace.name, '1.0.0').then(() => {
      // Deprecate collection
      visitCollection(collectionName, namespace.name);
      cy.selectDetailsPageKebabAction('deprecate-collection');
      cy.clickButton(/^Close$/);
      cy.getModal().should('not.exist');
      // Verify collection has been deprecated
      cy.contains('span', 'Deprecated');
      // Undeprecate collection
      cy.selectDetailsPageKebabAction('undeprecate-collection');
      cy.clickButton(/^Close$/);
      cy.getModal().should('not.exist');
      // Verify collection has been undeprecated
      cy.contains('span', 'Deprecated').should('not.exist');

      // deprecate collection again
      cy.selectDetailsPageKebabAction('deprecate-collection');
      cy.clickButton(/^Close$/);
      cy.getModal().should('not.exist');
      // Verify collection has been deprecated
      cy.contains('span', 'Deprecated');

      cy.contains('a', namespace.name).click();
      cy.contains(`[role="tab"]`, 'Collections').click();
      cy.filterTableBySingleText(collectionName, true);
      cy.get(`[aria-label="Simple table"]`).within(() => {
        cy.contains('td', collectionName).click();
        cy.contains('span', 'Deprecated');
      });

      cy.getByDataCy('table-view').click();
      cy.get(`[aria-label="Simple table"]`).within(() => {
        cy.getByDataCy('actions-dropdown').click();
      });
      cy.contains('button', 'Undeprecate collection').click();

      // click confirm
      cy.getModal().within(() => {
        cy.get(`input[type="checkbox"]`).click();
      });
      cy.contains('button', 'Undeprecate collections').click();
      cy.clickButton(/^Close$/);
      cy.getModal().should('not.exist');

      cy.get(`[aria-label="Simple table"]`).within(() => {
        cy.contains('td', collectionName).click();
        cy.contains('span', 'Deprecated').should('not.exist');
      });
      cy.deleteHubCollectionByName(collectionName);
    });
  });
});
