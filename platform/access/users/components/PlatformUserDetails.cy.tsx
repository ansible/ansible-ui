import { formatDateString } from '../../../../framework/utils/dateTimeHelpers';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { PlatformUserDetails } from './PlatformUserDetails';

const mockUser = {
  id: 8,
  url: gatewayAPI`/users/8/`,
  created_on: '2023-11-01T20:04:54.789802Z',
  created_by: 'admin',
  modified_on: '2023-11-01T20:04:54.789827Z',
  modified_by: 'admin',
  related: {}, // TODO: Update related fields when they become available from the gateway API
  summary_fields: {},
  username: 'new-user',
  email: 'new-user@sample.com',
  first_name: 'New',
  last_name: 'User',
  last_login: '2023-11-01T20:08:07.211714Z',
  password: '$encrypted$',
  is_superuser: false,
  is_system_auditor: true,
};

describe('User details', () => {
  it('Renders first & last name, username, email, last login, created & modified timestamps', () => {
    cy.intercept(gatewayAPI`/users/*`, mockUser);
    cy.mount(<PlatformUserDetails />);
    cy.get('[data-cy="first-name"]').should('have.text', 'New');
    cy.get('[data-cy="last-name"]').should('have.text', 'User');
    cy.get('[data-cy="email"]').should('have.text', 'new-user@sample.com');
    cy.get('[data-cy="username"]').should('have.text', 'new-user');
    cy.get('[data-cy="last-login"]').should('have.text', formatDateString(mockUser.last_login));
    cy.get('[data-cy="created"]').should('have.text', formatDateString(mockUser.created_on));
    cy.get('[data-cy="modified"]').should('have.text', formatDateString(mockUser.modified_on));
  });
});
