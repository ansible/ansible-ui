// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { randomString } from '../../../framework/utils/random-string';
import { Repository } from '../../../frontend/hub/administration/repositories/Repository';
import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
import { hubAPI } from '../../support/formatApiPathForHub';
import { randomE2Ename } from '../../support/utils';
import { Collections } from './constants';

describe('Collections - List View', () => {
  before(() => {
    cy.hubLogin();
  });

  it('should render the collections page', () => {
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
  });

  it('should call galaxykit without error', () => {
    cy.galaxykit('collection -h');
  });

  it('can sign a collection', () => {
    cy.createHubNamespace().then((namespace) => {
      const collectionName = randomE2Ename();
      cy.uploadCollection(collectionName, namespace.name).then((result) => {
        cy.approveCollection(collectionName, namespace.name, result.version as string);

        cy.navigateTo('hub', Collections.url);
        cy.verifyPageTitle(Collections.title);
        cy.get('[data-cy="table-view"]').click();

        // Sign collection
        cy.filterTableBySingleText(collectionName, true);
        cy.clickTableRowKebabAction(collectionName, 'sign-collection', false);
        cy.get('#confirm').click();
        cy.clickButton(/^Sign collections$/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
        cy.getModal().should('not.exist');

        // Verify collection has been signed
        cy.get('[data-cy="label-signed"]').contains(Collections.signedStatus);

        cy.deleteHubCollectionByName(collectionName);
      });
      cy.deleteHubNamespace(namespace);
    });
  });

  it('can upload and delete collection', () => {
    cy.createHubNamespace().then((namespace) => {
      const collectionName = randomE2Ename();
      cy.galaxykit(`collection upload ${namespace.name} ${collectionName} --skip-upload`).then(
        (result) => {
          cy.navigateTo('hub', Collections.url);
          cy.verifyPageTitle(Collections.title);
          cy.get('[data-cy="table-view"]').click();

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
          cy.filterTableBySingleText(collectionName, true);
          cy.clickTableRowKebabAction(
            collectionName,
            'delete-entire-collection-from-system',
            false
          );
          cy.get('#confirm').click();
          cy.clickButton(/^Delete collections/);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.getModal().should('not.exist');

          // Verify collection has been deleted from system
          cy.filterTableBySingleText(collectionName, true);
          cy.contains('No results found');
        }
      );
      cy.deleteHubNamespace(namespace);
    });
  });

  // it.skip('can deprecate selected collections using the list toolbar', () => {});
});

describe('Collections List- Line Item Kebab Menu', () => {
  let namespace: HubNamespace;
  let repository: Repository;

  before(() => {
    cy.createHubNamespace().then((namespaceResult) => {
      namespace = namespaceResult;
    });
    cy.createHubRepository().then((repositoryResult) => {
      repository = repositoryResult;
      cy.galaxykit(`distribution create ${repository.name}`);
    });
  });

  after(() => {
    cy.deleteCollectionsInNamespace(namespace.name);
    // TODO cy.deletehubDistribution(repository.name);
    cy.deleteHubRepository(repository);
    cy.deleteHubNamespace({ ...namespace, failOnStatusCode: false });
  });

  beforeEach(() => {
    cy.hubLogin();
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
    cy.get('[data-cy="table-view"]').click();
  });

  it('can upload and then delete a new version to an existing collection', () => {
    const collectionName = randomE2Ename();
    cy.uploadCollection(collectionName, namespace.name);
    cy.galaxykit(
      `collection move ${namespace.name} ${collectionName} 1.0.0 staging ${repository.name}`
    );
    cy.galaxykit(`collection upload ${namespace.name} ${collectionName} 1.2.3 --skip-upload`).then(
      (result: { filename: string }) => {
        cy.filterTableBySingleText(collectionName, true);
        cy.clickTableRow(collectionName, false);

        // Details Page
        cy.get(`[data-cy="${collectionName}"]`).should('contain', `${collectionName}`);

        // Upload new version
        cy.clickPageAction('upload-new-version');
        cy.get('#file-upload-file-browse-button').click();
        cy.get('input[id="file-upload-file-filename"]').selectFile(result.filename, {
          action: 'drag-drop',
        });

        // Upload page
        cy.verifyPageTitle('Upload Collection');
        cy.get('#radio-non-pipeline').click();
        cy.filterTableBySingleText(repository.name, true);
        cy.getTableRowByText(repository.name, false).within(() => {
          cy.getByDataCy('checkbox-column-cell').click();
        });
        cy.get('[data-cy="Submit"]').click();

        // Collections Page
        cy.verifyPageTitle(Collections.title);
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

  it('can delete entire collection from system', () => {
    const collectionName = randomE2Ename();
    cy.uploadCollection(collectionName, namespace.name);
    cy.galaxykit(
      `collection move ${namespace.name} ${collectionName} 1.0.0 staging ${repository.name}`
    );

    // Delete collection from system
    cy.filterTableBySingleText(collectionName, true);
    cy.clickTableRowKebabAction(collectionName, 'delete-entire-collection-from-system', false);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete collections/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);

    // Verify collection has been deleted from system
    cy.navigateTo('hub', Collections.url);
    cy.filterTableBySingleText(collectionName, true);
    cy.contains('No results found').should('be.visible');
  });

  it('can delete entire collection from repository', () => {
    const collectionName = randomE2Ename();
    cy.uploadCollection(collectionName, namespace.name);
    cy.galaxykit(
      `collection move ${namespace.name} ${collectionName} 1.0.0 staging ${repository.name}`
    );

    // Delete collection from repository
    cy.filterTableBySingleText(collectionName, true);
    cy.clickTableRowKebabAction(collectionName, 'delete-entire-collection-from-repository', false);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete collections/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);

    //Verify collection has been deleted from repository
    cy.filterTableBySingleText(collectionName, true);
    cy.contains('No results found').should('be.visible');
  });
});

describe('Collections List - Deprecate and Copy', () => {
  let thisCollectionName: string;
  let namespace: string;
  let repository: string;

  beforeEach(() => {
    thisCollectionName = 'hub_e2e_' + randomString(5).toLowerCase();
    namespace = `upload_namespace_${randomString(4, undefined, { isLowercase: true })}`;
    repository = 'hub_e2e_appr_repository' + randomString(5);

    cy.hubLogin();

    cy.galaxykit(`repository create ${repository}`);
    cy.galaxykit('task wait all');

    cy.galaxykit(`distribution create ${repository}`);
    cy.galaxykit('task wait all');

    cy.createNamespace(namespace);
    cy.uploadCollection(thisCollectionName, namespace);
    cy.galaxykit('task wait all');

    cy.galaxykit(`collection move ${namespace} ${thisCollectionName} 1.0.0 staging ${repository}`);
  });

  after(() => {
    cy.undeprecateCollection(thisCollectionName, namespace, repository);
    cy.galaxykit('task wait all');
  });

  it('can deprecate a collection', () => {
    cy.visit(`/collections?page=1&perPage=50&sort=name&keywords=${thisCollectionName}`);
    cy.get(`a[href*="/collections/${repository}/${namespace}/${thisCollectionName}"]`).should(
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
        hubAPI`/v3/plugin/ansible/content/${repository}/collections/index/${namespace}/${thisCollectionName}/`
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
    cy.undeprecateCollection(thisCollectionName, namespace, repository);
  });

  it.skip('can copy a version to repository', () => {
    //skipping this test because the Copy to Repository option is disabled for admin user
    cy.collectionCopyVersionToRepositories(thisCollectionName);
    repository = 'community';

    cy.deleteCollection(thisCollectionName, namespace, repository);
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
    cy.uploadCollection(collection, namespace, '1.0.0');
    cy.galaxykit('task wait all');
    cy.navigateTo('hub', Collections.url);
  });

  afterEach(() => {
    cy.galaxykit('task wait all');
    cy.deleteNamespace(namespace);
    cy.galaxykit('task wait all');
  });

  it.skip('can upload a new version to an existing collection', () => {});

  it('can delete entire collection from system', () => {
    cy.approveCollection(collection, namespace, '1.0.0');
    cy.galaxykit('task wait all');
    cy.get('[data-cy="table-view"]').click();
    cy.filterTableBySingleText(collection);
    cy.clickLink(collection);
    cy.galaxykit('task wait all'); //this is necessary, otherwise page continues reloading
    cy.selectDetailsPageKebabAction('delete-entire-collection-from-system');

    //Verify collection has been deleted from system
    cy.navigateTo('hub', Collections.url);
    cy.filterTableBySingleText(collection);
    cy.contains('No results found');
  });

  it('can delete entire collection from repository', () => {
    cy.approveCollection(collection, namespace, '1.0.0');
    cy.galaxykit('task wait all');
    cy.get('[data-cy="table-view"]').click();
    cy.filterTableBySingleText(collection);
    cy.clickLink(collection);
    cy.galaxykit('task wait all'); //this is necessary, otherwise page continues reloading
    cy.selectDetailsPageKebabAction('delete-entire-collection-from-repository');

    //Verify collection has been deleted from repository
    cy.navigateTo('hub', Collections.url);
    cy.filterTableBySingleText(collection);
    cy.contains('No results found');
  });

  // it.skip('can deprecate a collection', () => {});

  it('user can delete version from system', () => {
    cy.uploadCollection(collection, namespace, '1.1.0');
    cy.galaxykit('task wait all');
    cy.approveCollection(collection, namespace, '1.0.0');
    cy.galaxykit('task wait all');
    cy.approveCollection(collection, namespace, '1.1.0');
    cy.galaxykit('task wait all');
    cy.get('[data-cy="table-view"]').click();
    cy.filterTableBySingleText(collection);
    cy.clickLink(collection);
    cy.url().should('contain', `/collections/published/${namespace}/${collection}/details`);
    cy.get('.pf-v5-c-menu-toggle').click();
    cy.get('.pf-v5-c-menu__item-text').contains('1.0.0').click();
    cy.url().should(
      'contain',
      `/collections/published/${namespace}/${collection}/details?version=1.0.0`
    );
    cy.selectDetailsPageKebabAction('delete-version-from-system');
    cy.clickButton(/^Close$/);

    //Verify the version has been deleted
    cy.galaxykit('task wait all');
    cy.navigateTo('hub', Collections.url);
    cy.filterTableBySingleText(collection);
    cy.clickLink(collection);
    cy.url().should('contain', `/collections/published/${namespace}/${collection}/details`);
    cy.get('.pf-v5-c-menu-toggle').click();
    cy.get('.pf-v5-c-menu__item-text').should('have.length', '1').contains('1.1.0');
  });

  it('user can delete version from repository', () => {
    cy.uploadCollection(collection, namespace, '1.1.0');
    cy.galaxykit('task wait all');
    cy.approveCollection(collection, namespace, '1.0.0');
    cy.galaxykit('task wait all');
    cy.approveCollection(collection, namespace, '1.1.0');
    cy.galaxykit('task wait all');
    cy.get('[data-cy="table-view"]').click();
    cy.filterTableBySingleText(collection);
    cy.clickLink(collection);
    cy.url().should('contain', `/collections/published/${namespace}/${collection}/details`);
    cy.get('.pf-v5-c-menu-toggle').click();
    cy.get('.pf-v5-c-menu__item-text').contains('1.0.0').click();
    cy.url().should(
      'contain',
      `/collections/published/${namespace}/${collection}/details?version=1.0.0`
    );
    cy.selectDetailsPageKebabAction('delete-version-from-repository');
    cy.clickButton(/^Close$/);

    //Verify the version has been deleted
    cy.galaxykit('task wait all');
    cy.navigateTo('hub', Collections.url);
    cy.filterTableBySingleText(collection);
    cy.clickLink(collection);
    cy.url().should('contain', `/collections/published/${namespace}/${collection}/details`);
    cy.get('.pf-v5-c-menu-toggle').click();
    cy.get('.pf-v5-c-menu__item-text').should('have.length', '1').contains('1.1.0');
  });

  // it.skip('can copy a version to repository', () => {});

  // it.skip('can access the Install tab and download a tarball', () => {});
});

// describe.skip('Collection Approvals List', () => {
//   before(() => {
//     cy.hubLogin();
//   });

//   it.skip('can approve a collection', () => {});

//   it.skip('can reject a collection', () => {});

//   it.skip('can upload a signature to a collection', () => {});
// });
