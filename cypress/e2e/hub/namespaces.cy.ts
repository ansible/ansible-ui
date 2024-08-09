import { randomString } from '../../../framework/utils/random-string';
import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
import { randomE2Ename } from '../../support/utils';
import { MyImports, Namespaces } from './constants';

const apiPrefix = Cypress.env('HUB_API_PREFIX') as string;

describe('Namespaces', () => {
  it('create, search and delete a namespace', () => {
    cy.navigateTo('hub', Namespaces.url);
    cy.verifyPageTitle('Namespaces');
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.getByDataCy('create-namespace').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.getByDataCy('name').type(namespaceName);
    cy.getByDataCy('company').type('test company');
    cy.getByDataCy('link-text-0').type('test link');
    cy.getByDataCy('link-url-0').type('https://test.com');
    cy.getByDataCy('Submit').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.selectDetailsPageKebabAction('delete-namespace');
    cy.url().should('include', Namespaces.url);
    cy.url().should('not.include', `/namespaces/${namespaceName}/details`);
  });

  it('should show the correct URL when clicking on the CLI configuration tab', () => {
    cy.navigateTo('hub', Namespaces.url);
    cy.verifyPageTitle('Namespaces');
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.getByDataCy('create-namespace').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.getByDataCy('name').type(namespaceName);
    cy.getByDataCy('company').type('test company');
    cy.getByDataCy('Submit').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.getByDataCy('namespace-cli-tab').should('contain', 'CLI Configuration');
    cy.getByDataCy('namespace-cli-tab').click();
    cy.get('.pf-v5-c-truncate__start').should('contain', apiPrefix);
    // Delete namespace
    cy.getByDataCy('actions-dropdown').click();
    cy.getByDataCy('delete-namespace').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Delete namespaces$/);
  });
});
describe('Namespaces - use existing namespaces', () => {
  let namespace: HubNamespace;
  before(() => {
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.createHubNamespace({
      namespace: {
        name: namespaceName,
        description: 'test description',
        company: 'test company',
        links: [{ name: 'test link', url: 'https://test.com' }],
      },
    }).then((ns: HubNamespace) => {
      namespace = ns;
    });
  });
  after(() => cy.deleteHubNamespace(namespace));

  it('should show namespace details tab', () => {
    cy.visit(`${Namespaces.url}/${namespace.name}`);

    cy.getByDataCy('name').should('contain', namespace.name);
    cy.getByDataCy('description').should('contain', 'test description');
    cy.getByDataCy('company').should('contain', 'test company');
    cy.getByDataCy('key-value-list-title').should('contain', 'Useful links');
    cy.getByDataCy('item-key-0').should('contain', 'test link');
    const linkUrl = 'https://test.com';
    cy.getByDataCy(`item-value-${linkUrl}`).should('contain', linkUrl);
  });

  it('should show collections tab', () => {
    cy.visit(`${Namespaces.url}/${namespace.name}`);
    cy.url().should('include', `/namespaces/${namespace.name}/details`);
    cy.getByDataCy('collections-tab').should('contain', 'Collections');
    cy.getByDataCy('collections-tab').click();
    cy.getByDataCy('empty-state-title').should('contain', 'No collections yet');
    cy.getByDataCy('upload-collection').should('contain', 'Upload collection');

    cy.clickPageAction('imports');
    cy.url().should('include', MyImports.url);
    cy.url().should('include', namespace.name);
    cy.verifyPageTitle(MyImports.title);
    cy.get('#namespace-selector').contains(namespace.name);
  });

  it('edit a namespace', () => {
    cy.visit(`${Namespaces.url}/${namespace.name}`);

    cy.url().should('include', `/namespaces/${namespace.name}/details`);
    cy.getByDataCy('edit-namespace').click();
    cy.getByDataCy('company').clear().type('new company');
    cy.getByDataCy('description').clear().type('new description');
    cy.getByDataCy('Submit').click();
    cy.getByDataCy('company').contains(/^new company$/);
    cy.getByDataCy('description').contains(/^new description$/);
  });

  it('explore different views and pagination', () => {
    cy.navigateTo('hub', Namespaces.url);
    cy.verifyPageTitle('Namespaces');
    cy.setTablePageSize('50');
    cy.filterTableBySingleText(namespace.name);
    cy.setTableView('card');
    cy.contains(namespace.name).should('be.visible');
    cy.setTableView('list');
    cy.contains(namespace.name).should('be.visible');
    cy.setTableView('table');
    cy.contains(namespace.name).should('be.visible');
  });
});
describe('Namespaces - collections', () => {
  it('can sign a collection', () => {
    let namespace: HubNamespace;
    const collectionName = randomE2Ename();
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.createHubNamespace({
      namespace: {
        name: namespaceName,
        description: 'test description',
        company: 'test company',
        links: [{ name: 'test link', url: 'https://test.com' }],
      },
    }).then((ns: HubNamespace) => {
      namespace = ns;
      cy.uploadCollection(collectionName, namespace.name, '1.0.0').then(() => {
        cy.approveCollection(collectionName, namespace.name, '1.0.0').then(() => {
          cy.waitForAllTasks();
          cy.navigateTo('hub', 'namespaces');
          cy.verifyPageTitle('Namespaces');
          cy.setTableView('table');
          cy.filterTableBySingleText(namespace.name, true);
          cy.clickTableRow(namespace.name, false);
          cy.getByDataCy('collections-tab').click();
          cy.setTableView('table');
          // Sign collection
          cy.filterTableBySingleText(collectionName, true);
          cy.get('[aria-label="Simple table"] [data-cy="actions-dropdown"]').click();
          cy.get(`[data-cy="sign-collection"] button`).click();
          cy.get('#confirm').click();
          cy.clickButton(/^Sign collections$/);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.getModal().should('not.exist');
          cy.get('div[data-cy="manage-view"]').within(() => {
            cy.clickKebabAction('actions-dropdown', 'imports');
          });
          cy.getByDataCy('status').should('contain', 'Completed');
          cy.getByDataCy('approval-status').should('be.visible');
          cy.deleteHubCollectionByName(collectionName).then(() => cy.deleteHubNamespace(namespace));
        });
      });
    });
  });
});
describe('Namespaces - delete', () => {
  it('user can bulk delete namespaces', () => {
    cy.createHubNamespace().then((namespace1) => {
      cy.createHubNamespace().then((namespace2) => {
        cy.waitForAllTasks();
        cy.navigateTo('hub', 'namespaces');
        cy.verifyPageTitle('Namespaces');
        cy.setTablePageSize('10');
        cy.setTableView('table');
        cy.filterTableBySingleText(namespace1.name, true);
        cy.selectTableRow(namespace1.name, false);
        cy.filterTableBySingleText(namespace2.name, true);
        cy.selectTableRow(namespace2.name, false);
        cy.clickToolbarKebabAction('delete-namespaces');
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete namespaces');
        cy.assertModalSuccess();
        cy.clickButton(/^Close$/);
      });
    });
  });
});
