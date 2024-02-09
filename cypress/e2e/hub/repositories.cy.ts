import { Repositories } from './constants';
import { randomString } from '../../../framework/utils/random-string';

describe.skip('Repositories', () => {
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

describe('Repositories Remove collection', () => {
  let collections: string[];
  let namespace: string;
  let repository: string;
  let numCollections: number;

  afterEach(() => {
    /*collections?.forEach( (collection) => {
      cy.galaxykit('-i collection delete ', namespace, collection);
    });

    cy.galaxykit('task wait all');
    cy.galaxykit('-i repository remove', repository);
    cy.galaxykit('-i namespace remove', namespace);*/
  });

  it('it should add and then remove the collections', () => {
    // fill data
    numCollections = 3;
    collections = [];
    for (let i = 0; i < numCollections; i++) {
      collections.push('hub_e2e_collection_' + randomString(5, undefined, { isLowercase: true }));
    }

    namespace = 'hub_e2e_appr_namespace' + randomString(5).toLowerCase();
    repository = 'hub_e2e_appr_repository' + randomString(5);

    cy.hubLogin();

    cy.galaxykit(`repository create ${repository}`);
    cy.galaxykit('task wait all');
    cy.wait(2000);
    cy.galaxykit(`distribution create ${repository}`);
    cy.galaxykit(`namespace create ${namespace}`);
    cy.galaxykit('task wait all');
    cy.wait(2000);

    collections.forEach((collection) => {
      cy.galaxykit(`collection upload ${namespace} ${collection}`);
    });

    cy.galaxykit('task wait all');
    cy.wait(2000);

    // add collections
    cy.navigateTo('hub', Repositories.url);
    cy.filterTableBySingleText(repository);
    cy.contains(`[data-cy="repository-name-column-cell"] a`, repository).click();
    cy.contains(`a[role="tab"]`, 'Collection versions').click();

    cy.get(`[data-cy="add-collections"]`).click();

    const modal = `[aria-label="Add collections versions to repository"] `;
    cy.get(modal).within(() => {
      cy.contains('Add collections versions to repository');

      collections.forEach((collection) => {
        cy.filterTableBySingleText(collection + '{enter}');
        cy.contains(collection);
        cy.get(`[data-cy="checkbox-column-cell"]`).click();
      });

      cy.contains('button', 'Select').click();
    });
    cy.get(modal).should('not.exist');

    collections.forEach((collection) => {
      cy.contains(collection);
    });

    // verify you can open and close modal using different button
  });
});
