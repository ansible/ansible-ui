import { UserTokens } from './UserTokens';

describe('UserTokens', () => {
  it('renders user tokens when user id in URL matches active user', () => {
    cy.mount(<UserTokens />, {
      path: '/users/:id/tokens',
      initialEntries: ['/users/20/tokens'],
    });
    // component is still under development so it renders PageNotImplemented
    cy.contains('Under Development').should('be.visible');
  });

  it('does not render anything when user id in URL does NOT match active user', () => {
    cy.mount(<UserTokens />, {
      path: '/users/:id/tokens',
      initialEntries: ['/users/1/tokens'],
    });
    // in this test the output is actually empty so any text would do here
    cy.contains('Under Development').should('not.exist');
  });
});
