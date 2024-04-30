import { UserTokenDetails } from './UserTokenDetails';

describe('UserTokenDetails', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/users/*',
        hostname: 'localhost',
      },
      {
        fixture: 'awxUser.json',
      }
    );
  });
  it('renders personal access token when application is not provided in token API response', () => {
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
    cy.mount(<UserTokenDetails />, {
      path: '/users/:id/tokens/:tokenid/details',
      initialEntries: ['/users/3/tokens/8/details'],
    });
    // check name of the application, in this case there is no app hence "Personal access token"
    cy.get('[data-cy="application-name"]').within(() => {
      cy.contains('Personal access token');
    });
    cy.get('[data-cy="description"]').within(() => {
      cy.contains('test token 1');
    });
    cy.get('[data-cy="scope"]').within(() => {
      cy.contains('write');
    });
    cy.get('[data-cy="expires"]').within(() => {
      cy.contains('31/08/3023, 10:37:26');
    });
    cy.get('[data-cy="created"]').within(() => {
      cy.contains('29/04/2024, 10:37:26');
    });
    cy.get('[data-cy="modified"]').within(() => {
      cy.contains('29/04/2024, 10:37:26');
    });
  });

  it('renders application access token when application is provided in token API response', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/tokens/*',
        hostname: 'localhost',
      },
      {
        fixture: 'userToken-app.json',
      }
    );
    cy.mount(<UserTokenDetails />, {
      path: '/users/:id/tokens/:tokenid/details',
      initialEntries: ['/users/3/tokens/30/details'],
    });
    cy.get('[data-cy="application-name"]').within(() => {
      cy.contains('test app 1');
    });
    cy.get('[data-cy="description"]').within(() => {
      cy.contains('desc');
    });
    cy.get('[data-cy="scope"]').within(() => {
      cy.contains('read');
    });
    cy.get('[data-cy="expires"]').within(() => {
      cy.contains('31/08/3023, 14:58:25');
    });
    cy.get('[data-cy="created"]').within(() => {
      cy.contains('29/04/2024, 14:58:25');
    });
    cy.get('[data-cy="modified"]').within(() => {
      cy.contains('29/04/2024, 14:58:25');
    });
  });
  it('renders error page when requesting non existing user', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/users/*',
        hostname: 'localhost',
      },
      {
        statusCode: 404,
        body: '',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/tokens/*',
        hostname: 'localhost',
      },
      {
        fixture: 'userToken-app.json',
      }
    );
    cy.mount(<UserTokenDetails />, {
      path: '/users/:id/tokens/:tokenid/details',
      initialEntries: ['/users/4096/tokens/30/details'],
    });
    cy.contains('Not Found');
  });
  it('renders error page when requesting non existing token', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/tokens/30/',
        hostname: 'localhost',
      },
      {
        fixture: 'userToken-app.json',
      }
    );
    cy.mount(<UserTokenDetails />, {
      path: '/users/:id/tokens/:tokenid/details',
      initialEntries: ['/users/3/tokens/333/details'],
    });
    cy.contains('Not Found');
  });
});
