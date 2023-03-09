/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe('EDA projects', () => {
  before(() => {
    cy.edaLogin();
  });

  it('EDA projects page', () => {
    cy.navigateTo(/^Projects$/, false);
    cy.hasTitle(/^Projects$/);
  });
});
