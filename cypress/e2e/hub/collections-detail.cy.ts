import { QueryParamsType } from '@ansible/eda-ui/interfaces/generated/eda-api';
import { HubNamespace } from '@ansible/hub-ui/namespaces/HubNamespace';
import { hubAPI, pulpAPI } from '../../support/formatApiPathForHub';
import { randomE2Ename } from '../../support/utils';
import { Collections } from './constants';
import { AAP_DEV_LOCALHOST_URL, AZURE_URL, OCP_A_URL, SAAS_URL } from '../../support/constants';

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
        cy.getByDataCy('table-view').click();
        cy.filterTableByTextFilter('name', collectionName);
        cy.clickLink(collectionName);
        cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
        cy.get('[data-cy="refresh"]').click();
        cy.clickTab(/^Details$/, true);
        cy.get('[data-cy="refresh"]').click();
        cy.contains('Loading').should('not.exist');
        cy.get(`[data-cy="browse-collection-version"] button`).as('versionButton');
        cy.get('@versionButton').first().click();
        cy.get('.pf-v6-c-menu__item-text').contains(firstVersion).click();
        cy.clickTab(/^Details$/, true);
        cy.contains('#version', firstVersion);
        cy.get('@versionButton').should('not.have.class', 'pf-m-expanded');
        cy.get(`[data-cy="browse-collection-version"] button .pf-v6-c-menu-toggle__text`).should(
          'contain',
          firstVersion
        );
        cy.selectDetailsPageKebabAction('delete-version-from-repository');
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
        cy.get('.pf-v6-c-menu__item-text').should('have.length', '1');
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
        cy.verifyPageTitle(Collections.title);
        cy.verifyPageTitle(Collections.title);
        cy.get('.pf-v6-c-empty-state__title-text')
          .should((_) => {})
          .then(($el) => {
            if ($el.length) {
              cy.contains(/^No collections yet/);
            } else {
              cy.filterTableByTextFilter('name', collectionName);
              cy.contains('No results found');
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
        cy.verifyPageTitle(Collections.title);
        cy.getHubCollection(collectionName).then((deleted: QueryParamsType) => {
          expect(deleted.data).to.be.empty;
        });
      });

      it.skip('can copy a version to repository', () => {
        //skipping this test due to flakiness. Needs to be migrated to Playwright
        cy.checkBuildType().then((buildType) => {
          if (buildType !== OCP_A_URL) {
            cy.navigateTo('hub', Collections.url);
            cy.filterTableByTextFilter('name', collectionName, { disableFilterSelection: true });
            cy.clickLink(collectionName);
            cy.getBy(`[data-cy="actions-dropdown"]`).click();
            cy.getBy('[data-cy="copy-version-to-repositories"]').click();
            cy.collectionCopyVersionToRepositories(collectionName, 3);
          } else {
            cy.log('Test/tests should not run on this deployment.');
          }
        });
      });

      it('user can delete version from system', () => {
        cy.getByDataCy('table-view').click();
        cy.filterTableByTextFilter('name', collectionName, { disableFilterSelection: true });
        cy.clickLink(collectionName);
        cy.get('[data-cy="refresh"]').click();
        cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
        cy.clickTab(/^Details$/, true);
        cy.contains('Loading').should('not.exist');
        cy.get(`[data-cy="browse-collection-version"] button`).as('versionButton');
        cy.get('@versionButton').first().click();
        cy.get('.pf-v6-c-menu__item-text').contains(firstVersion).click();
        cy.url().should(
          'contain',
          `/collections/validated/${namespace.name}/${collectionName}/details?version=${firstVersion}`
        );
        cy.get('@versionButton').should('not.have.class', 'pf-m-expanded');
        cy.get(`[data-cy="browse-collection-version"] button .pf-v6-c-menu-toggle__text`).should(
          'contain',
          firstVersion
        );
        cy.selectDetailsPageKebabAction('delete-version-from-system');
        cy.get('[data-cy="refresh"]').click();
        cy.navigateTo('hub', Collections.url);
        cy.getByDataCy('table-view').click();
        cy.filterTableByTextFilter('name', collectionName, { disableFilterSelection: true });
        cy.clickLink(collectionName);
        cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
        cy.contains('Loading').should('not.exist');
        cy.get('@versionButton').first().click();
        cy.get('.pf-v6-c-menu__item-text').should('have.length', '1');
      });
    });

    describe('If SaaS Build', () => {
      before(function () {
        cy.checkBuildType().then((buildType) => {
          if (
            [SAAS_URL, AZURE_URL, OCP_A_URL, AAP_DEV_LOCALHOST_URL].includes(buildType as string)
          ) {
            cy.log('Test/tests should not run on this deployment.');
            this.skip();
          } else {
            cy.log('Run these tests');
          }
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
          visitCollection(collectionName, namespace.name);
          cy.selectDetailsPageKebabAction('sign-collection');
          cy.getModal().should('not.exist');
          cy.get('[data-cy="signed-status"]').contains(Collections.signedStatus);
        });

        it('can sign a selected version of a collection', () => {
          cy.uploadCollection(collectionName, namespace.name, firstVersion).then(() => {
            cy.waitForAllTasks();
            cy.galaxykit(
              'collection upload --skip-upload',
              namespace.name,
              collectionName,
              latestVersion
            ).then((result) => {
              const filePath = (result as unknown as Record<string, string>).filename;
              visitCollection(collectionName, namespace.name);
              cy.getByDataCy('version').should('contain', firstVersion);
              cy.get(`[data-cy="${collectionName}"]`).should('contain', `${collectionName}`);
              cy.clickPageAction('upload-new-version');
              cy.contains('button', 'Browse').click();
              cy.get('input[id="file-filename"]').selectFile(filePath, {
                action: 'drag-drop',
              });
              cy.get('#radio-non-pipeline').click();
              cy.filterTableByTextFilter('repository', 'validated', {
                disableFilterSelection: true,
              });
              cy.getTableRowByText('validated', false).within(() => {
                cy.getByDataCy('checkbox-column-cell').click();
              });
              cy.get('[data-cy="Submit"]').click();
              cy.verifyPageTitle(Collections.title);
              cy.getByDataCy('table-view').click();
              cy.filterTableByTextFilter('name', collectionName, { disableFilterSelection: true });
              cy.clickTableRow(collectionName, false);
              cy.verifyPageTitle(collectionName);
              cy.get(`[data-cy="browse-collection-version"] button`).first().click();
              cy.contains('[type="button"]', '1.0.0 updated').click();
              cy.getByDataCy('version').should('contain', firstVersion);
              cy.getByDataCy('signed-state').should('contain', 'Unsigned');
              cy.get('[data-cy="actions-dropdown"]').click();
              cy.getByDataCy(`sign-version`).click();
              cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
                cy.get('[data-ouia-component-id="confirm"]').click();
                cy.get('[data-ouia-component-id="submit"]').click();
              });
              cy.getByDataCy('version').should('contain', firstVersion);
              cy.getByDataCy('signed-state').should('contain', 'Signed');
              cy.get(`[data-cy="browse-collection-version"] button`).first().click();
              cy.contains('[type="button"]', '(latest)').click();
              cy.getByDataCy('version').should('contain', latestVersion);
              cy.getBy('[data-cy="alert-toaster"]')
                .should('be.visible')
                .and('contain', 'A new version of this collection has been uploaded. Click');
              cy.getByDataCy('signed-state').should('contain', 'Unsigned');
              cy.deleteHubCollectionByName(collectionName);
            });
          });
        });

        it('can deprecate/undeprecate a collection', () => {
          visitCollection(collectionName, namespace.name);
          cy.selectDetailsPageKebabAction('deprecate-collection');
          cy.getModal().should('not.exist');
          cy.getByDataCy('deprecated-status').should('exist');
          cy.selectDetailsPageKebabAction('undeprecate-collection');
          cy.get('[data-cy="deprecated-status"]').should('not.exist');
          cy.selectDetailsPageKebabAction('deprecate-collection');
          cy.getByDataCy('deprecated-status').should('exist');
          cy.contains('a', namespace.name).click();
          cy.contains(`[role="tab"]`, 'Collections').click();
          cy.getByDataCy('table-view').click();
          cy.intercept(
            'GET',
            hubAPI`/v3/plugin/ansible/search/collection-versions/*keywords=${collectionName}*`
          ).as('search');
          cy.filterTableByTextFilter('name', collectionName);
          cy.wait('@search');
          cy.get(`[aria-label="Simple table"]`).within(() => {
            cy.getByDataCy('actions-dropdown').click();
          });
          cy.contains('button', 'Undeprecate collection').click();
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
