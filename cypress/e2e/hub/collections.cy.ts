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
  });

  it('it should render the collections page', () => {
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
  });

  it('user can upload and then delete a new collection', () => {
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
      cy.intercept(
        'POST',
        `/api/galaxy//v3/plugin/ansible/content/community/collections/artifacts/`
      ).as('collection');
      cy.get('[data-cy="Submit"]').click();
      cy.wait('@collection').then((resp) => {
        expect(resp?.response?.statusCode).to.eql(202);
        expect(resp?.response?.statusMessage).to.eql('Accepted');
        expect(resp?.responseWaited).to.eql(true);
      });
      cy.intercept(
        'GET',
        '/api/galaxy//v3/plugin/ansible/search/collection-versions?is_deprecated=false&repository_label=!hide_from_search&is_highest=true&offset=0&limit=10'
      ).as('collections');
      cy.reload();
      cy.get('[data-cy="hub-collections"]').click();
      cy.verifyPageTitle(Collections.title);
      cy.get('[data-cy="app-description"]').should(
        'contain',
        'Collections are a packaged unit of Ansible content that includes roles, modules, plugins, and other components, making it easier to share and reuse automation functionality.'
      );
      cy.wait('@collections');
      cy.get('[data-cy="table-view"]').click();
      cy.clickTableRowKebabAction(thisCollectionName, 'delete-entire-collection-from-system');
      cy.get('[data-ouia-component-id="confirm"]').click();
      cy.get('[data-ouia-component-id="submit"]').click();
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it.skip('user can delete a collection using the list toolbar', () => {});

  it.skip('user can delete selected entire collections from repository using the list toolbar', () => {});

  it.skip('user can deprecate selected collections using the list toolbar', () => {});
});

describe('Collections List- Line Item Kebab Menu', () => {
  before(() => {
    cy.hubLogin();
  });

  it.skip('user can upload a new version to an existing collection', () => {});

  it.skip('user can delete entire collection from system', () => {});

  it.skip('user can delete entire collection from repository', () => {});

  it.skip('user can deprecate a collection', () => {});

  it.skip('user can copy a version to repository', () => {});
});

describe('Collections Details View', () => {
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

describe('Collection Approvals List', () => {
  before(() => {
    cy.hubLogin();
  });

  it.skip('user can approve a collection', () => {});

  it.skip('user can reject a collection', () => {});

  it.skip('user can upload a signature to a collection', () => {});
});
