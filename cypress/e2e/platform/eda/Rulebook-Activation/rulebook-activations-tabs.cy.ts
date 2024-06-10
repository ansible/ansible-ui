import { EdaDecisionEnvironment } from '../../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { IAwxResources } from '../../../../support/awx-commands';
import { LogLevelEnum } from '../../../../../frontend/eda/interfaces/generated/eda-api';
import { tag } from '../../../../support/tag';

tag(['aaas-unsupported'], () => {
  describe('EDA rulebook activations- Create, Edit, Delete', () => {
    let awxResources: IAwxResources;
    let edaProject: EdaProject;
    let edaDecisionEnvironment: EdaDecisionEnvironment;
    let edaRBA: EdaRulebookActivation;
    let edaRuleBook: EdaRulebook;

    before(() => {
      cy.platformLogin();
      cy.ensureEdaCurrentUserAwxToken();

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
      cy.deleteAwxResources(awxResources);
      cy.deleteEdaRulebookActivation(edaRBA);
      cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
      cy.deleteEdaProject(edaProject);
      cy.deleteAllEdaCurrentUserTokens();
    });

    it('renders the instances that are related to the rulebook activation', () => {
      cy.navigateTo('eda', 'rulebook-activations');
      cy.clickTableRow(edaRBA.name);
      cy.contains('h1', edaRBA.name).should('be.visible');
      cy.contains('li', 'History').click();
      cy.contains('td[data-label="Name"]', `${edaRBA.name}`).within(() => {
        cy.get('a').click();
      });
      cy.contains('h1', edaRBA.name);
    });
  });
});
