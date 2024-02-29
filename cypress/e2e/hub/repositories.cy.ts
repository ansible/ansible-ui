import { Repositories } from './constants';
import { randomString } from '../../../framework/utils/random-string';
import { pulpAPI } from '../../support/formatApiPathForHub';

describe('Repositories', () => {
  let repositoryName: string;
  let remoteName: string;
  before(() => {
    cy.hubLogin();
  });
  afterEach(() => {
    cy.galaxykit('-i repository delete ' + repositoryName);
    cy.galaxykit('-i remote delete ' + remoteName);
  });
  it('should render the repositories page', () => {
    cy.navigateTo('hub', Repositories.url);
    cy.verifyPageTitle(Repositories.title);
  });
  it('should copy CLI to clipboard', () => {
    repositoryName = 'repositories_repository_' + randomString(6, undefined, { isLowercase: true });
    cy.navigateTo('hub', Repositories.url);
    cy.verifyPageTitle(Repositories.title);
    cy.get('[data-cy="create-repository"]').should('be.visible').click();
    cy.get('[data-cy="name"]').type(repositoryName);
    cy.get('[data-cy="Submit"]').click();
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="copy-cli-configuration"]').click();
    cy.get('[data-cy="alert-toaster"]').should('be.visible');
    //dismiss alert
    cy.get('[data-cy="alert-toaster"]').within(() => {
      cy.get('button').click();
    });
  });
  it('should sync repository', () => {
    remoteName = 'repositories_repository_' + randomString(6, undefined, { isLowercase: true });
    cy.createRemote(remoteName).then(() => {
      repositoryName =
        'repositories_repository_' + randomString(6, undefined, { isLowercase: true });
      cy.navigateTo('hub', Repositories.url);
      cy.verifyPageTitle(Repositories.title);
      cy.get('[data-cy="create-repository"]').should('be.visible').click();
      cy.get('[data-cy="name"]').type(repositoryName);
      cy.get('#remote').click();
      cy.get('button').contains(remoteName).click();
      cy.get('[data-cy="Submit"]').click();
      cy.get('[data-cy="actions-dropdown"]').click();
      cy.get('[data-cy="sync-repository"]').click();
      cy.get('button').contains('Sync').click();
      cy.get('[data-cy="alert-toaster"]')
        .should('be.visible')
        .should('contain', `Sync started for repository "${repositoryName}".`);
      //dismiss alert
      cy.get('[data-cy="alert-toaster"]').within(() => {
        cy.get('button').click();
      });
    });
  });
  it('should be able to create a repository', () => {
    repositoryName = 'repositories_repository_' + randomString(6, undefined, { isLowercase: true });
    const repositoryDescription = 'Here goes description';
    cy.navigateTo('hub', Repositories.url);
    cy.verifyPageTitle(Repositories.title);
    cy.get('[data-cy="create-repository"]').should('be.visible').click();
    cy.url().should('include', Repositories.urlCreate);
    cy.get('[data-cy="name"]').type(repositoryName);
    cy.get('[data-cy="description"]').type(repositoryDescription);
    cy.get('[data-cy="Submit"]').click();
    // new repository should be create and an user redirected to its detail page
    cy.verifyPageTitle(repositoryName);
    cy.get('[data-cy="description"]').should('contain', repositoryDescription);
  });
  it('should be able to edit a repository', () => {
    repositoryName = 'repositories_repository_' + randomString(6, undefined, { isLowercase: true });
    const repositoryDescription = 'Here goes description';
    cy.intercept({
      method: 'GET',
      url: pulpAPI`/repositories/ansible/ansible/?name=${repositoryName}`,
    }).as('editRepository');
    cy.navigateTo('hub', Repositories.url);
    cy.verifyPageTitle(Repositories.title);
    cy.get('[data-cy="create-repository"]').should('be.visible').click();
    cy.url().should('include', Repositories.urlCreate);
    cy.get('[data-cy="name"]').type(repositoryName);
    cy.get('[data-cy="Submit"]').click();
    cy.verifyPageTitle(repositoryName);
    cy.get('[data-cy="edit-repository"]').click();
    cy.get('[data-cy="description"]').type(repositoryDescription);
    cy.get('[data-cy="Submit"]').click();
    // wait for page to reload new data
    cy.wait('@editRepository').then(() => {
      cy.get('[data-cy="description"]').should('contain', repositoryDescription);
    });
  });
  it('should be able to delete a repository', () => {
    const repositoryNameLocal =
      'repositories_repository_' + randomString(6, undefined, { isLowercase: true });
    cy.navigateTo('hub', Repositories.url);
    cy.verifyPageTitle(Repositories.title);
    cy.get('[data-cy="create-repository"]').should('be.visible').click();
    cy.url().should('include', Repositories.urlCreate);
    cy.get('[data-cy="name"]').type(repositoryNameLocal);
    cy.get('[data-cy="Submit"]').click();
    cy.verifyPageTitle(repositoryNameLocal);
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="delete-repository"]').click();
    cy.get('#confirm').click();
    cy.get('button').contains('Delete repositories').click();
    cy.verifyPageTitle(Repositories.title);
    cy.get('[data-cy="text-input"]').type(repositoryNameLocal);
    cy.get('.pf-v5-c-empty-state').should('be.visible');
    cy.get('.pf-v5-c-empty-state').contains('No results found');
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

describe('Repositories - revert to repository version', () => {
  let collections: string[];
  let namespace: string;
  let repository: string;
  let numCollections: number;

  beforeEach(() => {
    cy.hubLogin();
    namespace = 'hub_e2e_appr_namespace' + randomString(5).toLowerCase();
    repository = 'hub_e2e_appr_repository' + randomString(5);

    cy.galaxykit(`repository create ${repository}`);
    cy.galaxykit('task wait all');

    cy.galaxykit(`distribution create ${repository}`);
    cy.galaxykit('task wait all');

    cy.galaxykit(`namespace create ${namespace}`);
    cy.galaxykit('task wait all');
  });

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

  it('it should revert to repository version', () => {
    numCollections = 1;

    collections = [];
    for (let i = 0; i < numCollections; i++) {
      collections.push('hub_e2e_collection_' + randomString(5, undefined, { isLowercase: true }));
    }

    cy.navigateTo('hub', Repositories.url);
    cy.filterTableBySingleText(repository);
    cy.contains(`[data-cy="repository-name-column-cell"] a`, repository).click();
    cy.contains(`a[role="tab"]`, 'Collection versions').click();

    // can see empty repository
    cy.contains('No collection versions yet');

    // set retained versions count
    cy.get(`[data-cy="edit-repository"]`).click();
    cy.get(`[data-cy="Submit"]`);
    cy.get(`[data-cy="retain-repo-versions"]`).type('1');
    cy.get(`[data-cy="Submit"]`).click();
    cy.get(`[data-cy="Submit"]`).should('not.exist');

    // add collections to repo
    collections.forEach((collection) => {
      cy.galaxykit(`collection upload ${namespace} ${collection}`);
      cy.galaxykit('task wait all');
      cy.galaxykit(`collection move ${namespace} ${collection} 1.0.0 staging ${repository}`);
      cy.galaxykit('task wait all');
    });

    cy.contains('No collection versions yet').should('not.exist');

    // can revert to repository
    cy.contains(`a[role="tab"]`, 'Versions').click();
    cy.contains('Version number');
    cy.get(`[data-cy="actions-dropdown"]`);
    cy.get(`[data-cy="actions-dropdown"]`).eq(1).click();
    cy.contains(`a[data-cy="revert-to-this-version"]`, 'Revert to this version').click();

    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Revert to repository version');
    cy.assertModalSuccess();
    cy.clickModalButton('Close');

    cy.galaxykit('task wait all');

    cy.contains(`a[role="tab"]`, 'Collection versions').click();
    // can see empty repository again
    cy.contains('No collection versions yet');
  });
});
