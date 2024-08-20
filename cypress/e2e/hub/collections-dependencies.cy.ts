import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
import { hubAPI } from '../../support/formatApiPathForHub';
import { randomE2Ename } from '../../support/utils';
import { Collections } from './constants';

describe('Collections Dependencies', () => {
  let namespace: HubNamespace;
  let collectionName: string;

  before(() => {
    collectionName = randomE2Ename();
    cy.createHubNamespace().then((namespaceResult) => {
      namespace = namespaceResult;
      cy.uploadCollection(collectionName, namespace.name, '1.0.0');
      cy.waitForAllTasks();
    });
  });

  after(() => {
    cy.deleteCollectionsInNamespace(namespace.name);
    cy.deleteHubNamespace({ ...namespace, failOnStatusCode: false });
  });

  beforeEach(() => {
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
  });

  it('Collections Dependencies tab collections table empty state', () => {
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');
    cy.get('[data-cy="collection-dependencies-tab"]').click();
    cy.contains('Dependencies').should('be.visible');
    cy.contains('This collection requires the following collections for use').should('be.visible');
    // empty state
    cy.contains('No dependencies').should('be.visible');
  });
  it('Collections Dependencies tab collections table error state', () => {
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');
    cy.intercept(
      'GET',
      hubAPI`/_ui/v1/collection-versions/?dependency=${namespace.name}.${collectionName}&offset=0&limit=10`,
      {
        statusCode: 500,
        body: { error: 'Internal Server Error' },
      }
    ).as('getDependenciesMockError');
    cy.get('[data-cy="collection-dependencies-tab"]').click();
    cy.wait('@getDependenciesMockError');
    cy.contains('Dependencies').should('be.visible');
    // error state
    cy.contains('Error loading used by dependencies').should('be.visible');
  });
  it('Collections Dependencies tab collections table non-empty state', () => {
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');
    cy.intercept('GET', hubAPI`/_ui/v1/collection-versions/?dependency=*`, {
      fixture: 'collection_dependencies.json',
    }).as('getDependenciesMockData');
    cy.get('[data-cy="collection-dependencies-tab"]').click();
    cy.wait('@getDependenciesMockData');
    cy.contains('This collection is being used by').should('be.visible');
    // non-empty state
    cy.get('[data-ouia-component-id="simple-table"]').within(() => {
      cy.get('tbody tr').should('have.length', 6);
    });
  });
  it('Collections Dependencies tab dependencies list non-empty state', () => {
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');
    cy.get('[data-cy="collection-dependencies-tab"]').click();
    cy.contains('This collection is being used by').should('be.visible');
    cy.reload();
    cy.intercept('GET', hubAPI`/v3/plugin/ansible/search/collection-versions/?name=*`, {
      fixture: 'collection_with_one_dependency.json',
    }).as('getDependenciesMockData');
    cy.wait('@getDependenciesMockData');
    // non-empty state
    cy.get('button[data="collection-dependency"]').should('have.length', 1);
    cy.get('button[data="collection-dependency"]').click();
    cy.contains('span', 'Collection was not found in the system');
  });
});
