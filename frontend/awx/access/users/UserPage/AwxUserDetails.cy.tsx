import { formatDateString } from '@ansible/ansible-ui-framework/utils/formatDateString';
import mockAwxUser from '@ansible/cypress/fixtures/awxUser.json';
import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import { AwxUserDetails } from './AwxUserDetails';

describe('User details', () => {
  const path = '/users/:id/details';
  const initialEntries = [`/users/${mockAwxUser.id.toString()}/details`];
  const params = {
    path,
    initialEntries,
  };

  it('Renders first & last name, username, email, orgs, last login, auth type, created & modified timestamps', () => {
    cy.intercept(awxAPI`/users/${mockAwxUser.id.toString()}/`, { fixture: 'awxUser.json' });
    cy.intercept(`**/users/${mockAwxUser.id.toString()}/organizations/`, {
      fixture: 'organizations.json',
    });
    cy.mount(<AwxUserDetails />, params);
    cy.get('[data-cy="first-name"]').should('have.text', 'Org');
    cy.get('[data-cy="last-name"]').should('have.text', 'Admin');
    cy.get('[data-cy="email"]').should('have.text', 'firstname@lastname.com');
    cy.get('[data-cy="username"]').should('have.text', 'org-admin');
    cy.get('[data-cy="organization"] a').should('contain', 'Default');
    cy.get('[data-cy="authentication-type"]').should('contain', 'Local');
    cy.get('[data-cy="last-login"]').should('have.text', formatDateString(mockAwxUser.last_login));
    cy.get('[data-cy="created"]').should('have.text', formatDateString(mockAwxUser.created));
    cy.get('[data-cy="last-modified"]').should('have.text', formatDateString(mockAwxUser.modified));
  });
});
