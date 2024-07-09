// //Tests a user's ability to perform certain actions on the Rule Audits list in the EDA UI.

import { EdaDecisionEnvironment } from '../../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { LogLevelEnum } from '../../../../../frontend/eda/interfaces/generated/eda-api';
import { tag } from '../../../../support/tag';

tag(['aaas-unsupported'], () => {
  describe('EDA rulebook activations- Edit, Delete', () => {
    let edaProject: EdaProject;
    let edaDecisionEnvironment: EdaDecisionEnvironment;
    let edaRBA: EdaRulebookActivation;
    let edaRuleBook: EdaRulebook;

    before(() => {
      cy.createEdaProject().then((project) => {
        edaProject = project;
        cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
          edaRuleBook = edaRuleBooks[0];
          cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
            edaDecisionEnvironment = decisionEnvironment;
            cy.createEdaRulebookActivation({
              rulebook_id: edaRuleBook.id,
              decision_environment_id: decisionEnvironment.id,
              log_level: LogLevelEnum.Error,
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
      cy.navigateTo('eda', 'rule-audits');
      cy.contains('td[data-label="Rulebook activation"]', edaRBA.name, { timeout: 120000 }).within(
        () => {
          cy.get('a').click();
        }
      );
      cy.contains('h1', edaRBA.name);
      cy.navigateTo('eda', 'rule-audits');
      cy.contains('tr', edaRBA.name).within(() => {
        cy.get('a').eq(0).click();
      });
      cy.get('h1').should('contain', 'Say Hello');
      cy.get('#rulebook-activation').should('contain', edaRBA.name);
      cy.contains('a', 'Events').click();
      cy.get('td[data-label="Name"]').find('a').click();
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('h1').should('contain', 'Event details');
        cy.clickButton('Close');
      });
      cy.contains('a', 'Actions').click();
      cy.contains('tr', 'debug');
    });
  });
});
