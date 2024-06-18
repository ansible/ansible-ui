import { gatewayV1API } from '../../../../cypress/support/formatApiPathForPlatform';
import { PlatformUserDetails } from './PlatformUserDetails';
import { formatDateString } from '../../../../framework/utils/formatDateString';

const mockUser = {
  id: 1,
  url: gatewayV1API`/users/1/`,
  created_on: '2023-11-01T20:04:54.789802Z',
  created_by: 'admin',
  modified_on: '2023-11-01T20:04:54.789827Z',
  modified_by: 'admin',
  related: {},
  summary_fields: {},
  username: 'new-user',
  email: 'new-user@sample.com',
  first_name: 'New',
  last_name: 'User',
  last_login: '2023-11-01T20:08:07.211714Z',
  password: '$encrypted$',
  is_superuser: false,
  is_platform_auditor: true,
};

describe('Platform user details', () => {
  it('Renders first & last name, username, email, last login, created & modified timestamps', () => {
    cy.intercept(gatewayV1API`/users/1/`, mockUser);
    cy.intercept(gatewayV1API`/users/1/organizations/`, { fixture: 'platformOrganizations.json' });
    cy.intercept(gatewayV1API`/users/1/authenticators/`, {
      fixture: 'platformUserAuthenticators.json',
    });

    cy.mount(<PlatformUserDetails />);
    cy.get('[data-cy="first-name"]').should('have.text', 'New');
    cy.get('[data-cy="last-name"]').should('have.text', 'User');
    cy.get('[data-cy="email"]').should('have.text', 'new-user@sample.com');
    cy.get('[data-cy="username"]').should('have.text', 'new-user');
    cy.get('[data-cy="last-login"]').should('have.text', formatDateString(mockUser.last_login));
    cy.get('[data-cy="created"]').should('have.text', formatDateString(mockUser.created_on));
    cy.get('[data-cy="modified"]').should('have.text', formatDateString(mockUser.modified_on));
    cy.get('[data-cy="organization"]')
      .should('contain', 'Demo')
      .and('contain', 'Default')
      .and('contain', 'Test Org');
    cy.get('[data-cy="authentication-method"]').should('contain', 'Local');
    cy.get('[data-cy="user-type"]').should('contain', 'Platform auditor');
  });
});
