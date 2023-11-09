import { randomString } from '../../../framework/utils/random-string';
import { Remotes } from './constants';

const remoteName = `test-remote-${randomString(5, undefined, { isLowercase: true })}`;

describe('Remotes', () => {
  before(() => {
    cy.hubLogin();
    cy.navigateTo('hub', 'remotes');
  });

  it('create, search and delete a remote', () => {
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
    cy.searchAndDisplayResource(remoteName);
    cy.contains(Remotes.noResults);
  });
});
