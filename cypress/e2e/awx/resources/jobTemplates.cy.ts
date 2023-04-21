describe('Job templates Form', () => {
  before(() => {
    cy.awxLogin();
  });

  it('can render the templates list page', () => {
    cy.navigateTo(/^Templates$/);
    cy.hasTitle(/^Templates$/);
  });

  it('Should throw create job template form validation error and not navigate to details view', () => {
    cy.navigateTo(/^Templates$/);
    cy.contains(/^Create template$/).click();
    cy.contains(/^Create job template$/).click();

    cy.clickButton(/^Create job template$/);

    cy.hasTitle(/^Create job template$/);
  });
});
