import { Repositories } from './constants';
import { randomString } from '../../../framework/utils/random-string';

describe('Repositories', () => {
  before(() => {
    cy.hubLogin();
  });
  it('it should render the repositories page', () => {
    cy.navigateTo('hub', Repositories.url);
    cy.verifyPageTitle(Repositories.title);
  });
  it('should copy CLI to clipboard', () => {
    const repositoryName =
      'repositories_repository_' + randomString(6, undefined, { isLowercase: true });
    cy.navigateTo('hub', Repositories.url);
    cy.verifyPageTitle(Repositories.title);
    cy.get('[data-cy="create-repository"]').should('be.visible').click();
    cy.get('[data-cy="name"]').type(repositoryName);
    cy.get('[data-cy="Submit"]').click();
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="copy-cli-configuration"]').click();
    cy.get('[data-cy="alert-toaster"]').should('be.visible');
    cy.galaxykit('-i repository delete ' + repositoryName);
  });
});
