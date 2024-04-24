import { UserTokens } from './UserTokens';

describe('UserTokens', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/users/*/tokens/*',
        hostname: 'localhost',
      },
      {
        fixture: 'userTokens.json',
      }
    );
    cy.intercept(
      {
        method: 'OPTIONS',
        url: '/api/v2/users/*/tokens/',
      },
      {
        fixture: 'userTokens_options.json',
      }
    );
  });

  it('renders user tokens when user id in URL matches active user', () => {
    cy.mount(<UserTokens />, {
      path: '/users/:id/tokens',
      initialEntries: ['/users/20/tokens'],
    });
    //
    cy.get('div.pf-v5-c-alert').within(() => {
      cy.contains('Automation Execution tokens');
    });
    cy.get('div.pf-v5-c-toolbar').within(() => {
      cy.contains('Create token').should('be.visible');
      cy.contains('Sort').should('be.visible');
    });
    cy.get('table.page-table').within(() => {
      cy.contains('Application name').should('be.visible');
      cy.contains('Description').should('be.visible');
      cy.contains('Scope').should('be.visible');
      cy.contains('Expires').should('be.visible');
      cy.get('tbody>tr').should('have.length', 8);
    });
  });

  it('does not render anything when user id in URL does NOT match active user', () => {
    cy.mount(<UserTokens />, {
      path: '/users/:id/tokens',
      initialEntries: ['/users/1/tokens'],
    });
    // in this test the output is actually empty so any text would do here
    cy.contains('Automation Execution tokens').should('not.exist');
  });
});
