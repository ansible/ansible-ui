// //Tests a user's ability to perform certain actions on the Rule Audits list in the EDA UI.

import { EdaDecisionEnvironment } from '../../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../../../frontend/eda/interfaces/EdaRulebookActivation';

describe.skip('EDA rulebook activations- Edit, Delete', () => {
  let edaProject: EdaProject;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  let edaRBA: EdaRulebookActivation;
  let edaRuleBook: EdaRulebook;

  before(() => {
    cy.edaLogin();
    cy.ensureEdaCurrentUserAwxToken();

    cy.createAwxOrganizationProjectInventoryJobTemplate({
      project: { scm_url: 'https://github.com/ansible/ansible-ui' },
      jobTemplate: { name: 'run_basic', playbook: 'playbooks/basic.yml' },
    });

    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.getEdaRulebooks(edaProject, 'basic_short.yml').then((edaRuleBooks) => {
        edaRuleBook = edaRuleBooks[0];
        cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
          edaDecisionEnvironment = decisionEnvironment;
          cy.createEdaRulebookActivation({
            rulebook_id: edaRuleBook.id,
            decision_environment_id: decisionEnvironment.id,
            project_id: edaProject.id,
          }).then((edaRulebookActivation) => {
            edaRBA = edaRulebookActivation;
          });
        });
      });
    });
  });

  after(() => {
    cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
    cy.deleteEdaProject(edaProject);
    cy.deleteEdaRulebookActivation(edaRBA);
    cy.deleteAllEdaCurrentUserTokens();
  });

  it('can access rule audit data for a successful rulebook activation', () => {
    cy.get('[data-cy="eda-rule-audits"]').eq(1).click();
    // cy.navigateTo('eda', 'rule-audits');
    cy.contains('td[data-label="Rulebook activation"]', edaRBA.name).within(() => {
      cy.get('a').click();
    });
    cy.contains('h1', edaRBA.name);
    cy.navigateTo('eda', 'rule-audit');
    cy.contains('tr', edaRBA.name).within(() => {
      cy.get('a').eq(0).click();
    });
    cy.get('h1').should('contain', 'Run JT at 8');
    cy.get('#rulebook-activation').should('contain', edaRBA.name);
    cy.clickButton('Events');
    cy.get('td[data-label="Name"]').find('a').click();
    cy.get('[data-ouia-component-type="PF4/ModalContent"]').within(() => {
      cy.get('h1').should('contain', 'Event details');
      cy.clickButton('Close');
    });
    cy.clickButton('Actions');
    cy.contains('tr', 'run_job_template').within(() => {
      cy.get('td[data-label="Name"]').get('a').click();
    });
    cy.url().should('contain', '/details');
  });
});
