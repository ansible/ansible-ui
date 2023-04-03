//Tests a user's ability to perform certain actions on the Dashboard of the EDA UI.
//Implementation of Visual Tests makes sense here at some point

describe('EDA Dashboard', () => {
  before(() => {
    cy.edaLogin();
  });

  it.skip('shows the user a Project card with a list of Projects visible including working links', () => {
    //change test stub name to stipulate what the specific criteria is
  });

  it.skip('shows the user an Execution Environment card with a list of EEs visible including working links', () => {
    //change test stub name to stipulate what the specific criteria is
  });

  it.skip('shows the user a Rulebook Activation card with a list of Rulebook Activations visible including working links', () => {
    //change test stub name to stipulate what the specific criteria is
  });

  it.skip('shows the user an Inventories card with a list of Inventories visible including working links', () => {
    //change test stub name to stipulate what the specific criteria is
  });

  it.skip('shows the user a Recent Actions card with a list of Recent Actions visible including working links', () => {
    //change test stub name to stipulate what the specific criteria is
  });
});
