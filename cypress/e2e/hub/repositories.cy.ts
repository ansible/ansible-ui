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

describe('Repositories Remove collection', () => {
  let collections: string[];
  let namespace: string;
  let repository: string;
  let numCollections: number;

  afterEach(() => {
    collections?.forEach((collection) => {
      cy.galaxykit('-i collection delete ', namespace, collection, '1.0.0', repository);
      cy.galaxykit('task wait all');
    });
    cy.galaxykit('task wait all');
    cy.galaxykit('-i repository delete', repository);
    cy.galaxykit('task wait all');
    cy.galaxykit('-i namespace delete', namespace);
  });

  beforeEach(() => {
    cy.hubLogin();
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

    cy.galaxykit(`repository create ${repository}`);
    cy.galaxykit('task wait all');

    cy.galaxykit(`distribution create ${repository}`);
    cy.galaxykit('task wait all');

    cy.galaxykit(`namespace create ${namespace}`);
    cy.galaxykit('task wait all');

    collections.forEach((collection) => {
      cy.galaxykit(`collection upload ${namespace} ${collection}`);
      cy.galaxykit('task wait all');
    });

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
    cy.contains('button', 'Add collections').click();
    cy.get(modal).within(() => {
      cy.contains('button', 'Cancel').click();
    });
    cy.get(modal).should('not.exist');

    // Remove first collection
    cy.filterTableBySingleText(collections[0] + '{enter}');
    cy.get(`[aria-label="table view"]`).click();
    cy.get(`[data-cy="remove"]`).click();
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Delete collections versions');
    cy.assertModalSuccess();
    cy.clickModalButton('Close');
    cy.contains('button', 'Clear all filters').click();
    cy.contains(collections[0]).should('not.exist');

    // bulk remove rest
    cy.get(`[data-cy="select-all"]`).click();
    cy.contains('button', 'Remove collections').click();
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Remove collections versions');
    cy.assertModalSuccess();
    cy.clickModalButton('Close');
    cy.contains('No collection versions yet');
  });
});
