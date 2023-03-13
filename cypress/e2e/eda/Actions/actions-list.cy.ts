//Tests a user's ability to perform certain actions on the Actions list in the EDA UI.
//Note that EDA Actions do not have any CRUD functionality.

describe('EDA Actions', () => {
  before(() => {
    cy.edaLogin();
  });

  it.skip('can filter the Actions list based on specific criteria', () => {
    //change test stub name to stipulate what the specific criteria is
  });

  it.skip('can perform a basic search on the Actions list', () => {
    //need to use mock data to test the search feature
  });

  it.skip('can perform an advanced search on the Actions list', () => {
    //need to use mock data to test the search feature
  });
});
