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

  it('user can upload and delete collection', () => {
    const namespace = `upload_namespace_${randomString(3, undefined, { isLowercase: true })}`;
    cy.createNamespace(namespace);
    const collection = randomString(5, undefined, { isLowercase: true }).replace(/\d/g, '');
    cy.galaxykit(`collection upload ${namespace} ${collection} --skip-upload`).then((result) => {
      cy.navigateTo('hub', Collections.url);
      cy.verifyPageTitle(Collections.title);
      const filePath = result.filename as string;
      cy.uploadHubCollectionFile(filePath);
      cy.get('input[id="radio-non-pipeline"]').click();
      cy.getTableRowBySingleText('community').within(() => {
        cy.get('td[data-cy=checkbox-column-cell]').click();
      });
      cy.intercept(
        'POST',
        `/api/galaxy/v3/plugin/ansible/content/community/collections/artifacts/`
      ).as('postedCollection');
      cy.get('[data-cy="Submit"]').click();
      cy.url().should('include', 'approvals');
      cy.reload();
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
      cy.clickButton(/^Clear all filters$/);
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

  it.skip('user can delete a collection using the list toolbar', () => {});

  it.skip('user can delete selected entire collections from repository using the list toolbar', () => {});

  it.skip('user can deprecate selected collections using the list toolbar', () => {});
});

describe('Collections List- Line Item Kebab Menu', () => {
  let thisCollectionName: string;
  let namespace: string;
  let repository: string;

  beforeEach(() => {
    thisCollectionName = 'hub_e2e_' + randomString(5).toLowerCase();
    namespace = 'hub_e2e_col_namespace' + randomString(5).toLowerCase();
    cy.hubLogin();
    cy.createNamespace(namespace);
    cy.uploadCollection(thisCollectionName, namespace);
    cy.navigateTo('hub', Collections.url);
  });

  afterEach(() => {
    if (Cypress.currentTest.title === 'user can deprecate a collection') {
      cy.undeprecateCollection(thisCollectionName, namespace, repository);
      cy.galaxykit('task wait all');
    }
    cy.deleteCollection(thisCollectionName, namespace, repository);
    cy.galaxykit('task wait all');
    cy.deleteNamespace(namespace);
  });

  it.skip('user can upload a new version to an existing collection', () => {});

  it.skip('user can delete entire collection from system', () => {});

  it.skip('user can delete entire collection from repository', () => {});

  it('user can deprecate a collection', () => {
    cy.approveCollection(thisCollectionName, namespace, '1.0.0');
    cy.visit(`/collections?page=1&perPage=50&sort=name&keywords=${thisCollectionName}`);
    cy.get(`a[href*="/collections/published/${namespace}/${thisCollectionName}"]`).should(
      'be.visible'
    );
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
        hubAPI`/v3/plugin/ansible/content/published/collections/index/${namespace}/${thisCollectionName}/`
      ).as('deprecated');
      cy.clickButton('Deprecate collections');
      cy.wait('@deprecated').then((deprecated) => {
        expect(deprecated.response?.statusCode).to.eql(202);
      });
      cy.clickButton('Close');
    });
    cy.clickButton('Clear all filters');
    cy.visit(`/collections?page=1&perPage=50&sort=name&keywords=${thisCollectionName}`);
    cy.get('[data-cy="table-view"]').click();
    cy.contains('h2', 'No results found').should('be.visible');
    repository = 'published';
  });

  it.skip('user can copy a version to repository', () => {
    //skipping this test because the Copy to Repository option is disabled for admin user
    cy.approveCollection(thisCollectionName, namespace, '1.0.0');
    cy.collectionCopyVersionToRepositories(thisCollectionName);
    repository = 'community';
  });
});

describe.skip('Collections Details View', () => {
  before(() => {
    cy.hubLogin();
  });

  it.skip('user can upload a new version to an existing collection', () => {});

  it.skip('user can delete entire collection from system', () => {});

  it.skip('user can delete entire collection from repository', () => {});

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
