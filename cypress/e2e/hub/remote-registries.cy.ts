import { randomString } from '../../../framework/utils/random-string';
import { RemoteRegistry as IRemoteRegistry } from '../../../frontend/hub/remote-registries/RemoteRegistry';
import { RemoteRegistry } from './constants';

describe('Remote Registry', () => {
  before(() => {
    cy.hubLogin();
  });

  it('explore different views and pagination', () => {
    const remoteRegistryName = `test-remote-registry-${randomString(5, undefined, {
      isLowercase: true,
    })}`;
    cy.createRemoteRegistry(remoteRegistryName);
    cy.navigateTo('hub', RemoteRegistry.url);
    cy.setTablePageSize('50');
    cy.searchAndDisplayResource(remoteRegistryName);
    cy.get('[data-cy="card-view"]').click();
    cy.contains(remoteRegistryName).should('be.visible');
    cy.get('[data-cy="list-view"]').click();
    cy.contains(remoteRegistryName).should('be.visible');
    cy.get('[data-cy="table-view"]').click();
    cy.contains(remoteRegistryName).should('be.visible');
    cy.get('#select-all').click();
    cy.clickToolbarKebabAction('delete-selected-remote-registries');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete remote registries$/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('sync remote registries', () => {
    const remoteRegistryName = `test-remote-registry-${randomString(5, undefined, {
      isLowercase: true,
    })}`;
    cy.createRemoteRegistry(remoteRegistryName).then((remoteRegistry: IRemoteRegistry) => {
      cy.navigateTo('hub', RemoteRegistry.url);
      cy.searchAndDisplayResource(remoteRegistryName);
      cy.get('[data-cy="actions-column-cell"]').click();
      cy.get('[data-cy="sync-remote-registry"]').click({ force: true });
      cy.get('[data-cy="sync-status-column-cell"]').should('contain', RemoteRegistry.syncStatus);
      cy.deleteRemoteRegistry(remoteRegistry.id);
    });
  });

  it('create, search and delete a remote registry', () => {
    const remoteRegistryName = `test-remote-registry-${randomString(5, undefined, {
      isLowercase: true,
    })}`;
    cy.navigateTo('hub', RemoteRegistry.url);
    cy.verifyPageTitle(RemoteRegistry.title);
    cy.get('[data-cy="create-remote-registry"]').should('be.visible').click();
    cy.url().should('include', RemoteRegistry.urlCreate);
    cy.get('[data-cy="name"]').type(remoteRegistryName);
    cy.get('[data-cy="url"]').type(RemoteRegistry.remoteURL);
    cy.get('[data-cy="Submit"]').click();
    cy.url().should('include', RemoteRegistry.url);
    cy.searchAndDisplayResource(remoteRegistryName);
    cy.get('[data-cy="actions-column-cell"]').click();
    cy.get('[data-cy="delete-remote-registry"]').click({ force: true });
    cy.get('#confirm').click();
    cy.clickButton(/^Delete remote registries/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
