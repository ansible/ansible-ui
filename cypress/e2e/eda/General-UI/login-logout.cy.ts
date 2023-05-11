//Tests a user's ability to log into and out of the EDA UI.
//Note that EDA Actions do not have any CRUD functionality.
import { randomString } from '../../../../framework/utils/random-string';

describe('EDA Login / Logoff', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can log into the UI and view username in the top right of the Dashboard toolbar', () => {
    cy.getEdaActiveUser().then((edaUser) => {
      if (Cypress.env('TEST_STANDALONE') === true) {
        cy.intercept('GET', '/api/logout/').as('loggedOut');
        cy.edaLogout();
        cy.wait('@loggedOut').then((result) => {
          expect(result?.response?.statusCode).to.eql(200);
        });
      } else {
        cy.intercept('POST', '/api/eda/v1/auth/session/logout/').as('loggedOut');
        cy.edaLogout();
        cy.wait('@loggedOut').then((result) => {
          expect(result?.response?.statusCode).to.eql(204);
        });
      }
      if (edaUser && Cypress.env('TEST_STANDALONE') === true) {
        cy.typeInputByLabel(/^Username$/, edaUser.username);
        cy.typeInputByLabel(/^Password$/, Cypress.env('EDA_PASSWORD') as string);
        cy.clickModalButton('Log in');
        cy.get('.pf-c-dropdown__toggle').eq(1).should('contain', edaUser.username);
      } else if (edaUser && !Cypress.env('TEST_STANDALONE')) {
        cy.get('#E2E-title').then(() => {
          cy.contains('E2E').click();
        });
        cy.typeInputByLabel(/^Username$/, edaUser.username);
        cy.typeInputByLabel(/^Password$/, Cypress.env('EDA_PASSWORD') as string);
        cy.clickModalButton('Log in');
        cy.get('.pf-c-dropdown__toggle').eq(1).should('contain', edaUser.username);
      }
    });
  });

  it.skip('can log out and login as a different user', () => {
    // TODO: needs further work when Users page is functional
    const userDetails = {
      Username: `E2EUser ${randomString(4)}`,
      FirstName: 'Firstname',
      LastName: 'Lastname',
      Email: 'first.last@redhat.com',
      Password: `${randomString(12)}`,
    };
    cy.navigateTo(/^Users$/);
    cy.contains('h1', 'Users');
    cy.clickButton(/^Create user$/);
    cy.typeInputByLabel(/^Username$/, userDetails.Username);
    cy.typeInputByLabel(/^First name$/, userDetails.FirstName);
    cy.typeInputByLabel(/^Last name$/, userDetails.LastName);
    cy.typeInputByLabel(/^Email$/, userDetails.Email);
    cy.typeInputByLabel(/^Password$/, userDetails.Password);
    cy.typeInputByLabel(/^Password confirmation$/, userDetails.Password);
    /*Roles selection*/
    cy.selectDropdownOptionByLabel(/^User type$/, 'Super user');
    cy.selectDropdownOptionByLabel(/^Roles(s)$/, 'User Experience');
    cy.clickButton(/^Create user$/);
    cy.hasDetail('First name', userDetails.FirstName);
    cy.hasDetail('Last name', userDetails.LastName);
    cy.hasDetail('Email', userDetails.Email);
    cy.hasDetail('Username', userDetails.Username);
    if (Cypress.env('TEST_STANDALONE') === true) {
      cy.intercept('GET', '/api/logout/').as('loggedOut');
      cy.edaLogout();
      cy.wait('@loggedOut').then((result) => {
        expect(result?.response?.statusCode).to.eql(200);
      });
    } else {
      cy.intercept('POST', '/api/eda/v1/auth/session/logout/').as('loggedOut');
      cy.edaLogout();
      cy.wait('@loggedOut').then((result) => {
        expect(result?.response?.statusCode).to.eql(204);
      });
    }
    if (Cypress.env('TEST_STANDALONE') === true) {
      cy.typeInputByLabel(/^Username$/, userDetails.Username);
      cy.typeInputByLabel(/^Password$/, userDetails.Password);
      cy.clickModalButton('Log in');
      cy.get('.pf-c-dropdown__toggle').eq(1).should('contain', userDetails.Username);
    } else {
      cy.get('#E2E-title').then(() => {
        cy.contains('E2E').click();
      });
      cy.typeInputByLabel(/^Username$/, userDetails.Username);
      cy.typeInputByLabel(/^Password$/, userDetails.Password);
      cy.clickModalButton('Log in');
      cy.get('.pf-c-dropdown__toggle').eq(1).should('contain', userDetails.Username);
    }
  });
});
