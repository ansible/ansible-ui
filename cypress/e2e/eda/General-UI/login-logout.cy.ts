//Tests a user's ability to log into and out of the EDA UI.
//Note that EDA Actions do not have any CRUD functionality.

describe('EDA Login / Logoff', () => {
  before(() => {
    cy.edaLogin();
  });

  it.only('can log into the UI and view username in the top right of the Dashboard toolbar', () => {
    cy.uiLogout();
  });

  it.skip('can log out and login as a different user', () => {
    //need to use mock data to test the search feature
  });
});
