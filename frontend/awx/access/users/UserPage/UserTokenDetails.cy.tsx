import { UserTokenDetails } from './UserTokenDetails';
import { formatDateString } from '../../../../../framework/utils/formatDateString';

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
  it('renders personal access token when token does not reference application', () => {
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
    cy.get('[data-cy="application-name"]').should('have.text', 'Personal access token');
    cy.get('[data-cy="description"]').should('have.text', 'test token 1');
    cy.get('[data-cy="scope"]').should('have.text', 'write');
    cy.get('[data-cy="expires"]').should(
      'have.text',
      formatDateString('3023-08-31T14:37:26.177400Z')
    );
    cy.get('[data-cy="created"]').should(
      'have.text',
      formatDateString('2024-04-29T14:37:26.186275Z')
    );
    cy.get('[data-cy="last-modified"]').should(
      'have.text',
      formatDateString('2024-04-29T14:37:26.199763Z')
    );
  });

  it('renders application access token when token references an application', () => {
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
    cy.get('[data-cy="application-name"]').should('have.text', 'test app 1');
    cy.get('[data-cy="description"]').should('have.text', 'desc');
    cy.get('[data-cy="scope"]').should('have.text', 'read');
    cy.get('[data-cy="expires"]').should(
      'have.text',
      formatDateString('3023-08-31T18:58:25.191054Z')
    );
    cy.get('[data-cy="created"]').should(
      'have.text',
      formatDateString('2024-04-29T18:58:25.203965Z')
    );
    cy.get('[data-cy="last-modified"]').should(
      'have.text',
      formatDateString('2024-04-29T18:58:25.223488Z')
    );
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
