import { HubNamespace } from '@ansible/hub-ui/namespaces/HubNamespace';
import { pulpAPI } from '../../support/formatApiPathForHub';
import { randomE2Ename } from '../../support/utils';
import { Collections } from './constants';
import { QueryParamsType } from '../../../frontend/eda/interfaces/generated/eda-api';

function visitCollection(collection: string, namespace: string) {
  cy.navigateTo('hub', Collections.url);
  cy.verifyPageTitle(Collections.title);
  cy.getByDataCy('table-view').click();
  cy.filterTableByTextFilter('name', collection);
  cy.clickLink(collection);
  cy.verifyPageTitle(`${namespace}.${collection}`);
}

describe('GalaxykKit Installation for Collections Details', () => {
  let namespace: HubNamespace;
  let collectionName: string;
  const latestVersion: string = '1.2.3';
  const firstVersion: string = '1.0.0';

  before(function () {
    cy.isGalaxyKitInstalled().then((isInstalled) => {
      if (!isInstalled) {
        cy.log(`GalaxyKit is not installed, skipping the test suite`);
        this.skip();
      }
    });
  });

  describe('Collections Details', () => {
    before(() => {
      cy.createHubNamespace().then((namespaceResult: HubNamespace) => {
        namespace = namespaceResult;
      });
    });

    after(() => {
      cy.deleteCollectionsInNamespace(namespace.name);
      cy.deleteHubNamespace({ ...namespace, failOnStatusCode: false });
    });

    describe('Collections Details - Delete from repository', () => {
      beforeEach(() => {
        collectionName = randomE2Ename();
        cy.navigateTo('hub', Collections.url);
        cy.verifyPageTitle(Collections.title);
        cy.uploadCollection(collectionName, namespace.name, firstVersion).then(() => {
          cy.waitForAllTasks();
          cy.galaxykit(
            'collection upload --skip-upload',
            namespace.name,
            collectionName,
            firstVersion
          );
          cy.waitForAllTasks();
        });
        cy.uploadCollection(collectionName, namespace.name, latestVersion);
        cy.waitForAllTasks();
      });

      it('user can delete version from repository', () => {
        // Delete version from repository
        cy.getByDataCy('table-view').click();
        cy.filterTableByTextFilter('name', collectionName);
        cy.clickLink(collectionName);
        cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
        // refreshing the page to force UI to update and cypress to wait
        cy.get('[data-cy="refresh"]').click();
        cy.clickTab(/^Details$/, true);
        cy.get('[data-cy="refresh"]').click();
        cy.contains('Loading').should('not.exist');
        cy.get(`[data-cy="browse-collection-version"] button`).as('versionButton');
        cy.get('@versionButton').first().click();
        cy.get('.pf-v5-c-menu__item-text').contains(firstVersion).click();
        cy.url().should(
          'contain',
          `/collections/validated/${namespace.name}/${collectionName}/details?version=${firstVersion}`
        );
        cy.get('@versionButton').should('not.have.class', 'pf-m-expanded');
        cy.get(`[data-cy="browse-collection-version"] button .pf-v5-c-menu-toggle__text`).should(
          'contain',
          firstVersion
        );
        cy.selectDetailsPageKebabAction('delete-version-from-repository');

        // Verify the version has been deleted
        // refreshing the page to force UI to update and cypress to wait
        cy.get('[data-cy="refresh"]').click();
        cy.navigateTo('hub', Collections.url);
        cy.getByDataCy('table-view').click();
        cy.filterTableByTextFilter('name', collectionName);
        cy.clickLink(collectionName);
        cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
        cy.clickTab(/^Details$/, true);
        cy.url().should(
          'contain',
          `/collections/validated/${namespace.name}/${collectionName}/details`
        );
        cy.get(`[data-cy="browse-collection-version"] button`).first().click();
        cy.get('.pf-v5-c-menu__item-text').should('have.length', '1').contains(latestVersion);
      });
    });

    describe('Collections Details -  Copy and delete', () => {
      beforeEach(() => {
        collectionName = randomE2Ename();
        cy.navigateTo('hub', Collections.url);
        cy.verifyPageTitle(Collections.title);
        cy.uploadCollection(collectionName, namespace.name, firstVersion).then(() => {
          cy.waitForAllTasks();
          cy.galaxykit(
            'collection upload --skip-upload',
            namespace.name,
            collectionName,
            firstVersion
          );
          cy.waitForAllTasks();

          cy.uploadCollection(collectionName, namespace.name, latestVersion);
          cy.waitForAllTasks();
        });
      });
      it('can delete entire collection from system', () => {
        cy.getByDataCy('table-view').click();
        cy.filterTableByTextFilter('name', collectionName, { disableFilterSelection: true });
        cy.clickLink(collectionName);
        cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
        cy.contains('Loading').should('not.exist');
        cy.selectDetailsPageKebabAction('delete-entire-collection-from-system');
        //This time is to wait for the page to refresh deleting a collection and navigating to Collection page
        cy.wait(2000);
        cy.verifyPageTitle(Collections.title);

        // Verify collection has been deleted from system
        cy.verifyPageTitle(Collections.title);
        cy.get('.pf-v5-c-empty-state__title-text')
          .should((_) => {})
          .then(($el) => {
            if ($el.length) {
              cy.contains(/^No collections yet/);
            } else {
              cy.filterTableByTextFilter('name', collectionName);
              cy.contains('No results found').should('exist');
            }
          });
      });
      it('can delete entire collection from repository', () => {
        cy.getByDataCy('table-view').click();
        cy.filterTableByTextFilter('name', collectionName, { disableFilterSelection: true });
        cy.clickLink(collectionName);
        cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
        cy.contains('Loading').should('not.exist');
        cy.selectDetailsPageKebabAction('delete-entire-collection-from-repository');
        // Verify collection has been deleted from system
        cy.verifyPageTitle(Collections.title);
        cy.getHubCollection(collectionName).then((deleted: QueryParamsType) => {
          // Assert that the query returns an empty array, indicating no API results exist
          expect(deleted.data).to.be.empty;
        });
        // Removed the lines attempting to assert that filtering the list for the collection returns an empty list
        // these lines fail if there are no Collections present
      });
      it('can copy a version to repository', () => {
        cy.navigateTo('hub', Collections.url);
        cy.filterTableByTextFilter('name', collectionName, { disableFilterSelection: true });
        cy.clickLink(collectionName);
        cy.clickKebabAction('actions-dropdown', 'copy-version-to-repositories');
        cy.collectionCopyVersionToRepositories(collectionName, 3);
      });
      it('user can delete version from system', () => {
        // Delete version from system
        cy.getByDataCy('table-view').click();
        cy.filterTableByTextFilter('name', collectionName, { disableFilterSelection: true });
        cy.clickLink(collectionName);
        // refreshing the page to force UI to update and cypress to wait
        cy.get('[data-cy="refresh"]').click();
        cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
        cy.clickTab(/^Details$/, true);
        cy.contains('Loading').should('not.exist');
        cy.get(`[data-cy="browse-collection-version"] button`).as('versionButton');
        cy.get('@versionButton').first().click();
        cy.get('.pf-v5-c-menu__item-text').contains(firstVersion).click();
        cy.url().should(
          'contain',
          `/collections/validated/${namespace.name}/${collectionName}/details?version=${firstVersion}`
        );
        cy.get('@versionButton').should('not.have.class', 'pf-m-expanded');
        cy.get(`[data-cy="browse-collection-version"] button .pf-v5-c-menu-toggle__text`).should(
          'contain',
          firstVersion
        );
        cy.selectDetailsPageKebabAction('delete-version-from-system');

        // Verify the version has been deleted
        // refreshing the page to force UI to update and cypress to wait
        cy.get('[data-cy="refresh"]').click();
        cy.navigateTo('hub', Collections.url);
        cy.getByDataCy('table-view').click();
        cy.filterTableByTextFilter('name', collectionName, { disableFilterSelection: true });
        cy.clickLink(collectionName);
        cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
        cy.contains('Loading').should('not.exist');
        cy.get('@versionButton').first().click();
        cy.get('.pf-v5-c-menu__item-text').should('have.length', '1').contains(latestVersion);
      });
    });

    describe('Collections Details - Signing and deprecation', () => {
      beforeEach(() => {
        collectionName = randomE2Ename();
        cy.navigateTo('hub', Collections.url);
        cy.verifyPageTitle(Collections.title);
        cy.uploadCollection(collectionName, namespace.name, firstVersion);
      });

      it('can sign a collection', () => {
        // Sign collection
        visitCollection(collectionName, namespace.name);
        cy.selectDetailsPageKebabAction('sign-collection');
        cy.getModal().should('not.exist');
        // Verify collection has been signed
        cy.get('[data-cy="signed-status"]').contains(Collections.signedStatus);
      });

      // https://issues.redhat.com/browse/AAP-31186
      // [ErrorDetail(string='Collection e2e_r1e6o.e2e_jul8w-1.0.0 already exists with a different artifact', code='invalid')]
      it.skip('can sign a selected version of a collection', () => {
        // This test won't work with the current resources created by the before each block
        // find a better way to create these resources before the test.
        cy.uploadCollection(collectionName, namespace.name, firstVersion).then(() => {
          cy.waitForAllTasks();
          cy.galaxykit(
            'collection upload --skip-upload',
            namespace.name,
            collectionName,
            latestVersion
          ).then((result) => {
            const filePath = (result as unknown as Record<string, string>).filename;
            // Visit the details screen of the newly uploaded collection
            visitCollection(collectionName, namespace.name);
            // Assert baseline version number
            cy.getByDataCy('version').should('contain', firstVersion);
            cy.get(`[data-cy="${collectionName}"]`).should('contain', `${collectionName}`);
            // Upload new version to the collection
            cy.clickPageAction('upload-new-version');
            cy.get('#file-browse-button').click();
            cy.get('input[id="file-filename"]').selectFile(filePath, {
              action: 'drag-drop',
            });
            cy.get('#radio-non-pipeline').click();
            cy.filterTableByTextFilter('repository', 'validated', { disableFilterSelection: true });
            cy.getTableRowByText('validated', false).within(() => {
              cy.getByDataCy('checkbox-column-cell').click();
            });
            cy.get('[data-cy="Submit"]').click();
            cy.verifyPageTitle(Collections.title);
            // Navigate back to the details screen of the collection after upload
            cy.getByDataCy('table-view').click();
            cy.filterTableByTextFilter('name', collectionName, { disableFilterSelection: true });
            cy.clickTableRow(collectionName, false);
            cy.verifyPageTitle(collectionName);
            cy.get(`[data-cy="browse-collection-version"] button`).first().click();

            cy.contains('[type="button"]', '1.0.0 updated').click();

            // Select the first version of the collection in order to sign it
            cy.getByDataCy('version').should('contain', firstVersion);
            cy.getByDataCy('signed-state').should('contain', 'Unsigned');
            // FIXME: here, the version changes from 1.0.0 to 1.2.3
            // could be autoreload when no version is explicitly selected, or sign-version forgetting state?
            cy.selectDetailsPageKebabAction('sign-version');

            // Reload the page to reflect and assert the newly signed version
            cy.reload();
            cy.getByDataCy('version').should('contain', firstVersion);
            cy.getByDataCy('signed-state').should('contain', 'Signed');
            // Display the other version of the collection to assert that it is not signed
            cy.get(`[data-cy="browse-collection-version"] button`).first().click();

            cy.contains('[type="button"]', '(latest)').click();

            cy.getByDataCy('version').should('contain', latestVersion);
            cy.getByDataCy('signed-state').should('contain', 'Unsigned');
            // Delete the collection
            cy.deleteHubCollectionByName(collectionName);
          });
        });
      });

      it('can deprecate/undeprecate a collection', () => {
        // Deprecate collection
        visitCollection(collectionName, namespace.name);
        cy.selectDetailsPageKebabAction('deprecate-collection');
        cy.getModal().should('not.exist');
        // Verify collection has been deprecated
        cy.getByDataCy('deprecated-status').should('exist');
        // Undeprecate collection
        cy.selectDetailsPageKebabAction('undeprecate-collection');
        // Verify collection has been undeprecated
        cy.get('[data-cy="deprecated-status"]').should('not.exist');

        // deprecate collection again
        cy.selectDetailsPageKebabAction('deprecate-collection');
        // Verify collection has been deprecated
        cy.getByDataCy('deprecated-status').should('exist');

        cy.contains('a', namespace.name).click();
        cy.contains(`[role="tab"]`, 'Collections').click();
        cy.getByDataCy('table-view').click();
        cy.filterTableByTextFilter('name', collectionName);
        cy.get(`[aria-label="Simple table"]`).within(() => {
          cy.getByDataCy('actions-dropdown').click();
        });
        cy.contains('button', 'Undeprecate collection').click();

        // click confirm
        cy.getModal().within(() => {
          cy.get(`input[type="checkbox"]`).click();
        });
        cy.contains('button', 'Undeprecate collections').click();
        cy.getModal().should('not.exist');

        cy.get(`[aria-label="Simple table"]`).within(() => {
          cy.get('[data-cy="deprecated-status"]').should('not.exist');
        });
      });
    });

    describe('Collections Details - Contents and Documentation', () => {
      beforeEach(() => {
        collectionName = randomE2Ename();
        cy.navigateTo('hub', Collections.url);
        cy.verifyPageTitle(Collections.title);
        cy.uploadCollection(collectionName, namespace.name, '1.0.0').then(() => {
          cy.waitForAllTasks();
          cy.galaxykit('collection upload --skip-upload', namespace.name, collectionName, '1.0.0');
          cy.waitForAllTasks();
        });
      });

      it('can show documentation tab for a collection', () => {
        visitCollection(collectionName, namespace.name);
        cy.intercept('GET', pulpAPI`/content/ansible/collection_versions/?namespace*`, {
          fixture: 'hubCollectionDocumentation.json',
        });
        cy.clickTab('Documentation', true);
        cy.contains('Documentation (1)').should('exist');
        cy.get('.hub-docs-content').within(() => {
          cy.get('h1').contains('Ansible Collection');
          cy.get('h3').contains('Galaxy collection build');
          cy.get('h3').contains('Galaxy collection install from file');
          cy.get('h3').contains('Galaxy collection install from git');
          cy.get('h3').contains('Playbook sample');
        });
        cy.contains('Module(1)').should('exist');
        cy.contains('hello_plugin').click();
        cy.get('.hub-docs-content').within(() => {
          cy.get('h1').contains('module > hello_plugin');
          cy.get('h2').contains('Synopsis');
          cy.get('h2').contains('Parameters');
          cy.get('h2').contains('Notes');
          cy.get('h2').contains('Examples');
          // json view exists
          cy.get('button').contains('json').click();
          cy.contains(
            'This will render content of the documentation in user non friendly format, but it will render complete content. Useful in situations, when documentation does not renders everything correctly.'
          ).should('exist');
          cy.get('pre').should('exist');
        });
        cy.contains('Role(1)').should('exist');
        cy.contains('roles_description').click();
        cy.get('.hub-docs-content').within(() => {
          cy.get('h1').contains('Role Name');
          cy.get('h2').contains('Requirements');
          cy.get('h2').contains('Role Variables');
          cy.get('h2').contains('Dependencies');
          cy.get('h2').contains('Example Playbook');
          cy.get('h2').contains('License');
          cy.get('h2').contains('Author Information');
        });
      });
    });
  });
});
