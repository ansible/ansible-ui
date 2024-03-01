// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Repository } from '../../../frontend/hub/administration/repositories/Repository';
import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
import { randomE2Ename } from '../../support/utils';
import { Collections } from './constants';
describe('Collections', () => {
  let namespace: HubNamespace;
  let repository: Repository;
  let collectionName: string;

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
    // TODO - this is another PR - cy.deletehubDistribution(repository.name);
    cy.deleteHubRepository(repository);
    cy.deleteCollectionsInNamespace(namespace.name);
    cy.deleteHubNamespace({ ...namespace, failOnStatusCode: false });
  });

  beforeEach(() => {
    collectionName = randomE2Ename();
    cy.hubLogin();
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
    cy.get('[data-cy="table-view"]').click();
  });

  describe('Collections Page', () => {
    it('can sign a collection', () => {
      cy.uploadCollection(collectionName, namespace.name).then((result) => {
        cy.approveCollection(collectionName, namespace.name, result.version as string);
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
    });

    it('can upload and delete collection', () => {
      cy.galaxykit(`collection upload ${namespace.name} ${collectionName} --skip-upload`).then(
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
    });

    it('can upload and then delete a new version to an existing collection', () => {
      cy.uploadCollection(collectionName, namespace.name);
      cy.galaxykit(
        `collection move ${namespace.name} ${collectionName} 1.0.0 staging ${repository.name}`
      );
      cy.galaxykit(
        `collection upload ${namespace.name} ${collectionName} 1.2.3 --skip-upload`
      ).then((result: { filename: string }) => {
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
      });
      cy.deleteHubCollectionByName(collectionName);
    });

    it('can delete entire collection from system', () => {
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
      cy.uploadCollection(collectionName, namespace.name);
      cy.galaxykit(
        `collection move ${namespace.name} ${collectionName} 1.0.0 staging ${repository.name}`
      );

      // Delete collection from repository
      cy.filterTableBySingleText(collectionName, true);
      cy.clickTableRowKebabAction(
        collectionName,
        'delete-entire-collection-from-repository',
        false
      );
      cy.get('#confirm').click();
      cy.clickButton(/^Delete collections/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);

      //Verify collection has been deleted from repository
      cy.filterTableBySingleText(collectionName, true);
      cy.contains('No results found').should('be.visible');
    });

    it('can deprecate a collection', () => {
      cy.uploadCollection(collectionName, namespace.name);
      cy.galaxykit(
        `collection move ${namespace.name} ${collectionName} 1.0.0 staging ${repository.name}`
      );

      cy.filterTableBySingleText(collectionName, true);
      cy.clickTableRowKebabAction(collectionName, 'deprecate-collection', false);
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.clickButton('Deprecate collections');
        cy.clickButton('Close');
      });
      cy.getModal().should('not.exist');
      cy.contains('h2', 'No results found').should('be.visible');

      cy.deleteHubCollectionByName(collectionName);
    });

    // it.skip('can copy a version to repository', () => {
    //   //skipping this test because the Copy to Repository option is disabled for admin user
    //   cy.collectionCopyVersionToRepositories(collectionName);
    //   repository = 'community';

    //   cy.deleteCollection(collectionName, namespace.name, repository);
    // });
  });

  describe('Collection Page', () => {
    it('can delete entire collection from system', () => {
      cy.uploadCollection(collectionName, namespace.name, '1.0.0');
      cy.approveCollection(collectionName, namespace.name, '1.0.0');

      cy.filterTableBySingleText(collectionName, true);
      cy.clickLink(collectionName);
      cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
      cy.contains('Loading').should('not.exist');
      cy.selectDetailsPageKebabAction('delete-entire-collection-from-system');

      // Verify collection has been deleted from system
      cy.verifyPageTitle(Collections.title);
      cy.filterTableBySingleText(collectionName, true);
      cy.contains('No results found');
    });

    it('can delete entire collection from repository', () => {
      cy.uploadCollection(collectionName, namespace.name, '1.0.0');
      cy.approveCollection(collectionName, namespace.name, '1.0.0');

      cy.filterTableBySingleText(collectionName, true);
      cy.clickLink(collectionName);
      cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
      cy.contains('Loading').should('not.exist');
      cy.selectDetailsPageKebabAction('delete-entire-collection-from-repository');

      // Verify collection has been deleted from system
      cy.verifyPageTitle(Collections.title);
      cy.filterTableBySingleText(collectionName, true);
      cy.contains('No results found');
    });

    // it.skip('can deprecate a collection', () => {});

    it('user can delete version from system', () => {
      cy.uploadCollection(collectionName, namespace.name, '1.0.0');
      cy.uploadCollection(collectionName, namespace.name, '1.1.0');
      cy.approveCollection(collectionName, namespace.name, '1.0.0');
      cy.approveCollection(collectionName, namespace.name, '1.1.0');

      // Delete version from system
      cy.filterTableBySingleText(collectionName, true);
      cy.clickLink(collectionName);
      cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
      cy.contains('Loading').should('not.exist');
      cy.get('.pf-v5-c-menu-toggle').click();
      cy.get('.pf-v5-c-menu__item-text').contains('1.0.0').click();
      cy.url().should(
        'contain',
        `/collections/published/${namespace.name}/${collectionName}/details?version=1.0.0`
      );
      cy.selectDetailsPageKebabAction('delete-version-from-system');
      cy.clickButton(/^Close$/);

      //Verify the version has been deleted
      cy.navigateTo('hub', Collections.url);
      cy.filterTableBySingleText(collectionName, true);
      cy.clickLink(collectionName);
      cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
      cy.contains('Loading').should('not.exist');
      cy.get('.pf-v5-c-menu-toggle').click();
      cy.get('.pf-v5-c-menu__item-text').should('have.length', '1').contains('1.1.0');

      cy.deleteHubCollectionByName(collectionName);
    });

    it('user can delete version from repository', () => {
      cy.uploadCollection(collectionName, namespace.name, '1.0.0');
      cy.uploadCollection(collectionName, namespace.name, '1.1.0');
      cy.approveCollection(collectionName, namespace.name, '1.0.0');
      cy.approveCollection(collectionName, namespace.name, '1.1.0');

      // Delete version from repository
      cy.filterTableBySingleText(collectionName, true);
      cy.clickLink(collectionName);
      cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
      cy.contains('Loading').should('not.exist');
      cy.get('.pf-v5-c-menu-toggle').click();
      cy.get('.pf-v5-c-menu__item-text').contains('1.0.0').click();
      cy.url().should(
        'contain',
        `/collections/published/${namespace.name}/${collectionName}/details?version=1.0.0`
      );
      cy.selectDetailsPageKebabAction('delete-version-from-repository');
      cy.clickButton(/^Close$/);

      //Verify the version has been deleted
      cy.navigateTo('hub', Collections.url);
      cy.filterTableBySingleText(collectionName);
      cy.clickLink(collectionName);
      cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
      cy.url().should(
        'contain',
        `/collections/published/${namespace.name}/${collectionName}/details`
      );
      cy.get('.pf-v5-c-menu-toggle').click();
      cy.get('.pf-v5-c-menu__item-text').should('have.length', '1').contains('1.1.0');

      cy.deleteHubCollectionByName(collectionName);
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
});
