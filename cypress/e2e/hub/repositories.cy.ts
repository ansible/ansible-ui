import { HubRemote } from '@ansible/hub-ui/administration/remotes/Remotes';
import { Repository } from '@ansible/hub-ui/administration/repositories/Repository';
import { HubNamespace } from '@ansible/hub-ui/namespaces/HubNamespace';
import { randomE2Ename } from '../../support/utils';
import { Repositories } from './constants';

describe('GalaxyKit Installation Check for Repositories', () => {
  before(function () {
    cy.isGalaxyKitInstalled().then((isInstalled) => {
      if (!isInstalled) {
        cy.log('GalaxyKit is not installed, skipping the test suite');
        this.skip();
      }
    });
  });

  describe('Repositories', () => {
    const collectionName = randomE2Ename();
    let namespace: HubNamespace;
    let remote: HubRemote;
    let repository: Repository;

    before(() => {
      cy.createHubNamespace().then((namespaceResult) => {
        namespace = namespaceResult;
        cy.uploadCollection(collectionName, namespace.name, '1.0.0').then(() => {
          cy.waitForAllTasks();
        });
      });
    });

    after(() => {
      cy.deleteHubCollectionByName(collectionName);
      cy.deleteHubNamespace(namespace);
    });

    beforeEach(() => {
      cy.navigateTo('hub', Repositories.url);
      cy.verifyPageTitle('Repositories');
      cy.createHubRemote().then((remoteResult) => {
        remote = remoteResult;
        cy.createHubRepository({
          repository: { remote: remote.pulp_href, retain_repo_versions: 2 },
        }).then((repositoryResult) => {
          repository = repositoryResult;
          cy.createHubRepositoryDistribution({
            distribution: { name: repository.name, repository: repository.pulp_href },
          });
        });
      });
    });

    afterEach(() => {
      cy.deleteHubRepositoryDistributionByName(repository.name);
      cy.deleteHubRepository(repository);
      cy.deleteHubRemote(remote);
    });

    function navigateToRepositories() {
      cy.navigateTo('hub', Repositories.url);
      cy.verifyPageTitle('Repositories');
    }

    it('should be able to create edit and delete a repository', () => {
      const repositoryName = randomE2Ename();
      const repositoryDescription = 'Here goes description';
      cy.getByDataCy('create-repository').click();
      cy.verifyPageTitle('Create repository');
      cy.getByDataCy('name').type(repositoryName);
      cy.getByDataCy('description').type(repositoryDescription);
      cy.getByDataCy('Submit').click();
      cy.verifyPageTitle(`${repositoryName}`);
      cy.hasDetail(/^Description$/, 'Here goes description');
      cy.hasDetail(/^Labels$/, 'None');
      cy.hasDetail(/^Remote$/, 'None');
      cy.hasDetail(/^Retained version count$/, '1');
      navigateToRepositories();
      const editDescription = 'repositoryDescription edited';
      const RetainedNumber = '10';
      cy.clickTableRowAction('name', repositoryName, 'edit-repository', { inKebab: false });
      cy.verifyPageTitle(`Edit ${repositoryName}`);
      cy.getByDataCy('description').clear().type(editDescription);
      cy.getByDataCy('retain-repo-versions-form-group').last().clear().type(RetainedNumber);
      cy.getByDataCy('pipeline-form-group').last().click().getByDataCy('approved').click();
      cy.get('[id="remote"]').click();
      cy.get('li').contains(`${remote.name}`).click();
      cy.getByDataCy('Submit').click();
      cy.verifyPageTitle(repositoryName);
      cy.hasDetail('Name', repositoryName);
      cy.contains('Description').should('be.visible');
      cy.get('[data-cy="description"]').should('contain', editDescription);
      cy.hasDetail('Retained version count', RetainedNumber);
      cy.hasDetail('Labels', 'approved');
      cy.hasDetail('Remote', remote.name);
      navigateToRepositories();
      cy.clickTableRowLink('name', repositoryName);
      cy.verifyPageTitle(repositoryName);
      cy.get('[data-cy="actions-dropdown"]').click();
      cy.get('[data-cy="delete-repository"]').click();
      cy.get('#confirm').click();
      cy.get('button').contains('Delete repositories').click();
      cy.verifyPageTitle('Repositories');
      cy.filterTableByTextFilter('name', repositoryName);
      cy.get('.pf-v6-c-empty-state').should('be.visible');
      cy.contains('No results found');
    });

    it('should copy CLI to clipboard', () => {
      cy.clickTableRowLink('name', repository.name);
      cy.verifyPageTitle(repository.name);
      cy.clickPageAction('copy-cli-configuration');
      cy.get('[data-cy="alert-toaster"]').should('be.visible');
      cy.get('[data-cy="alert-toaster"]').within(() => {
        cy.get('button').click();
      });
      navigateToRepositories();
    });

    it('should sync repository', () => {
      cy.clickTableRowAction('name', repository.name, 'sync-repository', { inKebab: true });
      cy.getModal().within(() => {
        cy.get('button').contains('Sync').click();
      });
      cy.get('[data-cy="alert-toaster"]')
        .should('be.visible')
        .should('contain', `Sync started for repository "${repository.name}".`);
      cy.get('[data-cy="alert-toaster"]').within(() => {
        cy.get('button').click();
      });
    });

    it('should be able to add and remove collection versions', () => {
      cy.clickTableRowLink('name', repository.name);
      cy.verifyPageTitle(repository.name);
      cy.clickTab('Collection Versions', true);
      cy.getByDataCy('add-collections').click();
      cy.getModal().within(() => {
        cy.filterTableByTextFilter('namespace', namespace.name);
        cy.selectTableRowByCheckbox('name', collectionName, { disableFilter: true });
        cy.contains('button', 'Select').click();
      });
      cy.getModal().should('not.exist');
      cy.setTableView('table');
      cy.getTableRow('name', collectionName, { disableFilter: true }).should('be.visible');
      cy.getTableRow('name', collectionName, { disableFilter: true }).within(() => {
        cy.get(`[data-cy="actions-column-cell"]`).within(() => {
          cy.getBy(`[data-cy="remove"]`).click();
        });
      });
      cy.getModal().within(() => {
        cy.contains('button', 'Delete collections versions').should('be.visible');
        cy.get('#cancel').click();
      });
      cy.selectTableRowByCheckbox('name', collectionName, { disableFilter: true });
      cy.containsBy('button', 'Remove collections').click();
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.get('#submit').click();
      });
      cy.contains('tr', collectionName).should('not.exist');
      navigateToRepositories();
    });

    it.skip('should be able to revert repository version', () => {
      //unskip when https://issues.redhat.com/browse/AAP-51887 is resolved
      cy.clickTableRowLink('name', repository.name);
      cy.verifyPageTitle(repository.name);
      cy.clickTab('Collection Versions', true);
      cy.contains('No collection versions yet');
      cy.getByDataCy('add-collections').click();
      cy.getModal().within(() => {
        cy.filterTableByTextFilter('namespace', namespace.name);
        cy.selectTableRowByCheckbox('name', collectionName, { disableFilter: true });
        cy.contains('button', 'Select').click();
      });
      cy.getModal().should('not.exist');
      cy.get(`[aria-label="table view"]`).click();
      cy.getTableRow('name', collectionName, { disableFilter: true }).should('be.visible');
      cy.clickTab(/^Versions$/, true);
      cy.contains('Version number');
      cy.contains('td', '1 (latest)', { timeout: 60 * 1000 }).should('be.visible');
      cy.clickTableRowAction('version-number', '0', 'revert-to-this-version', {
        inKebab: true,
        disableFilter: true,
      });
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.get('#submit').click();
      });
      cy.clickTab('Collection Versions', true);
      cy.contains('No collection versions yet');
      navigateToRepositories();
    });
  });
});
