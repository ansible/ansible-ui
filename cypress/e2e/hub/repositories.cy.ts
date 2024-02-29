import { pulpAPI } from '../../support/formatApiPathForHub';
import { randomE2Ename } from '../../support/utils';
import { Repositories } from './constants';

describe('Repositories Page', () => {
  beforeEach(() => {
    cy.hubLogin();
    cy.navigateTo('hub', Repositories.url);
    cy.verifyPageTitle(Repositories.title);
  });

  it('should be able to create a repository', () => {
    const repositoryName = randomE2Ename();
    const repositoryDescription = 'Here goes description';
    cy.getByDataCy('create-repository').click();
    cy.verifyPageTitle('Create Repository');
    cy.url().should('include', Repositories.urlCreate);
    cy.getByDataCy('name').type(repositoryName);
    cy.getByDataCy('description').type(repositoryDescription);
    cy.getByDataCy('Submit').click();
    cy.verifyPageTitle(repositoryName);
    cy.get('[data-cy="description"]').should('contain', repositoryDescription);
  });

  it('should be able to edit a repository', () => {
    cy.createHubRepository().then((repository) => {
      cy.filterTableBySingleText(repository.name, true);
      cy.clickTableRowPinnedAction(repository.name, 'edit-repository', false);
      cy.verifyPageTitle('Edit Repository');
      const repositoryDescription = 'Here goes description';
      cy.get('[data-cy="description"]').type(repositoryDescription);
      cy.intercept({
        method: 'GET',
        url: pulpAPI`/repositories/ansible/ansible/?name=${repository.name}`,
      }).as('editRepository');
      cy.get('[data-cy="Submit"]').click();
      cy.wait('@editRepository').then(() => {
        cy.get('[data-cy="description"]').should('contain', repositoryDescription);
      });
      cy.deleteHubRepository(repository);
    });
  });

  it('should be able to delete a repository', () => {
    cy.createHubRepository().then((repository) => {
      cy.filterTableBySingleText(repository.name, true);
      cy.clickTableRow(repository.name, false);

      cy.verifyPageTitle(repository.name);
      cy.get('[data-cy="actions-dropdown"]').click();
      cy.get('[data-cy="delete-repository"]').click();
      cy.get('#confirm').click();
      cy.get('button').contains('Delete repositories').click();

      cy.verifyPageTitle(Repositories.title);
      cy.filterTableBySingleText(repository.name, true);
      cy.get('.pf-v5-c-empty-state').should('be.visible');
      cy.get('.pf-v5-c-empty-state').contains('No results found');
    });
  });

  it('should copy CLI to clipboard', () => {
    cy.createHubRepository().then((repository) => {
      cy.filterTableBySingleText(repository.name, true);
      cy.clickTableRow(repository.name, false);
      cy.verifyPageTitle(repository.name);
      cy.clickPageAction('copy-cli-configuration');
      cy.get('[data-cy="alert-toaster"]').should('be.visible');
      cy.deleteHubRepository(repository);
    });
  });

  it('should sync repository', () => {
    cy.createHubRemote().then((remote) => {
      cy.createHubRepository({ repository: { remote: remote.pulp_href } }).then((repository) => {
        cy.filterTableBySingleText(repository.name, true);
        cy.clickTableRowKebabAction(repository.name, 'sync-repository', false);
        cy.get('button').contains('Sync').click();
        cy.get('[data-cy="alert-toaster"]')
          .should('be.visible')
          .should('contain', `Sync started for repository "${repository.name}".`);
        cy.get('[data-cy="alert-toaster"]').within(() => {
          cy.get('button').click();
        });
        cy.deleteHubRepository(repository);
      });
      cy.deleteHubRemote(remote);
    });
  });
});

