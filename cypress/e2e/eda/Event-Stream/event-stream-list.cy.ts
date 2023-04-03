//Tests a user's ability to perform certain actions on the Event Stream list in the EDA UI.
//This screen may not make it into the release

describe('EDA Event Stream List', () => {
  before(() => {
    cy.edaLogin();
  });

  it.skip('can filter the Event Stream list based on specific criteria', () => {
    //change test stub name to stipulate what the specific criteria is
  });

  it.skip('can perform a basic search on the Event Stream list', () => {
    //need to use mock data to test the search feature
  });

  it.skip('can perform an advanced search on the Event Stream list', () => {
    //need to use mock data to test the search feature
  });
});
