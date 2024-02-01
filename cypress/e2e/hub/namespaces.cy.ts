import { randomString } from '../../../framework/utils/random-string';
import { Namespaces } from './constants';

const apiPrefix = Cypress.env('HUB_API_PREFIX') as string;

describe('Namespaces', () => {
  before(() => {
    cy.hubLogin();
  });

  it('it should render the namespaces page', () => {
    cy.navigateTo('hub', Namespaces.url);
    cy.verifyPageTitle(Namespaces.title);
  });

  it('create, search and delete a namespace', () => {
    cy.navigateTo('hub', Namespaces.url);
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.get('h1').should('contain', Namespaces.title);
    cy.get('[data-cy="add-namespace"]').should('be.visible').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.get('[data-cy="name"]').type(namespaceName);
    cy.get('[data-cy="company"]').type('test company');
    cy.get('[data-cy="Submit"]').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.selectDetailsPageKebabAction('delete-namespace');
    cy.url().should('include', Namespaces.url);
    cy.url().should('not.include', `/namespaces/${namespaceName}/details`);
  });

  it('should show the correct URL when clicking on the CLI configuration tab', () => {
    cy.navigateTo('hub', Namespaces.url);
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.get('[data-cy="add-namespace"]').should('be.visible').click();
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
    cy.get('[data-cy="add-namespace"]').should('be.visible').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.get('[data-cy="name"]').type(namespaceName);
    cy.get('[data-cy="description"]').type('test description');
    cy.get('[data-cy="company"]').type('test company');
    cy.get('[data-cy="Submit"]').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.get('[data-cy="namespace-details-tab"]').should('contain', 'Details');
    cy.get('[data-cy="namespace-details-tab"]').click();
    //check name, company, description
    cy.get('[data-cy="name"]').should('contain', namespaceName);
    cy.get('[data-cy="description"]').should('contain', 'test description');
    cy.get('[data-cy="company"]').should('contain', 'test company');
    // Delete namespace
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="delete-namespace"]').click();
    cy.get('#confirm').click();
    cy.clickButton(/^Delete namespaces$/);
  });

  it('should show collections tab', () => {
    cy.navigateTo('hub', Namespaces.url);
    const namespaceName = `test_namespace_${randomString(5, undefined, { isLowercase: true })}`;
    cy.get('[data-cy="add-namespace"]').should('be.visible').click();
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
    cy.get('[data-cy="add-namespace"]').should('be.visible').click();
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
    cy.searchAndDisplayResource(nameSpaceName);
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
});
