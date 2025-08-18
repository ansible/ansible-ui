import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { HubNamespace } from '@ansible/hub-ui/namespaces/HubNamespace';
import { hubAPI } from '../../support/formatApiPathForHub';
import { randomE2Ename } from '../../support/utils';
import { MyImports, Namespaces } from './constants';
import { AZURE_URL, OCP_A_URL, SAAS_URL } from '../../support/constants';

const apiPrefix = Cypress.env('HUB_API_PREFIX') as string;

function visitNamespace(name: string) {
  cy.navigateTo('hub', Namespaces.url);
  cy.verifyPageTitle('Namespaces');
  cy.filterTableBySingleText(name);
  cy.get('a').contains(name).click();
  cy.verifyPageTitle(name);
}

describe('Namespaces', () => {
  it('create, search and delete a namespace', () => {
    cy.navigateTo('hub', Namespaces.url);
    cy.verifyPageTitle('Namespaces');
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.clickLink('Create namespace');
    cy.url().should('include', Namespaces.urlCreate);
    cy.getByDataCy('name').type(namespaceName);
    cy.getByDataCy('company').type('test company');
    cy.get('.view-lines').click().type('name: example_namespace');
    cy.contains('Preview').click();
    cy.getByDataCy('resources-form-group').should('contain', 'name: example_namespace');
    cy.contains('Markdown').click();
    cy.getByDataCy('link-text-0').type('test link');
    cy.getByDataCy('link-url-0').type('https://test.com');
    cy.getByDataCy('Submit').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.contains('Resources').should('be.visible');
    cy.contains('name: example_namespace').should('be.visible');
    cy.selectDetailsPageKebabAction('delete-namespace');
    cy.url().should('include', Namespaces.url);
    cy.url().should('not.include', `/namespaces/${namespaceName}/details`);
  });

  it('should show the correct URL when clicking on the CLI configuration tab', () => {
    cy.navigateTo('hub', Namespaces.url);
    cy.verifyPageTitle('Namespaces');
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.clickLink('Create namespace');
    cy.url().should('include', Namespaces.urlCreate);
    cy.getByDataCy('name').type(namespaceName);
    cy.getByDataCy('company').type('test company');
    cy.getByDataCy('Submit').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.getByDataCy('namespace-cli-tab').should('contain', 'CLI Configuration');
    cy.getByDataCy('namespace-cli-tab').click();
    cy.get('.pf-v6-c-truncate__start').should('contain', apiPrefix);
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
    visitNamespace(namespace.name);
    cy.getByDataCy('name').should('contain', namespace.name);
    cy.getByDataCy('description').should('contain', 'test description');
    cy.getByDataCy('company').should('contain', 'test company');
    cy.getByDataCy('key-value-list-title').should('contain', 'Useful links');
    cy.getByDataCy('item-key-0').should('contain', 'test link');
    const linkUrl = 'https://test.com';
    cy.getByDataCy(`item-value-${linkUrl}`).should('contain', linkUrl);
  });

  it('should show collections tab', () => {
    visitNamespace(namespace.name);
    cy.url().should('include', `/namespaces/${namespace.name}/details`);
    cy.getByDataCy('collections-tab').should('contain', 'Collections');
    cy.getByDataCy('collections-tab').click();
    cy.contains('No collections yet').should('be.visible');
    cy.contains('Upload collection').should('be.visible');
    cy.clickPageAction('imports');
    cy.url().should('include', MyImports.url);
    cy.url().should('include', namespace.name);
    cy.verifyPageTitle(MyImports.title);
    cy.get('#namespace-selector').contains(namespace.name);
  });

  it('edit a namespace', () => {
    visitNamespace(namespace.name);
    cy.url().should('include', `/namespaces/${namespace.name}/details`);
    cy.getByDataCy('edit-namespace').click();
    // Ensure fields are visible, then avoid chaining after clear() to prevent detached subject issues
    cy.getByDataCy('company').should('be.visible');
    cy.getByDataCy('description').should('be.visible');

    cy.getByDataCy('company').clear();
    cy.getByDataCy('company').type('new company');

    cy.getByDataCy('description').clear();
    cy.getByDataCy('description').type('new description');
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

describe('Namespaces - sign collections', () => {
  let namespace: HubNamespace;
  const collectionName = randomE2Ename();
  const collectionName2 = randomE2Ename();
  const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;

  before(() => {
    cy.createHubNamespace({
      namespace: {
        name: namespaceName,
        description: 'test description',
        company: 'test company',
        links: [{ name: 'test link', url: 'https://test.com' }],
      },
    }).then((ns: HubNamespace) => {
      namespace = ns;
      cy.uploadCollection(collectionName, namespace.name, '1.0.0');
      cy.uploadCollection(collectionName2, namespace.name, '1.0.0');
    });
  });

  after(() => {
    cy.deleteCollectionsInNamespace(namespace.name);
    cy.deleteHubNamespace(namespace);
  });

  it('can sign a collection', function () {
    cy.checkBuildType().then((buildType) => {
      if (buildType === SAAS_URL || buildType === AZURE_URL || buildType === OCP_A_URL) {
        this.skip();
      } else {
        cy.waitForAllTasks();
        cy.navigateTo('hub', 'namespaces');
        cy.verifyPageTitle('Namespaces');
        cy.setTableView('table');
        cy.filterTableBySingleText(namespace.name, true);
        cy.clickTableRow(namespace.name, false);
        cy.getByDataCy('collections-tab').click();
        cy.setTableView('table');
        cy.filterTableBySingleText(collectionName, true);
        cy.get('[aria-label="Simple table"] [data-cy="actions-dropdown"]').click();
        cy.get(`[data-cy="sign-collection"] button`).click();
        cy.get('#confirm').click();
        cy.clickButton(/^Sign collections$/);
        cy.contains(/^Success$/);
        cy.getModal().should('not.exist');
        cy.get('div[data-cy="manage-view"]').within(() => {
          cy.getBy(`[data-cy="actions-dropdown"]`).click();
        });
        cy.getBy('[data-cy="imports"]').click();
        cy.getByDataCy('status').should('contain', 'Completed');
        cy.getByDataCy('approval-status').should('be.visible');
      }
    });
  });

  it('can sign all collections', function () {
    cy.checkBuildType().then((buildType) => {
      if (buildType === SAAS_URL || buildType === AZURE_URL || buildType === OCP_A_URL) {
        this.skip();
      } else {
        cy.navigateTo('hub', 'namespaces');
        cy.verifyPageTitle('Namespaces');
        cy.setTableView('table');
        cy.filterTableBySingleText(namespace.name, true);
        cy.clickTableRow(namespace.name, false);
        cy.getByDataCy('collections-tab').click();
        cy.setTableView('table');
        cy.filterTableBySingleSelect('repository', 'validated');
        cy.get('div[data-cy="manage-view"]').within(() => {
          cy.getBy(`[data-cy="actions-dropdown"]`).click();
        });
        cy.getBy('[data-cy="sign-all-collections"]').click();
        cy.intercept('POST', hubAPI`/_ui/v1/collection_signing/`).as('signAll');
        cy.getByDataCy('modal-sign-button').click();
        cy.wait('@signAll').then((response) => {
          expect(response?.response?.statusCode).to.eql(202);
        });
      }
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
        cy.getTableRowByText(namespace1.name, false).within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.filterTableBySingleText(namespace2.name, true);
        cy.getTableRowByText(namespace2.name, false).within(() => {
          cy.get('input[type=checkbox]').click();
        });
        cy.clickToolbarKebabAction('delete-namespaces');
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete namespaces');
        cy.assertModalSuccess();
      });
    });
  });
});
