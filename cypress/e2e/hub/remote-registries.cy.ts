import { randomString } from '../../../framework/utils/random-string';
import { RemoteRegistry as IRemoteRegistry } from '../../../frontend/hub/administration/remote-registries/RemoteRegistry';
import { HubItemsResponse } from '../../../frontend/hub/common/useHubView';
import { hubAPI } from '../../support/formatApiPathForHub';
import { RemoteRegistry } from './constants';

describe('Remote Registry', () => {
  const testSignature: string = randomString(5, undefined, { isLowercase: true });
  function generateRemoteRegistryName(): string {
    return `test-${testSignature}-remote-registry-${randomString(5, undefined, {
      isLowercase: true,
    })}`;
  }

  after(() => {
    cy.log('Cleaning up remote registries');
    cy.requestGet<HubItemsResponse<IRemoteRegistry>>(
      hubAPI`/_ui/v1/execution-environments/registries/?name__icontains=${testSignature}`
    ).then((response: HubItemsResponse<IRemoteRegistry>) => {
      if (response.data && response.data.length > 0) {
        for (const remoteRegistry of response.data) {
          if (remoteRegistry.name.includes(testSignature)) {
            cy.log(`Deleting remote registry ${remoteRegistry.name}`);
            cy.deleteHubRemoteRegistry({ id: remoteRegistry.id, failOnStatusCode: false });
          }
        }
      }
    });
  });

  it('explore different views and pagination', () => {
    const remoteRegistryName = generateRemoteRegistryName();
    cy.createRemoteRegistry(remoteRegistryName).then((remoteRegistry: IRemoteRegistry) => {
      cy.navigateTo('hub', RemoteRegistry.url);
      cy.setTablePageSize('50');
      cy.filterTableBySingleText(remoteRegistry.name);
      cy.get('[data-cy="card-view"]').click();
      cy.contains(remoteRegistry.name).should('be.visible');
      cy.get('[data-cy="list-view"]').click();
      cy.contains(remoteRegistry.name).should('be.visible');
      cy.get('[data-cy="table-view"]').click();
      cy.contains(remoteRegistry.name).should('be.visible');
      cy.get('#select-all').click();
      cy.clickToolbarKebabAction('delete-remote-registries');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete remote registries$/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('sync remote registries', () => {
    const remoteRegistryName = generateRemoteRegistryName();
    cy.createRemoteRegistry(remoteRegistryName).then((remoteRegistry: IRemoteRegistry) => {
      cy.navigateTo('hub', RemoteRegistry.url);
      cy.filterTableBySingleText(remoteRegistry.name);
      cy.get('[data-cy="sync-status-column-cell"]').should(
        'contain',
        RemoteRegistry.initialSyncStatus
      );
      cy.clickTableRowAction('name', remoteRegistryName, 'sync-remote-registry', {
        disableFilter: true,
        inKebab: true,
      });
      cy.get('[data-cy="sync-status-column-cell"]').should('contain', RemoteRegistry.syncStatus);
      cy.deleteRemoteRegistry(remoteRegistry.id);
    });
  });

  it('index execution environments', () => {
    const remoteRegistryName = generateRemoteRegistryName();
    cy.createRemoteRegistry(remoteRegistryName, RemoteRegistry.validIndexableURL).then(
      (remoteRegistry: IRemoteRegistry) => {
        cy.navigateTo('hub', RemoteRegistry.url);
        cy.url().should('include', 'remote-registries');
        cy.filterTableBySingleText(remoteRegistry.name);
        cy.clickTableRowAction('name', remoteRegistry.name, 'index-execution-environments', {
          disableFilter: true,
          inKebab: true,
        });
        cy.hasAlert(`Indexing remote registry ${remoteRegistry.name}`);
        cy.clickTableRowAction('name', remoteRegistry.name, 'delete-remote-registry', {
          disableFilter: true,
          inKebab: true,
        });
        cy.get('#confirm').click();
        cy.clickButton(/^Delete remote registries/);
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
      }
    );
  });

  it('create, search and delete a remote registry', () => {
    const remoteRegistryName = generateRemoteRegistryName();
    cy.navigateTo('hub', RemoteRegistry.url);
    cy.verifyPageTitle(RemoteRegistry.title);
    cy.get('[data-cy="create-remote-registry"]').should('be.visible').click();
    cy.url().should('include', RemoteRegistry.urlCreate);
    cy.get('[data-cy="name"]').type(remoteRegistryName);
    cy.get('[data-cy="url"]').type(RemoteRegistry.remoteURL);
    cy.get('[data-cy="Submit"]').click();
    cy.url().should('include', `remote-registries/${remoteRegistryName}/details`);
    cy.contains('Remote registries').click();
    cy.url().should('include', RemoteRegistry.url);
    cy.filterTableBySingleText(remoteRegistryName);
    cy.clickTableRowAction('name', remoteRegistryName, 'delete-remote-registry', {
      disableFilter: true,
      inKebab: true,
    });
    cy.get('#confirm').click();
    cy.clickButton(/^Delete remote registries/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('edit a remote registry', () => {
    const remoteRegistryName = generateRemoteRegistryName();
    cy.navigateTo('hub', RemoteRegistry.url);
    cy.get('[data-cy="create-remote-registry"]').should('be.visible').click();
    cy.get('[data-cy="name"]').type(remoteRegistryName);
    cy.get('[data-cy="url"]').type(RemoteRegistry.validIndexableURL);
    cy.intercept({
      method: 'GET',
      url: hubAPI`/_ui/v1/execution-environments/registries/?name=${remoteRegistryName}`,
    }).as('remoteRegistry');
    cy.get('[data-cy="Submit"]').click();
    cy.wait('@remoteRegistry').then(() => {
      cy.contains('Remote registries').click();
      cy.filterTableBySingleText(remoteRegistryName);
      cy.get('[data-cy="actions-column-cell"]').click();
      cy.get('[data-cy="edit-remote-registry"]').click({ force: true });
      cy.url().should('include', `remote-registries/${remoteRegistryName}/edit`);
      cy.get('[data-cy="url"]').clear().type(RemoteRegistry.remoteURL);
      cy.clickButton(/^Save remote registry$/);
      cy.url().should('include', `remote-registries/${remoteRegistryName}/details`);
      cy.get('[data-cy="name"]').should('contain', remoteRegistryName);
      cy.get('[data-cy="url"]').should('contain', RemoteRegistry.remoteURL);

      // Delete the edited remote registry
      cy.get('[data-cy="actions-dropdown"]').click();
      cy.get('[data-cy="delete-remote-registry"]').click();
      cy.get('#confirm').click();
      cy.clickButton(/^Delete remote registries/);
    });
  });
});
