//Tests a user's ability to log into and out of the EDA UI.
//Note that EDA Actions do not have any CRUD functionality.
import { randomString } from '../../../../framework/utils/random-string';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('EDA Login / Logoff', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can log into the UI and view username in the top right of the Dashboard toolbar', () => {
    cy.getEdaActiveUser().then((edaUser) => {
      cy.intercept('POST', edaAPI`/auth/session/logout/`).as('loggedOut');
      cy.edaLogout();
      cy.wait('@loggedOut').then((result) => {
        expect(result?.response?.statusCode).to.eql(204);
      });
      if (edaUser) {
        cy.get('[data-cy="username"]').type(edaUser.username);
        cy.get('[data-cy="password"]').type(Cypress.env('EDA_PASSWORD') as string);
        cy.clickButton('Log in');
        cy.get('.pf-v5-c-dropdown__toggle').eq(1).should('contain', edaUser.username);
      }
    });
  });

  it('can log out and login as a different user', () => {
    const password = randomString(12);
    cy.createEdaUser({ password }).then((user) => {
      cy.edaLogout();

      cy.edaLogin(user.username, password);
      cy.get('.pf-v5-c-dropdown__toggle').eq(1).should('contain', user.username);
      cy.edaLogout();

      cy.edaLogin();
      cy.deleteEdaUser(user);
    });
  });
});
