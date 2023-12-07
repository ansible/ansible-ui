import { AwxUserDetails } from './AwxUserDetails';
import mockAwxUser from '../../../../../cypress/fixtures/awxUser.json';
import { formatDateString } from '../../../../../framework/utils/formatDateString';

describe('User details', () => {
  it('Renders first & last name, username, email, orgs, last login, auth type, created & modified timestamps', () => {
    cy.intercept('/api/v2/users/*', { fixture: 'awxUser.json' });
    cy.intercept('/api/v2/users/*/organizations/', { fixture: 'organizations.json' });
    cy.mount(<AwxUserDetails />);
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
