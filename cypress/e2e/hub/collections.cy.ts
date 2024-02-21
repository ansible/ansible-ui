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

  it('user can sign a collection', () => {
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

  it('user can upload and delete collection', () => {
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

  it('it should render the collections page', () => {
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
  });

  it('should call galaxykit without error', () => {
    cy.galaxykit('collection -h');
  });

  it.skip('user can deprecate selected collections using the list toolbar', () => {});
});

describe('Collections List- Line Item Kebab Menu', () => {
  let collection: string;
  let namespace: string;
  let repository: string;

  beforeEach(() => {
    collection = 'hub_e2e_collection_' + randomString(5).toLowerCase();
    namespace = 'hub_e2e_namespace_' + randomString(5).toLowerCase();
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

  it.skip('user can upload a new version to an existing collection', () => {});

  it.skip('user can delete entire collection from system', () => {
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

  it.skip('user can delete entire collection from repository', () => {
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

  it('user can deprecate a collection', () => {
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

  it.skip('user can copy a version to repository', () => {
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

  it.skip('user can upload a new version to an existing collection', () => {});

  it.skip('user can delete entire collection from system', () => {
    cy.approveCollection(collection, namespace, '1.0.0');
    cy.galaxykit('task wait all');
    cy.get('[data-cy="table-view"]').click();
    cy.clickLink(collection);
    cy.wait(400);
    cy.selectDetailsPageKebabAction('delete-entire-collection-from-system');
  });

  it.skip('user can delete entire collection from repository', () => {
    cy.approveCollection(collection, namespace, '1.0.0');
    cy.galaxykit('task wait all');
    cy.get('[data-cy="table-view"]').click();
    cy.clickLink(collection);
    cy.wait(400);
    cy.selectDetailsPageKebabAction('delete-entire-collection-from-repository');
  });

  it.skip('user can deprecate a collection', () => {});

  it.skip('user can delete version from system', () => {});

  it.skip('user can delete version from repository', () => {});

  it.skip('user can copy a version to repository', () => {});

  it.skip('user can access the Install tab and download a tarball', () => {});
});

describe.skip('Collection Approvals List', () => {
  before(() => {
    cy.hubLogin();
  });

  it.skip('user can approve a collection', () => {});

  it.skip('user can reject a collection', () => {});

  it.skip('user can upload a signature to a collection', () => {});
});
