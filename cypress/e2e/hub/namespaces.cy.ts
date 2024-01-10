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
    cy.get('[data-cy="company"]').type(Namespaces.company);
    cy.get('[data-cy="Submit"]').click();
    cy.url().should('include', `/namespaces/${namespaceName}/details`);
    cy.selectDetailsPageKebabAction('delete-namespace');
  });
});
