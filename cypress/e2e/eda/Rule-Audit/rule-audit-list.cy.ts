//Tests a user's ability to perform certain actions on the Rule Audits list in the EDA UI.

describe('EDA Rule Audits List', () => {
  before(() => {
    cy.edaLogin();
  });

  it.skip('can render the Rule Audits list view', () => {
    cy.navigateTo(/^Rule Audit$/);
    cy.hasTitle(/^Rule Audit$/)
      .next('p')
      .should(
        'have.text',
        'Rule audit allows auditing of rules which have been triggered by incoming events.'
      );
  });

  it.skip('a rulebook activation run results in a record showing on the rule audit list', () => {
    //write test here
  });
});
