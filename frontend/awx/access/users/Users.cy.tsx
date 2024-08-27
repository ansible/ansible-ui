import { AwxUser } from '../../interfaces/User';
import * as useOptions from '../../../common/crud/useOptions';
import { Users } from './Users';

describe('Users.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/users/*',
        hostname: 'localhost',
      },
      {
        fixture: 'users.json',
      }
    ).as('getUsers');
    cy.intercept(
      {
        method: 'OPTIONS',
        url: '/api/v2/users/',
      },
      {
        fixture: 'mock_options.json',
      }
    ).as('getOptions');
  });

  it('renders users list', () => {
    cy.mount(<Users />);
    cy.verifyPageTitle('Users');
    cy.get('table').find('tr').should('have.length', 10);
  });

  it('Create User button is disabled if the user does not have permission to create users', () => {
    cy.intercept({ method: 'GET', url: '/api/v2/users/*' }, { fixture: 'users.json' });
    cy.mount(<Users />);
    cy.contains('a', /^Create user$/).should('have.attr', 'aria-disabled', 'true');
  });

  it('create User button is enabled if user has permissions', () => {
    cy.stub(useOptions, 'useOptions').callsFake(() => ({
      data: {
        actions: {
          POST: {
            name: {
              required: true,
              label: 'Name',
              max_length: 512,
              help_text: 'Name of this user.',
              filterable: true,
            },
          },
        },
      },
    }));
    cy.intercept({ method: 'GET', url: '/api/v2/users/*' }, { fixture: 'users.json' });
    cy.mount(<Users />);
    cy.contains('a', /^Create user$/).should('have.attr', 'aria-disabled', 'false');
  });

  it('deletes user from toolbar menu is enabled if user has permissions', () => {
    cy.mount(<Users />);
    cy.fixture('users.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: AwxUser[]) => {
        const user = results[0];
        cy.selectTableRow(user.username, false);
        cy.clickToolbarKebabAction('delete-users');
        cy.contains('Permanently delete users').should('be.visible');
      });
  });
});
