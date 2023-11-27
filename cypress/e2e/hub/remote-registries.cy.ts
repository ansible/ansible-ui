import { randomString } from '../../../framework/utils/random-string';
import { RemoteRegistry } from './constants';

describe('Remote Registry', () => {
  before(() => {
    cy.hubLogin();
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
