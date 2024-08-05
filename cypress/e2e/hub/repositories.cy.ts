import { HubRemote } from '../../../frontend/hub/administration/remotes/Remotes';
import { Repository } from '../../../frontend/hub/administration/repositories/Repository';
import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
//import { pulpAPI } from '../../support/formatApiPathForHub';
import { randomE2Ename } from '../../support/utils';
import { Repositories } from './constants';

describe('Repositories', () => {
  const collectionName = randomE2Ename();
  let namespace: HubNamespace;
  let remote: HubRemote;
  let repository: Repository;

  before(() => {
    // Create namespace and upload collection only once in the before hook
    // as it is not necessary to create a new namespace and upload collection for each test
    cy.createHubNamespace().then((namespaceResult) => {
      namespace = namespaceResult;
      //cy.galaxykit(`collection upload ${namespace.name} ${collectionName}`);
      cy.uploadCollection(collectionName, namespace.name, '1.0.0');
    });
  });

  after(() => {
    cy.deleteHubCollectionByName(collectionName);
    cy.deleteHubNamespace(namespace);
  });

  beforeEach(() => {
    cy.navigateTo('hub', Repositories.url);
    cy.verifyPageTitle('Repositories');

    // Create remote and repository before each test
    // Note: Some tests like create and delete do not use this shared remote and repository
    // otherwise it would cause issues in the after eachhook when deleting
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

    // Create repository
    cy.getByDataCy('create-repository').click();
    cy.verifyPageTitle('Create repository');
    cy.getByDataCy('name').type(repositoryName);
    cy.getByDataCy('description').type(repositoryDescription);

    cy.getByDataCy('Submit').click();
    cy.verifyPageTitle(`${repositoryName}`);
    cy.hasDetail(/^Description$/, 'Here goes description');

    navigateToRepositories();

    // Edit Repository
    const editDescripiption = 'repositoryDescription edited';
    cy.clickTableRowAction('name', repositoryName, 'edit-repository', { inKebab: false });
    cy.verifyPageTitle(`Edit ${repositoryName}`);
    cy.getByDataCy('description').clear().type(editDescripiption);
    cy.getByDataCy('Submit').click();

    // Check Repository Details
    cy.verifyPageTitle(repositoryName);
    cy.hasDetail('Name', repositoryName);
    cy.hasDetail('Description', editDescripiption);

    navigateToRepositories();

    // Delete Rpository
    cy.clickTableRowLink('name', repositoryName);
    // Repository Details
    cy.verifyPageTitle(repositoryName);
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="delete-repository"]').click();
    cy.get('#confirm').click();
    cy.get('button').contains('Delete repositories').click();

    // Repositories Page
    cy.verifyPageTitle('Repositories');
    cy.filterTableByTextFilter('name', repositoryName);
    cy.get('.pf-v5-c-empty-state').should('be.visible');
    cy.get('.pf-v5-c-empty-state').contains('No results found');
  });

  it.skip('should copy CLI to clipboard', () => {
    cy.clickTableRowLink('name', repository.name);

    // Repository Details
    cy.verifyPageTitle(repository.name);
    cy.clickPageAction('copy-cli-configuration');
    cy.get('[data-cy="alert-toaster"]').should('be.visible');
    cy.get('[data-cy="alert-toaster"]').within(() => {
      cy.get('button').click();
    });
  });

  it('should sync repository', () => {
    cy.clickTableRowAction('name', repository.name, 'sync-repository', { inKebab: true });

    // Sync modal
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

  it.skip('should be able to add and remove collection versions', () => {
    // Repository Details
    cy.clickTableRowLink('name', repository.name);
    cy.verifyPageTitle(repository.name);

    // Collection versions tab
    cy.clickTab('Collection versions', true);

    // Add collections
    cy.getByDataCy('add-collections').click();
    cy.getModal().within(() => {
      cy.filterTableByTextFilter('namespace', namespace.name);
      cy.selectTableRowByCheckbox('name', collectionName, { disableFilter: true });
      cy.contains('button', 'Select').click();
    });
    cy.getModal().should('not.exist');

    // Verify collections are added and visible
    cy.setTableView('table');
    cy.getTableRow('name', collectionName, { disableFilter: true }).should('be.visible');

    // Should show the remove dialog from row action
    cy.clickTableRowAction('name', collectionName, 'remove', { disableFilter: true });
    cy.getModal().within(() => {
      cy.contains('button', 'Delete collections versions').should('be.visible');
      cy.get('#cancel').click();
    });

    // Remove collection using table bulk action
    cy.selectTableRowByCheckbox('name', collectionName, { disableFilter: true });
    cy.containsBy('button', 'Remove collections').click();
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.get('#submit').click();
      cy.contains('button', 'Close').click();
    });

    // Verify collections are removed
    cy.contains('tr', collectionName).should('not.exist');
  });

  it.skip('should be able to revert repository version', () => {
    // Repository Details
    cy.clickTableRowLink('name', repository.name);
    cy.verifyPageTitle(repository.name);

    // Collection versions tab
    cy.clickTab('Collection versions', true);
    cy.contains('No collection versions yet');

    // Add collections
    cy.getByDataCy('add-collections').click();
    cy.getModal().within(() => {
      cy.filterTableByTextFilter('namespace', namespace.name);
      cy.selectTableRowByCheckbox('name', collectionName, { disableFilter: true });
      cy.contains('button', 'Select').click();
    });
    cy.getModal().should('not.exist');

    // Verify collections are added and visible
    cy.get(`[aria-label="table view"]`).click();
    cy.getTableRow('name', collectionName, { disableFilter: true }).should('be.visible');

    // Versions tab
    cy.clickTab(/Versions/, true);

    // Revert repository version
    cy.contains('Version number');
    // Takes a while for the version to switch to 1 (latest)
    cy.contains('td', '1 (latest)', { timeout: 60 * 1000 }).should('be.visible');
    cy.clickTableRowAction('version-number', '0', 'revert-to-this-version', {
      inKebab: true,
      disableFilter: true,
    });
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.get('#submit').click();
      cy.contains('button', 'Close').click();
    });

    // Collection versions tab
    cy.clickTab('Collection versions', true);
    // Verify collections are removed since we are reverting to repository version 0
    cy.contains('No collection versions yet');
  });
});
