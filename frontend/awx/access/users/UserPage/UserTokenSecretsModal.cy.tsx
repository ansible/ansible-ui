import { Token } from '../../../interfaces/Token';
import { UserTokenSecretsModal } from './UserTokenSecretsModal';
import { formatDateString } from '../../../../../framework/utils/formatDateString';

describe('UserTokenSecretsModal', () => {
  const appTokenToken = '1234-abcdef-6789';
  const appTokenRefreshToken = 'abcd-000000-1234';
  const patTokenToken = 'xyz-abc-0123456';
  let appToken: Token;
  let patToken: Token;

  before(() => {
    // load token data from fixture and add the token and refresh token values
    cy.fixture('userToken-app.json').then((token: Token) => {
      appToken = token;
      appToken.token = appTokenToken;
      appToken.refresh_token = appTokenRefreshToken;
    });
    cy.fixture('userToken-pat.json').then((token: Token) => {
      patToken = token;
      patToken.token = patTokenToken;
    });
  });

  it('Renders modal with token and expires fields for personal access token', () => {
    cy.mount(<UserTokenSecretsModal newToken={patToken} onClose={() => {}} />);
    cy.contains('Token information');
    cy.contains('This is the only time the token will be shown.');
    cy.get('dl.pf-v5-c-description-list').within(() => {
      cy.contains('Token');
      cy.contains('Expires');
      cy.get('[data-cy="token"]').within(() => {
        cy.get('input').should('have.value', patTokenToken);
      });
      cy.get('[data-cy="expires"]').should('have.text', formatDateString(patToken.expires));
    });
  });

  it('Renders modal with token, refresh token and expires fields for application token', () => {
    cy.mount(<UserTokenSecretsModal newToken={appToken} onClose={() => {}} />);
    cy.contains('Token information');
    cy.contains('This is the only time the token will be shown.');
    cy.get('dl.pf-v5-c-description-list').within(() => {
      cy.contains('Token');
      cy.contains('Refresh Token');
      cy.contains('Expires');
      cy.get('[data-cy="token"]').within(() => {
        cy.get('input').should('have.value', appTokenToken);
      });
      cy.get('[data-cy="refresh-token"]').within(() => {
        cy.get('input').should('have.value', appTokenRefreshToken);
      });
      cy.get('[data-cy="expires"]').should('have.text', formatDateString(appToken.expires));
    });
  });

  it('Closing modal calls provided callback', () => {
    const fn = cy.stub().as('onClose');
    cy.mount(
      <UserTokenSecretsModal
        newToken={appToken}
        onClose={() => {
          fn();
        }}
      />
    );
    cy.get('button[aria-label="Close"]').click();
    cy.get('@onClose').should('have.been.called');
  });
});
