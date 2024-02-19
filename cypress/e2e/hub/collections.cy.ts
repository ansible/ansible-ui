// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { randomString } from '../../../framework/utils/random-string';
import { hubAPI } from '../../support/formatApiPathForHub';
import { Collections } from './constants';

describe('Collections- List View', () => {
  //**Important to know:
  //**In order to upload a collection, a namespace must first exist containing the first word of the collection file name
  //**The only way to get rid of a collection's artifact is to choose the following option:
  //**Delete entire collection from repository
  //**If the artifact isn't deleted when the collection is deleted, and a user tries to create
  //**a new collection by uploading the same file again, Hub will not allow it.

  before(() => {
    cy.hubLogin();
  });

  it('can sign a collection', () => {
    const namespace = `sign_namespace_${randomString(3, undefined, { isLowercase: true })}`;
    cy.createNamespace(namespace);
    const collection = randomString(5, undefined, { isLowercase: true }).replace(/\d/g, '');
    cy.uploadCollection(collection, namespace).then((result) => {
      cy.approveCollection(collection, namespace, result.version as string);
      cy.navigateTo('hub', Collections.url);
      cy.get('[data-cy="table-view"]').click();
      cy.filterTableBySingleText(collection);
      cy.get('[data-cy="actions-column-cell"]').click();
      cy.get('[data-cy="sign-collection"]').click();
      cy.get('#confirm').click();
      cy.clickButton(/^Sign collections$/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.get('[data-cy="label-signed"]').contains(Collections.signedStatus);
      cy.get('[data-cy="actions-column-cell"]').click();
      cy.get('[data-cy="delete-entire-collection-from-system"]').click({ force: true });
      cy.get('#confirm').click();
      cy.clickButton(/^Delete collections/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
      cy.deleteNamespace(namespace);
    });
  });

  it('can upload and delete collection', () => {
    const namespace = 'hub_e2e_namespace_' + randomString(3, undefined, { isLowercase: true });
    cy.createNamespace(namespace);
    const collection =
      'hub_e2e_collection_' + randomString(5, undefined, { isLowercase: true }).replace(/\d/g, '');
    cy.galaxykit(`collection upload ${namespace} ${collection} --skip-upload`).then((result) => {
      cy.navigateTo('hub', Collections.url);
      cy.verifyPageTitle(Collections.title);
      const filePath = result.filename as string;
      cy.uploadHubCollectionFile(filePath);
      cy.get('input[id="radio-non-pipeline"]').click();
      cy.getTableRowBySingleText('validated').within(() => {
        cy.get('td[data-cy=checkbox-column-cell]').click();
      });
      cy.get('[data-cy="Submit"]').click();
      cy.galaxykit('task wait all');

      cy.navigateTo('hub', Collections.url);
      cy.url().should('include', 'collections');
      cy.verifyPageTitle(Collections.title);
      cy.get('[data-cy="table-view"]').click();
      cy.filterTableBySingleText(collection);
      cy.get('[data-cy="actions-column-cell"]').click();
      cy.get('[data-cy="delete-entire-collection-from-system"]').click({ force: true });
      cy.get('#confirm').click();
      cy.clickButton(/^Delete collections/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.galaxykit('task wait all');
      cy.filterTableBySingleText(collection);
      cy.contains('No results found');
      cy.deleteNamespace(namespace);
    });
  });

  it('should render the collections page', () => {
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
  });

  it('should call galaxykit without error', () => {
    cy.galaxykit('collection -h');
  });

  it.skip('can deprecate selected collections using the list toolbar', () => {});
});

describe('Collections List- Line Item Kebab Menu', () => {
  let collection: string;
  let namespace: string;
  let repository: string;
  let version: string;

  beforeEach(() => {
    thisCollectionName = 'hub_e2e_' + randomString(5).toLowerCase();
    namespace = `upload_namespace_${randomString(4, undefined, { isLowercase: true })}`;
    version = '1.2.3';
    cy.hubLogin();
    cy.createNamespace(namespace);
    cy.galaxykit('task wait all');
    cy.uploadCollection(collection, namespace);
    cy.galaxykit('task wait all');
    cy.navigateTo('hub', Collections.url);
  });

  afterEach(() => {
    cy.deleteNamespace(namespace);
    cy.galaxykit('task wait all');
  });

  it('can upload and then delete a new version to an existing collection', () => {
    cy.galaxykit(
      `collection upload ${namespace} ${thisCollectionName} ${version} --skip-upload`
    ).then((result) => {
      cy.navigateTo('hub', Collections.url); //navigate to the collections page and find the collection created in the before hook
      cy.verifyPageTitle(Collections.title);
      const filePath = result.filename as string;
      cy.intercept(
        'GET',
        hubAPI`/v3/plugin/ansible/search/collection-versions/?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&keywords=${thisCollectionName}&order_by=name&offset=0&limit=10`
      ).as('searchA');
      cy.get('[data-cy="text-input"]').find('input').type(thisCollectionName);
      cy.wait('@searchA');
      cy.contains('h2[data-cy="data-list-name"]', `${thisCollectionName}`).click();
      cy.get(`[data-cy="${thisCollectionName}"]`).should('contain', `${thisCollectionName}`);
      cy.get('[data-ouia-component-id="upload-new-version"]').click(); //upload a new version of the collection
      cy.get('#file-upload-file-browse-button').click();
      cy.get('input[id="file-upload-file-filename"]').selectFile(filePath, {
        action: 'drag-drop',
      });
      cy.get('[data-cy="Submit"]').click();
      cy.url().should('include', 'approvals');
      cy.intercept(
        'GET',
        hubAPI`/v3/plugin/ansible/search/collection-versions/?repository_label=pipeline=staging&name=${thisCollectionName}&order_by=namespace&offset=0&limit=10`
      ).as('searchB');
      cy.get('[data-cy="text-input"]').find('input').type(thisCollectionName);
      cy.wait('@searchB');
      cy.get('[data-ouia-component-id="sign-and-approve"]').click(); //approve the new version of the collection
      cy.get('[data-ouia-component-id="Approve and sign collections"]').within(() => {
        cy.get('[data-ouia-component-id="confirm"]').click();
        cy.intercept(
          'GET',
          hubAPI`/pulp/api/v3/repositories/ansible/ansible/?pulp_label_select=pipeline=approved`
        ).as('moved');
        cy.get('[data-ouia-component-id="submit"]').click();
        cy.wait('@moved'); //wait for the approval request to go through so the 'Close' button can be clicked on
        cy.clickButton(/^Close$/);
      });
      cy.navigateTo('hub', Collections.url);
      cy.verifyPageTitle(Collections.title);
      cy.get('[data-cy="text-input"]').find('input').type(thisCollectionName); //navigate to the collections list and locate the collection
      cy.wait('@searchA');
      cy.contains('h2[data-cy="data-list-name"]', `${thisCollectionName}`).click();
      cy.get(`[data-cy="${thisCollectionName}"]`).should('contain', `${thisCollectionName}`); //assert that we are looking at the collection we expect
      cy.get('[data-cy="version"]').should('contain', '1.2.3'); //assert that the version has changed
      cy.get('[data-cy="actions-dropdown"]')
        .click()
        .then(() => {
          cy.get('#delete-version-from-system').click();
        });
      cy.intercept(
        'DELETE',
        hubAPI`/v3/plugin/ansible/content/published/collections/index/${namespace}/${thisCollectionName}/versions/1.2.3`
      ).as('delete');
      cy.intercept('GET', hubAPI`/v3/plugin/ansible/search/collection-versions/**`).as(
        'removeCollection'
      );
      cy.get('[data-ouia-component-id="Permanently delete collections versions"]').within(() => {
        cy.get('[data-ouia-component-id="confirm"]').click();
        cy.get('[data-ouia-component-id="submit"]').click();
        cy.wait('@delete');
        cy.clickButton(/^Close$/);
      });
      cy.wait('@removeCollection');
      cy.url().should('contain', '/collections/');
      cy.reload();
    });
  });

  it.skip('can delete entire collection from system', () => {
    cy.approveCollection(collection, namespace, '1.0.0');
    cy.galaxykit('task wait all');
    cy.get('[data-cy="table-view"]').click();
    cy.clickTableRowKebabAction(collection, 'delete-entire-collection-from-system', false);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete collections/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.galaxykit('task wait all');
  });

  it.skip('can delete entire collection from repository', () => {
    cy.approveCollection(collection, namespace, '1.0.0');
    cy.galaxykit('task wait all');
    cy.get('[data-cy="table-view"]').click();
    cy.clickTableRowKebabAction(collection, 'delete-entire-collection-from-repository', false);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete collections/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.galaxykit('task wait all');
  });

  it('can deprecate a collection', () => {
    cy.approveCollection(collection, namespace, '1.0.0');
    cy.visit(`/collections?page=1&perPage=50&sort=name&keywords=${collection}`);
    cy.get(`a[href*="/collections/published/${namespace}/${collection}"]`).should('be.visible');
    cy.get('[data-cy="data-list-action"]').within(() => {
      cy.get('[data-cy="actions-dropdown"]')
        .click()
        .then(() => {
          cy.get('#deprecate-collection').click();
        });
    });
    cy.get('[data-ouia-component-id="Permanently deprecate collections"]').within(() => {
      cy.get('input').click();
      cy.intercept(
        'PATCH',
        hubAPI`/v3/plugin/ansible/content/published/collections/index/${namespace}/${collection}/`
      ).as('deprecated');
      cy.clickButton('Deprecate collections');
      cy.wait('@deprecated').then((deprecated) => {
        expect(deprecated.response?.statusCode).to.eql(202);
      });
      cy.clickButton('Close');
    });
    cy.clickButton('Clear all filters');
    cy.visit(`/collections?page=1&perPage=50&sort=name&keywords=${collection}`);
    cy.get('[data-cy="table-view"]').click();
    cy.contains('h2', 'No results found').should('be.visible');
    repository = 'published';

    cy.undeprecateCollection(collection, namespace, repository);
  });

  it.skip('can copy a version to repository', () => {
    //skipping this test because the Copy to Repository option is disabled for admin user
    cy.approveCollection(collection, namespace, '1.0.0');
    cy.collectionCopyVersionToRepositories(collection);
    repository = 'community';

    cy.deleteCollection(collection, namespace, repository);
  });
});

describe('Collections Details View', () => {
  let collection: string;
  let namespace: string;

  beforeEach(() => {
    collection = 'hub_e2e_' + randomString(5).toLowerCase();
    namespace = 'hub_e2e_namespace_' + randomString(5).toLowerCase();
    cy.hubLogin();
    cy.createNamespace(namespace);
    cy.galaxykit('task wait all');
    cy.uploadCollection(collection, namespace);
    cy.galaxykit('task wait all');
    cy.navigateTo('hub', Collections.url);
  });

  afterEach(() => {
    cy.galaxykit('task wait all');
    cy.deleteNamespace(namespace);
    cy.galaxykit('task wait all');
  });

  it.skip('can upload a new version to an existing collection', () => {});

  it.skip('can delete entire collection from system', () => {
    cy.approveCollection(collection, namespace, '1.0.0');
    cy.galaxykit('task wait all');
    cy.get('[data-cy="table-view"]').click();
    cy.clickLink(collection);
    cy.wait(400);
    cy.selectDetailsPageKebabAction('delete-entire-collection-from-system');
  });

  it.skip('can delete entire collection from repository', () => {
    cy.approveCollection(collection, namespace, '1.0.0');
    cy.galaxykit('task wait all');
    cy.get('[data-cy="table-view"]').click();
    cy.clickLink(collection);
    cy.wait(400);
    cy.selectDetailsPageKebabAction('delete-entire-collection-from-repository');
  });

  it.skip('can deprecate a collection', () => {});

  it.skip('can delete version from system', () => {});

  it.skip('can delete version from repository', () => {});

  it.skip('can copy a version to repository', () => {});

  it.skip('can access the Install tab and download a tarball', () => {});
});

describe.skip('Collection Approvals List', () => {
  before(() => {
    cy.hubLogin();
  });

  it.skip('can approve a collection', () => {});

  it.skip('can reject a collection', () => {});

  it.skip('can upload a signature to a collection', () => {});
});
