import { UserTokenPage } from './UserTokenPage';

describe('UserTokenPage', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/tokens/*',
        hostname: 'localhost',
      },
      {
        fixture: 'userToken-pat.json',
      }
    );
  });
  it('Renders page with label, breadcrumbs and delete button on top', () => {
    cy.mount(<UserTokenPage />, {
      path: '/users/:id/tokens/:tokenid/details',
      initialEntries: ['/users/3/tokens/8/details'],
    });
    cy.get('[data-cy="page-title"]').contains('Token');
    cy.get('nav[aria-label="Breadcrumb"]').within(() => {
      cy.contains('Tokens');
      cy.contains('Personal access token');
      cy.contains('Details');
    });
    cy.get('[data-cy="manage-view"]').get('[data-cy="delete-token"]').contains('Delete token');
  });
});
