import { CreateUserToken } from './UserTokenForm';

describe('CreateUserToken', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/applications/*',
        hostname: 'localhost',
      },
      {
        fixture: 'applications.json',
      }
    );
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
  });

  it('renders form for creating user token', () => {
    const onCreateFn = cy.spy();
    cy.mount(<CreateUserToken onSuccessfulCreate={onCreateFn} />, {
      path: '/users/:id/tokens/create',
      initialEntries: ['/users/20/tokens/create'],
    });
    cy.contains('Create Token');
    cy.get('[data-cy="application-form-group"]').within(() => {
      cy.contains('Application');
      cy.contains('Select application');
    });
    cy.get('[data-cy="description-form-group"]').within(() => {
      cy.contains('Description');
      // for some reason cypress can't find the placeholder directly so checking the attribute
      cy.get('[data-cy="description"]')
        .should('have.attr', 'placeholder')
        .and('equal', 'Enter token description');
    });
    cy.get('[data-cy="scope-form-group"]').within(() => {
      cy.contains('Scope');
      cy.contains('Select a scope');
    });
  });
});
