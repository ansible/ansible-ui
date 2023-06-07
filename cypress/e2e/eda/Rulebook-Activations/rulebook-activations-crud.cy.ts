//Tests a user's ability to create, edit, and delete rulebook activations in the EDA UI.
//IMPORTANT: rulebook activations do not have Edit capability in the UI. They can only be enabled or disabled.
import { randomString } from '../../../../framework/utils/random-string';
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { IAwxResources } from '../../../support/awx-commands';

describe('EDA rulebook activations- Create, Edit, Delete', () => {
  let awxResources: IAwxResources;
  let edaProject: EdaProject;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  let edaRBA: EdaRulebookActivation;
  let edaRuleBook: EdaRulebook;

  before(() => {
    cy.edaLogin();
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
          }).then((edaRulebookActivation) => {
            edaRBA = edaRulebookActivation;
          });
        });
      });
    });
  });

  after(() => {
    cy.deleteAwxResources(awxResources);
    cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
    cy.deleteEdaProject(edaProject);
    cy.deleteAllEdaCurrentUserTokens();
  });

  it('can create a Rulebook Activation including custom variables, enable it, and assert the information showing on the details page', () => {
    const name = 'E2E Rulebook Activation ' + randomString(4);
    cy.navigateTo(/^Rulebook Activations$/);
    cy.clickButton(/^Create rulebook activation$/);
    cy.get('h1').should('contain', 'Create Rulebook Activation');
    cy.typeInputByLabel(/^Name$/, name);
    cy.typeInputByLabel(/^Description$/, 'This is a new rulebook activation.');
    cy.selectDropdownOptionByLabel(/^Project$/, edaProject.name);
    cy.selectDropdownOptionByLabel(/^Rulebook$/, edaRuleBook.name);
    cy.selectDropdownOptionByLabel(/^Decision environment$/, edaDecisionEnvironment.name);
    cy.selectDropdownOptionByLabel(/^Restart policy$/, 'Always');
    cy.clickButton(/^Create rulebook activation$/);
    cy.get('h1').should('contain', name);
  });

  it('can enable and disable a Rulebook Activation', () => {
    cy.navigateTo(/^Rulebook Activations$/);
    cy.filterTableByText(edaRBA.name);
    cy.contains('[data-label="Activation status"]', 'Completed');
    cy.get('.pf-c-switch__toggle').click();
    cy.intercept('POST', `/api/eda/v1/activations/${edaRBA.id}/disable/`).as('disable');
    cy.edaRuleBookActivationActionsModal('disable', edaRBA.name);
    cy.get('button').contains('rulebook activations').click();
    cy.get('button').contains('Close').click();
    cy.wait('@disable').then((disable) => {
      expect(disable?.response?.statusCode).to.eq(204);
    });
    cy.get('.pf-c-switch__toggle').click();
    cy.intercept('POST', `/api/eda/v1/activations/${edaRBA.id}/enable/`).as('enable');
    cy.edaRuleBookActivationActionsModal('enable', edaRBA.name);
    cy.get('button').contains('rulebookActivations').click();
    cy.get('button').contains('Close').click();
    cy.wait('@enable').then((enable) => {
      expect(enable?.response?.statusCode).to.eq(204);
    });
  });

  it('can delete a Rulebook Activation from the details view', () => {
    cy.visit(`/eda/rulebook-activations/details/${edaRBA.id}`);
    cy.intercept('DELETE', `/api/eda/v1/activations/${edaRBA.id}/`).as('deleted');
    cy.clickPageAction(/^Delete rulebook activation$/);
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Delete rulebook activations');
    cy.wait('@deleted').then((deleted) => {
      expect(deleted?.response?.statusCode).to.eql(204);
      cy.hasTitle(/^Rulebook Activations$/);
    });
    //create a delete-all-RBAs-command
  });
});
