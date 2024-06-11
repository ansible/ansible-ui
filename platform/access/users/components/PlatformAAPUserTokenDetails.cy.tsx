import { PlatformAAPUserTokenDetails } from './PlatformAAPUserTokenDetails';
import { formatDateString } from '../../../../framework/utils/formatDateString';

describe('PlatformAAPUserTokenDetails', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/gateway/users/*',
        hostname: 'localhost',
      },
      {
        fixture: 'activeUser.json',
      }
    );
  });

  it('renders personal access token properly', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/gateway/tokens/*',
        hostname: 'localhost',
      },
      {
        fixture: 'userToken-pat.json',
      }
    );
    cy.mount(<PlatformAAPUserTokenDetails />, {
      path: '/users/:id/tokens/platform/:tokenid/details',
      initialEntries: ['/users/20/tokens/platform/8/details'],
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
    cy.get('[data-cy="modified"]').should(
      'have.text',
      formatDateString('2024-04-29T14:37:26.199763Z')
    );
  });

  it('renders application access token properly', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/gateway/tokens/*',
        hostname: 'localhost',
      },
      {
        fixture: 'userToken-app.json',
      }
    );
    cy.mount(<PlatformAAPUserTokenDetails />, {
      path: '/users/:id/tokens/platform/:tokenid/details',
      initialEntries: ['/users/20/tokens/platform/8/details'],
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
    cy.get('[data-cy="modified"]').should(
      'have.text',
      formatDateString('2024-04-29T18:58:25.223488Z')
    );
  });

  it('renders error page when requesting non existing user', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/gateway/users/*',
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
        url: '/api/gateway/tokens/*',
        hostname: 'localhost',
      },
      {
        fixture: 'userToken-app.json',
      }
    );
    cy.mount(<PlatformAAPUserTokenDetails />, {
      path: '/users/:id/tokens/platform/:tokenid/details',
      initialEntries: ['/users/4096/tokens/platform/8/details'],
    });
    cy.contains('Not Found');
  });

  it('renders error page when requesting non existing token', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/gateway/tokens/*',
        hostname: 'localhost',
      },
      {
        statusCode: 404,
        body: '',
      }
    );
    cy.mount(<PlatformAAPUserTokenDetails />, {
      path: '/users/:id/tokens/platform/:tokenid/details',
      initialEntries: ['/users/1/tokens/platform/111/details'],
    });
    cy.contains('Not Found');
  });
});
