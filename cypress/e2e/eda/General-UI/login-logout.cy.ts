//Tests a user's ability to log into and out of the EDA UI.
//Note that EDA Actions do not have any CRUD functionality.
import { randomString } from '../../../../framework/utils/random-string';

describe('EDA Login / Logoff', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can log into the UI and view username in the top right of the Dashboard toolbar', () => {
    cy.getEdaActiveUser().then((edaUser) => {
      cy.intercept('POST', '/api/eda/v1/auth/session/logout/').as('loggedOut');
      cy.edaLogout();
      cy.wait('@loggedOut').then((result) => {
        expect(result?.response?.statusCode).to.eql(204);
      });
      if (edaUser) {
        cy.get('[data-cy="username"]').eq(1).type(edaUser.username);
        cy.get('[data-cy="password"]')
          .eq(1)
          .type(Cypress.env('EDA_PASSWORD') as string);
        cy.clickModalButton('Log in');
        cy.get('.pf-c-dropdown__toggle').eq(1).should('contain', edaUser.username);
      }
    });
  });

  it('can log out and login as a different user', () => {
    const userDetails = {
      Username: `E2EUser${randomString(4)}`,
      FirstName: 'Firstname',
      LastName: 'Lastname',
      Email: 'first.last@redhat.com',
      Password: `${randomString(12)}`,
    };
    cy.navigateTo('eda', 'users');
    cy.contains('h1', 'Users');
    cy.clickButton(/^Create user$/);
    cy.get('[data-cy="username"]').eq(1).type(userDetails.Username);
    cy.get('[data-cy="first_name"]').eq(1).type(userDetails.FirstName);
    cy.get('[data-cy="last_name"]').eq(1).type(userDetails.LastName);
    cy.get('[data-cy="email"]').eq(1).type(userDetails.Email);
    cy.get('[data-cy="password"]').eq(1).type(userDetails.Password);
    cy.get('[data-cy="confirmPassword"]').eq(1).type(userDetails.Password);
    /*Roles selection*/
    cy.get('#roles-form-group').within(() => {
      cy.get('button').click();
    });
    cy.get('[data-ouia-component-type="PF4/ModalContent"]').within(() => {
      cy.get('table').find('input').eq(1).click();
      cy.clickButton(/^Confirm$/);
    });
    cy.clickButton(/^Create user$/);
    cy.hasDetail('First name', userDetails.FirstName);
    cy.hasDetail('Last name', userDetails.LastName);
    cy.hasDetail('Email', userDetails.Email);
    cy.hasDetail('Username', userDetails.Username);
    cy.intercept('GET', '/api/logout/').as('loggedOut');
    cy.edaLogout();
    cy.get('[data-cy="username"]').eq(1).type(userDetails.Username);
    cy.get('[data-cy="password"]').eq(1).type(userDetails.Password);
    cy.clickModalButton('Log in');
    cy.get('.pf-c-dropdown__toggle').eq(1).should('contain', userDetails.Username);
  });
});
