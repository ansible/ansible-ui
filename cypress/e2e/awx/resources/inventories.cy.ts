/* eslint-disable @typescript-eslint/no-non-null-assertion */

describe('inventories', () => {
  it('inventories page', () => {
    cy.navigateTo(/^Inventories$/, false);
    cy.hasTitle(/^Inventories$/);
  });
});