describe('Repository Page - Collection Versions', () => {
  beforeEach(() => {
    cy.hubLogin();
    cy.navigateTo('hub', Repositories.url);
    cy.verifyPageTitle(Repositories.title);
  });

  it('should be able to add and remove collection versions', () => {
    const collectionName = randomE2Ename();
    cy.createHubNamespace().then((namespace) => {
      cy.galaxykit(`collection upload ${namespace.name} ${collectionName}`);
      cy.createHubRepository().then((repository) => {
        cy.createHubRepositoryDistribution({
          distribution: { name: repository.name, repository: repository.pulp_href },
        });
        cy.filterTableBySingleText(repository.name, true);
        cy.clickTableRow(repository.name, false);

        // Collection page
        cy.verifyPageTitle(repository.name);

        // Collection versions tab
        cy.clickLink('Collection versions');

        // Add collections
        cy.getByDataCy('add-collections').click();
        cy.getModal().within(() => {
          cy.filterTableBySingleText(collectionName, true);
          cy.selectTableRow(collectionName, false);
          cy.clearAllFilters();
          cy.contains('button', 'Select').click();
        });
        cy.getModal().should('not.exist');

        // Verify collections are added and visible
        cy.get(`[aria-label="table view"]`).click();
        cy.contains('tr', collectionName).should('be.visible');

        // Should show the remove dialog from row action
        cy.clickTableRowPinnedAction(collectionName, 'remove', false);
        cy.getModal().within(() => {
          cy.contains('button', 'Delete collections versions');
          cy.contains('button', 'Cancel').click();
        });

        // Remove collection using table bulk action
        cy.filterTableBySingleText(collectionName, true);
        cy.selectTableRow(collectionName, false);
        cy.containsBy('button', 'Remove collections').click();
        cy.getModal().within(() => {
          cy.get('input[id="confirm"]').click();
          cy.contains('button', 'Remove collections versions').click();
          cy.contains('button', 'Close').click();
        });

        // Verify collections are removed
        cy.contains('tr', collectionName).should('not.exist');

        cy.deleteHubRepositoryDistributionByName(repository.name);
        cy.deleteHubRepository(repository);
      });
      cy.deleteHubCollectionByName(collectionName);
      cy.deleteHubNamespace(namespace);
    });
  });
});

describe('Repository Page - Versions', () => {
  beforeEach(() => {
    cy.hubLogin();
    cy.navigateTo('hub', Repositories.url);
    cy.verifyPageTitle(Repositories.title);
  });

  it('should be able to revert repository version', () => {
    const collectionName = randomE2Ename();
    cy.createHubNamespace().then((namespace) => {
      cy.galaxykit(`collection upload ${namespace.name} ${collectionName}`);
      cy.createHubRepository({ repository: { retain_repo_versions: 2 } }).then((repository) => {
        cy.createHubRepositoryDistribution({
          distribution: { name: repository.name, repository: repository.pulp_href },
        });
        cy.filterTableBySingleText(repository.name, true);
        cy.clickTableRow(repository.name, false);

        // Collection page
        cy.verifyPageTitle(repository.name);

        // Collection versions tab
        cy.clickLink(/Collection versions/);
        cy.contains('No collection versions yet');

        // Add collections
        cy.getByDataCy('add-collections').click();
        cy.getModal().within(() => {
          cy.filterTableBySingleText(collectionName, true);
          cy.selectTableRow(collectionName, false);
          cy.clearAllFilters();
          cy.contains('button', 'Select').click();
        });
        cy.getModal().should('not.exist');

        // Verify collections are added and visible
        cy.get(`[aria-label="table view"]`).click();
        cy.contains('tr', collectionName).should('be.visible');

        // Versions tab
        cy.clickLink(/Versions/);

        // Revert repository version
        cy.contains('Version number');
        // Takes a while for the version to switch to 1 (latest)
        cy.contains('td', '1 (latest)', { timeout: 60 * 1000 }).should('be.visible');
        cy.getTableRowBy('version-number', /^0$/).within(() => {
          cy.clickKebabAction('revert-to-this-version');
        });
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Revert to repository version');
        cy.clickModalButton('Close');

        // Collection versions tab
        cy.clickLink(/Collection versions/);
        // Verify collections are removed since we are reverting to repository version 0
        cy.contains('No collection versions yet');

        cy.deleteHubRepositoryDistributionByName(repository.name);
        cy.deleteHubRepository(repository);
      });
      cy.deleteHubCollectionByName(collectionName);
      cy.deleteHubNamespace(namespace);
    });
  });
});
