/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe('users', () => {
  it('users page', () => {
    cy.navigateTo(/^Users$/, false);
    cy.hasTitle(/^Users$/);
  });
});
