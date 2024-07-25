import { randomString } from '../../../framework/utils/random-string';
import { MyImports, Namespaces } from './constants';

const apiPrefix = Cypress.env('HUB_API_PREFIX') as string;

describe('Namespaces', () => {
  const testSignature: string = randomString(5, undefined, { isLowercase: true });
  function generateNamespaceName(): string {
    return `test_${testSignature}_namespace_${randomString(5, undefined, { isLowercase: true })}`;
  }

  it('create, search and delete a namespace', () => {
    cy.navigateTo('hub', Namespaces.url);
    cy.verifyPageTitle(Namespaces.title);
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.get('[data-cy="create-namespace"]').should('be.visible').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.get('[data-cy="name"]').type(namespaceName);
    cy.get('[data-cy="company"]').type('test company');
    cy.get('[data-cy="link-text-0"]').type('test link');
    cy.get('[data-cy="link-url-0"]').type('https://test.com');
    cy.get('[data-cy="Submit"]').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.selectDetailsPageKebabAction('delete-namespace');
    cy.url().should('include', Namespaces.url);
    cy.url().should('not.include', `/namespaces/${namespaceName}/details`);
  });

  it('should show the correct URL when clicking on the CLI configuration tab', () => {
    cy.navigateTo('hub', Namespaces.url);
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.get('[data-cy="create-namespace"]').should('be.visible').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.get('[data-cy="name"]').type(namespaceName);
    cy.get('[data-cy="company"]').type('test company');
    cy.get('[data-cy="Submit"]').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.get('[data-cy="namespace-cli-tab"]').should('contain', 'CLI Configuration');
    cy.get('[data-cy="namespace-cli-tab"]').click();
    cy.get('[class="pf-v5-c-truncate__start"]').should('contain', apiPrefix);
    // Delete namespace
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="delete-namespace"]').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Delete namespaces$/);
  });

  it('should show namespace details tab', () => {
    cy.navigateTo('hub', Namespaces.url);
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.get('[data-cy="create-namespace"]').should('be.visible').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.get('[data-cy="name"]').type(namespaceName);
    cy.get('[data-cy="description"]').type('test description');
    cy.get('[data-cy="company"]').type('test company');
    cy.get('[data-cy="link-text-0"]').type('test link');
    cy.get('[data-cy="link-url-0"]').type('https://test.com');

    cy.get('[data-cy="Submit"]').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.get('[data-cy="namespace-details-tab"]').should('contain', 'Details');
    cy.get('[data-cy="namespace-details-tab"]').click();
    //check name, company, description
    cy.get('[data-cy="name"]').should('contain', namespaceName);
    cy.get('[data-cy="description"]').should('contain', 'test description');
    cy.get('[data-cy="company"]').should('contain', 'test company');
    cy.get('[data-cy="key-value-list-title"]').should('contain', 'Useful links');
    cy.get('[data-cy="item-key-0"]').should('contain', 'test link');
    const linkUrl = 'https://test.com';
    cy.get(`[data-cy="item-value-${linkUrl}"]`).should('contain', linkUrl);
    // Delete namespace
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="delete-namespace"]').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Delete namespaces$/);
  });

  it('should show collections tab', () => {
    cy.navigateTo('hub', Namespaces.url);
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.get('[data-cy="create-namespace"]').should('be.visible').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.get('[data-cy="name"]').type(namespaceName);
    cy.get('[data-cy="description"]').type('test description');
    cy.get('[data-cy="company"]').type('test company');
    cy.get('[data-cy="Submit"]').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.get('[data-cy="collections-tab"]').should('contain', 'Collections');
    cy.get('[data-cy="collections-tab"]').click();
    cy.get('[data-cy="empty-state-title"]').should('contain', 'No collections yet');
    cy.get('[data-cy="upload-collection"]').should('contain', 'Upload collection');

    // Delete the edited namespace
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="delete-namespace"]').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Delete namespaces$/);
  });

  it('edit a namespace', () => {
    cy.navigateTo('hub', Namespaces.url);
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.get('[data-cy="create-namespace"]').should('be.visible').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.get('[data-cy="name"]').type(namespaceName);
    cy.get('[data-cy="company"]').type('test company');
    cy.get('[data-cy="Submit"]').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.get('[data-cy="edit-namespace"]').click();
    cy.get('[data-cy="name"]').should('be.disabled');
    cy.get('[data-cy="company"]').clear().type('new company');
    cy.get('[data-cy="description"]').clear().type('new description');
    cy.get('[data-cy="Submit"]').click();
    cy.get('[data-cy="company"]').contains(/^new company$/);
    cy.get('[data-cy="description"]').contains(/^new description$/);

    // Delete the edited namespace
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="delete-namespace"]').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Delete namespaces$/);
  });

  it('explore different views and pagination', () => {
    const nameSpaceName = `test_pagination_namespace_${randomString(5, undefined, {
      isLowercase: true,
    })}`;
    cy.createNamespace(nameSpaceName);
    cy.navigateTo('hub', Namespaces.url);
    cy.setTablePageSize('50');
    cy.filterTableBySingleText(nameSpaceName);
    cy.get('[data-cy="card-view"]').click();
    cy.contains(nameSpaceName).should('be.visible');
    cy.get('[data-cy="list-view"]').click();
    cy.contains(nameSpaceName).should('be.visible');
    cy.get('[data-cy="table-view"]').click();
    cy.contains(nameSpaceName).should('be.visible');
    cy.get('[href*="/namespaces/test_pagination_namespace_"]').click();

    // Delete the edited namespace
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="delete-namespace"]').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Delete namespaces$/);
  });

  it('user can view import logs', () => {
    const namespaceName = `test_pagination_namespace_${randomString(5, undefined, {
      isLowercase: true,
    })}`;
    cy.createNamespace(namespaceName);
    cy.visit(`${Namespaces.url}/${namespaceName}`);

    cy.clickPageAction('imports');
    cy.url().should('include', MyImports.url);
    cy.url().should('include', namespaceName);
    cy.verifyPageTitle(MyImports.title);
    cy.get('#namespace-selector').contains(namespaceName);

    cy.deleteNamespace(namespaceName);
  });

  it('user can bulk dekete namespaces', () => {
    const numberOfNamespaces = 5;
    for (let i = 0; i < numberOfNamespaces; i++) {
      const namespaceName = generateNamespaceName();
      cy.createNamespace(namespaceName);
    }

    cy.navigateTo('hub', 'namespaces');
    cy.get('[data-cy="table-view"]').click({ force: true });
    cy.filterTableBySingleText(testSignature);
    cy.get('tbody').find('tr').should('have.length', 5);
    cy.get('[data-cy="select-all"]', { timeout: 30000 }).click();
    cy.clickToolbarKebabAction('delete-namespaces');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete namespaces$/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
