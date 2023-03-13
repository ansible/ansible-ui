//Tests a user's ability to perform necessary actions on the Projects list in the EDA UI.

describe('EDA Projects List', () => {
  before(() => {
    cy.edaLogin();
  });

  it('EDA projects page', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.hasTitle(/^Projects$/);
  });

  it.skip('can filter the Projects list based on specific criteria', () => {
    //change test stub name to stipulate what the specific criteria is
  });

  it.skip('can perform a basic search on the Projects list', () => {
    //use mock data to test search
  });

  it.skip('can perform an advanced search on the Projects list', () => {
    //use mock data to test search
  });

  it.skip('can bulk delete Projects from the Projects list', () => {
    //write test here
  });

  it.skip('can verify the functionality of items in the kebab menu on the Projects list view', () => {
    //write test here
  });
});
