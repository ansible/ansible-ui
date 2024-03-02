//Tests a user's ability to perform certain actions on the rulebook activations list in the EDA UI.
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { LogLevelEnum } from '../../../../frontend/eda/interfaces/generated/eda-api';

describe('EDA rulebook activations- Create, Edit, Delete', () => {
  let edaProject: EdaProject;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  let edaRBA: EdaRulebookActivation;
  let edaRuleBook: EdaRulebook;

  before(() => {
    cy.edaLogin();
    cy.ensureEdaCurrentUserAwxToken();

    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.waitEdaProjectSync(project);
      cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
        edaRuleBook = edaRuleBooks[0];
        cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
          edaDecisionEnvironment = decisionEnvironment;
          cy.createEdaRulebookActivation({
            rulebook_id: edaRuleBook.id,
            decision_environment_id: decisionEnvironment.id,
            log_level: LogLevelEnum.error,
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
    cy.deleteAllEdaCurrentUserTokens();
  });

  it('can filter the rulebook activations list based on Name filter option', () => {
    cy.navigateTo('eda', 'rulebook-activations');
    cy.verifyPageTitle('Rulebook Activations');
    cy.contains('td[data-label="Name"]', edaRBA.name).should('be.visible');
  });

  it('can disable a Rulebook Activation from the line item in list view', () => {
    cy.navigateTo('eda', 'rulebook-activations');
    cy.edaRuleBookActivationCheckbox(edaRBA.name).within(() => {
      cy.get('[data-cy="toggle-switch"]').click();
    });
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to disable these`
      );
      cy.get('a').should('contain', edaRBA.name);
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Disable rulebook activations').click();
    });
    cy.clickButton(/^Close$/);
  });

  it('can delete a single Rulebook Activation from the line item on the list view', () => {
    cy.navigateTo('eda', 'rulebook-activations');
    cy.edaRuleBookActivationCheckbox(edaRBA.name).within(() => {
      cy.clickPageAction('delete-rulebook-activation');
    });
    cy.get('div[role="dialog"]').within(() => {
      cy.get('.pf-v5-c-check__label').should(
        'contain',
        `Yes, I confirm that I want to delete these`
      );
      cy.get('a').should('contain', edaRBA.name);
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Delete rulebook activations').click();
    });
    cy.clickButton(/^Close$/);
  });

  it.skip('can bulk delete rulebook activations from the toolbar', () => {
    //rewrite this test when the bulk deletion problem is fixed: https://issues.redhat.com/browse/AAP-13093
  });
});
