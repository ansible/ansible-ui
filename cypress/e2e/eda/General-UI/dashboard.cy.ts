//Tests a user's ability to perform certain actions on the Dashboard of the EDA UI.
//Implementation of Visual Tests makes sense here at some point

import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';

describe('EDA Dashboard', () => {
  let edaProject: EdaProject;

  before(() => {
    cy.edaLogin();
    cy.createEdaProject().then((project) => (edaProject = project));
  });

  after(() => {
    cy.deleteEdaProject(edaProject);
  });

  it('shows the user a Project card with a list of Projects visible including working links', () => {
    cy.navigateTo(/^Dashboard$/);
    cy.get('[data-label="Name"] div > a').contains('E2E Project').click();
    cy.url().should('match', new RegExp('eda/projects/details/[0-9]*'));
  });

  it('shows the user a Rulebook Activation card with a list of Rulebook Activations visible including working links', () => {
    cy.getEdaRulebooks(edaProject).then((edaRulebooksArray) => {
      cy.createEdaDecisionEnvironment().then((edaDecisionEnvironment) => {
        cy.createEdaRulebookActivation({
          rulebook_id: edaRulebooksArray[0].id,
          decision_environment_id: edaDecisionEnvironment.id,
        }).then((activation) => {
          cy.navigateTo(/^Dashboard$/);
          cy.get('[data-label="Name"] div > a').contains(activation.name).click();
          cy.url().should('match', new RegExp('eda/rulebook-activations/details/[0-9]*'));
          cy.deleteEdaRulebookActivation(activation);
        });
        cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
      });
    });
  });
});
