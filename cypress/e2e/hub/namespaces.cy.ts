import { randomString } from '../../../framework/utils/random-string';
import { Namespaces } from './constants';

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
    cy.get('[data-cy="create-namespace"]').should('be.visible').click();
    cy.url().should('include', Namespaces.urlCreate);
    cy.get('[data-cy="name"]').type(namespaceName);
    cy.get('[data-cy="company"]').type('test company');
    cy.get('[data-cy="Submit"]').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.selectDetailsPageKebabAction('delete-namespace');
    cy.url().should('include', Namespaces.url);
    cy.url().should('not.include', `/namespaces/${namespaceName}/details`);
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
});
