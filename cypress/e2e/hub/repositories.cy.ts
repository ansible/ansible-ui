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
  let collections : string[];
  let namespace: string;
  let repository: string;
  let numCollections : number;

  afterEach( () => {
    /*collections?.forEach( (collection) => {
      cy.galaxykit('-i collection delete ', namespace, collection);
    });

    cy.galaxykit('task wait all');
    cy.galaxykit('-i repository remove', repository);
    cy.galaxykit('-i namespace remove', namespace);*/
  });

  it('it should add and then remove the collections', () => {    
    numCollections = 3;
    collections = [];
    for (let i = 0; i < numCollections; i++)
    {
      collections.push('hub_e2e_collection_' + randomString(5));
    }

    namespace = 'hub_e2e_appr_namespace' + randomString(5).toLowerCase();
    repository = 'hub_e2e_appr_repository' + randomString(5);    
    cy.hubLogin();

    cy.galaxykit('repository create', repository);
    cy.galaxykit('namespace create', namespace);
    cy.galaxykit('task wait all');

    /*collections.forEach( (collection) => {
      debugger;
      const upload = `-i collection upload ${namespace} ${collection} 1.0.0`;
      cy.galaxykit(upload);  
    });
    cy.galaxykit('task wait all');

    collections.forEach( (collection) => {
      cy.galaxykit('-i collection move', namespace, collection, '1.0.0', 'staging', repository);  
    });
    cy.galaxykit('task wait all');*/

    cy.navigateTo('hub', Repositories.url + `/{repository}/collection-version`);
    
    /*collections.forEach( (collection) => {
      cy.contains(collection);
    });*/
  });
});
