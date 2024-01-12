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
    const userDetails = {
      Username: `E2EUser${randomString(4)}`,
      FirstName: 'Firstname',
      LastName: 'Lastname',
      roles: [
        {
          id: '5399bd06-a228-4d99-b61d-ab857837ff4b',
          name: 'Admin',
        },
      ],
      Email: 'first.last@redhat.com',
      Password: `${randomString(12)}`,
    };
    cy.navigateTo('eda', 'users');
    cy.contains('h1', 'Users');
    cy.clickButton(/^Create user$/);
    cy.get('[data-cy="username"]').type(userDetails.Username);
    cy.get('[data-cy="first-name"]').type(userDetails.FirstName);
    cy.get('[data-cy="last-name"]').type(userDetails.LastName);
    cy.get('[data-cy="email"]').type(userDetails.Email);
    cy.get('[data-cy="password"]').type(userDetails.Password);
    cy.get('[data-cy="confirmpassword"]').type(userDetails.Password);
    /*Roles selection*/
    cy.selectEdaUserRoleByName('Contributor');
    cy.clickButton(/^Create user$/);
    cy.hasDetail('First name', userDetails.FirstName);
    cy.hasDetail('Last name', userDetails.LastName);
    cy.hasDetail('Email', userDetails.Email);
    cy.hasDetail('Username', userDetails.Username);
    cy.intercept('POST', edaAPI`/auth/session/logout/`).as('login');
    cy.edaLogout();
    cy.wait('@login');
    cy.get('[data-cy="username"]').type(userDetails.Username);
    cy.get('[data-cy="password"]').type(userDetails.Password);
    cy.clickButton('Log in');
    cy.get('.pf-v5-c-dropdown__toggle').eq(1).should('contain', userDetails.Username);
  });
});
