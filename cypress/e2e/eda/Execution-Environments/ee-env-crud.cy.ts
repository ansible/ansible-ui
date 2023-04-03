//Tests a user's ability to create, edit, and delete an Execution Environment in the EDA UI.

describe('EDA Execution Environment- Create, Edit, Delete', () => {
  before(() => {
    cy.edaLogin();
  });

  it.skip('can create an execution environment and assert the information showing on the details page', () => {
    //write test here
  });

  it.skip('can create an execution environment, test the connection, and then delete it', () => {
    //write test here
  });

  it.skip('can create an execution environment, verify edit functionality, and then delete', () => {
    //write test here
  });

  it.skip('can create an execution environment and sync it to Controller', () => {
    //should this test be in this repo, or should it be moved to a private repo?
  });
});
