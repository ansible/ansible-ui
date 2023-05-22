//Tests a user's ability to perform certain actions on the Rule Audits list in the EDA UI.

import { AwxToken } from '../../../../frontend/awx/interfaces/AwxToken';
import { IAwxResources } from '../../../support/awx-commands';

describe('EDA Rule Audits List', () => {
  let awxToken: AwxToken;
  let awxResources: IAwxResources;

  before(() => {
    cy.createAwxToken().then((token) => {
      awxToken = token;
    });

    cy.createAwxOrganizationProjectInventoryJobTemplate().then(
      (resources) => (awxResources = resources)
    );

    cy.edaLogin();
  });

  after(() => {
    cy.deleteAwxToken(awxToken);
    cy.deleteAwxResources(awxResources);
  });

  it('can render the Rule Audits list view', () => {
    cy.navigateTo(/^Rule Audit$/);
    cy.hasTitle(/^Rule Audit$/)
      .next('p')
      .should(
        'have.text',
        'Rule audit allows auditing of rules which have been triggered by incoming events.'
      );
  });

  // it('a rulebook activation run results in a record showing on the rule audit list', () => {
  //   cy.addEdaCurrentUserAwxToken(awxToken.token).then((activeUserToken) => {
  //     cy.createEdaProject().then((edaProject) => {
  //       cy.getEdaRulebooks(edaProject).then((edaRuleBooks) => {
  //         const edaRulebook = edaRuleBooks[3];
  //         cy.createEdaDecisionEnvironment().then((edaDecisionEnvironment) => {
  //           cy.createEdaRulebookActivation({
  //             rulebook_id: edaRulebook.id,
  //             decision_environment_id: edaDecisionEnvironment.id,
  //           }).then((edaRulebookActivation) => {
  //             cy.navigateTo(/^Rule Audit$/);
  //             // cy.deleteEdaRulebookActivation(edaRulebookActivation);
  //           });
  //           cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
  //         });
  //       });
  //       cy.deleteEdaProject(edaProject);
  //       cy.deleteAllEdaCurrentUserTokens();
  //     });
  //   });
  // });
});
