//Tests a user's ability to perform certain actions on the Rule Audits list in the EDA UI.
// import { JobTemplate } from '../../../../frontend/awx/interfaces/generated-from-swagger/api';

describe('EDA Rule Audits List', () => {
  // let edaAwxJobTemplate: JobTemplate;
  before(() => {
    // cy.createEdaSpecificAwxJobTemplate().then((jobTemplate) => {
    //   edaAwxJobTemplate = jobTemplate;
    // });
    cy.edaLogin();
  });

  it.skip('can render the Rule Audits list view', () => {
    cy.navigateTo(/^Users$/);
  });

  it.skip('a rulebook activation run results in a record showing on the rule audit list', () => {
    //change test stub name to stipulate what the specific criteria is
  });
});
