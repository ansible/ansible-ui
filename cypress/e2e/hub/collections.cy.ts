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
    cy.getNamespace('ibm');
    cy.addAndApproveMultiCollections(1);
  });

  it('it should render the collections page', () => {
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
  });

  after(() => {
    cy.cleanupCollections('ibm', 'community');
  });

  it.skip('user can upload and then delete a new collection', () => {
    cy.getOrCreateCollection().then((thisCollection) => {
      const thisCollectionName = thisCollection?.split('-').slice(-2, -1).toString();
      cy.navigateTo('hub', Collections.url);
      cy.verifyPageTitle(Collections.title);
      cy.get('[data-cy="upload-collection"]').click();
      cy.uploadHubCollectionFile(`collection-files/` + thisCollection, thisCollection);
      cy.get('input[id="radio-non-pipeline"]').click();
      cy.get('[data-cy="row-0"]').within(() => {
        cy.get('input').click();
      });
      cy.intercept('POST', hubAPI`/v3/plugin/ansible/content/community/collections/artifacts/`).as(
        'collection'
      );
      cy.get('[data-cy="Submit"]').click();
      cy.wait('@collection').then((resp) => {
        expect(resp?.response?.statusCode).to.eql(202);
        expect(resp?.response?.statusMessage).to.eql('Accepted');
        expect(resp?.responseWaited).to.eql(true);
      });
      cy.reload();
      cy.get('[data-cy="hub-collections"]').click();
      cy.intercept(
        'GET',
        hubAPI`/v3/plugin/ansible/search/collection-versions/?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&offset=0&limit=100`
      ).as('collections');
      cy.verifyPageTitle(Collections.title);
      cy.get('[data-cy="app-description"]').should(
        'contain',
        'Collections are a packaged unit of Ansible content that includes roles, modules, plugins, and other components, making it easier to share and reuse automation functionality.'
      );
      // cy.wait('@collections');
      cy.get('[data-cy="table-view"]').click();
      cy.clickTableRowKebabAction(thisCollectionName, 'delete-entire-collection-from-system');
      cy.get('[data-ouia-component-id="confirm"]').click();
      cy.intercept(
        'DELETE',
        hubAPI`/v3/plugin/ansible/content/community/collections/index/ibm/${thisCollectionName}/`
      ).as('deleted');
      cy.get('[data-ouia-component-id="submit"]').click();
      cy.wait('@deleted').then((deleted) => {
        expect(deleted?.response?.statusCode).to.eq(202);
      });
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
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
    namespace = 'ibm';
    cy.hubLogin();
    cy.getNamespace(namespace);
    cy.uploadCollection(thisCollectionName, namespace);
    cy.navigateTo('hub', Collections.url);
  });

  afterEach(() => {
    cy.deleteCollection(thisCollectionName, namespace, repository);
  });

  it.skip('user can upload a new version to an existing collection', () => {});

  it.skip('user can delete entire collection from system', () => {});

  it.skip('user can delete entire collection from repository', () => {});

  it('user can deprecate a collection', () => {
    cy.approveCollection(thisCollectionName, namespace, '1.0.0');
    cy.visit(`/collections?page=1&perPage=50&sort=name&keywords=${thisCollectionName}`);
    cy.get(`a[href*="/collections/published/ibm/${thisCollectionName}"]`).should('be.visible');
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
        hubAPI`/v3/plugin/ansible/content/published/collections/index/ibm/${thisCollectionName}/`
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
