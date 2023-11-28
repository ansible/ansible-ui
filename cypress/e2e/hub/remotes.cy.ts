import { randomString } from '../../../framework/utils/random-string';
import { Remotes } from './constants';

describe('Remotes', () => {
  before(() => {
    cy.hubLogin();
  });

  it('create, search and delete a remote', () => {
    cy.navigateTo('hub', 'remotes');
    const remoteName = `test-remote-${randomString(5, undefined, { isLowercase: true })}`;
    cy.get('h1').should('contain', Remotes.title);
    cy.get('[data-cy="create-remote"]').should('be.visible').click();
    cy.url().should('include', Remotes.urlCreate);
    cy.get('[data-cy="name"]').type(remoteName);
    cy.get('[data-cy="url"]').type(Remotes.remoteURL);
    cy.get('[data-cy="Submit"]').click();
    cy.url().should('include', Remotes.url);
    cy.searchAndDisplayResource(remoteName);
    cy.get('[data-cy="actions-column-cell"]').click();
    cy.get('[data-cy="delete-remote"]').click({ force: true });
    cy.get('#confirm').click();
    cy.clickButton(/^Delete remote/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });

  it('edit a remote', () => {
    cy.navigateTo('hub', 'remotes');
    const remoteName = `test-remote-${randomString(5, undefined, { isLowercase: true })}`;
    cy.get('[data-cy="create-remote"]').should('be.visible').click();
    cy.url().should('include', Remotes.urlCreate);
    cy.get('[data-cy="name"]').type(remoteName);
    cy.get('[data-cy="url"]').type(Remotes.remoteURL);
    cy.get('[data-cy="Submit"]').click();
    cy.searchAndDisplayResource(remoteName);
    cy.get('[data-cy="actions-column-cell"]').click();
    cy.get('[data-cy="edit-remote"]').click({ force: true });
    cy.url().should('include', `remotes/${remoteName}/edit`);
    cy.get('[data-cy="url"]').clear().type(Remotes.editRemoteURL);
    cy.get('[data-cy="username"]').type(Remotes.username);
    cy.get('[data-cy="password"]').type(Remotes.password);
    cy.get('[data-cy="expandable-section"]').find('button').first().click();
    cy.get('[data-cy="token"]').type(Remotes.token);
    cy.get('[data-cy="auth-url"]').type(Remotes.ssoURL);
    cy.get('[data-cy="proxy-url"]').type(Remotes.proxyURL);
    cy.get('[data-cy="proxy-username"]').type(Remotes.username);
    cy.get('[data-cy="proxy-password"]').type(Remotes.password);
    cy.get('[data-cy="download-concurrency"]').type(Remotes.downloadConcurrency);
    cy.get('[data-cy="rate-limit"]').type(Remotes.rateLimit);
    cy.get('[data-cy="tls_validation"]').click();
    cy.clickButton(/^Edit remote$/);
    cy.clickButton(/^Clear all filters$/);
    cy.contains(remoteName).click();
    cy.url().should('include', `remotes/details/${remoteName}`);
    cy.get('[data-cy="name"]').should('contain', remoteName);
    cy.get('[data-cy="url"]').should('contain', Remotes.editRemoteURL);
    cy.get('[data-cy="proxy-url"]').should('contain', Remotes.proxyURL);
    cy.get('[data-cy="tls-validation"]').should('contain', Remotes.tlsValidation);
    cy.get('[data-cy="rate-limit"]').should('contain', Remotes.rateLimit);
    cy.get('[data-cy="download-concurrency"]').should('contain', Remotes.downloadConcurrency);

    // Delete the edited remote
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="delete-remote"]').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Delete remotes/);
  });
});
