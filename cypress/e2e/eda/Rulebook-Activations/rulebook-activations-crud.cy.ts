//Tests a user's ability to create, edit, and delete rulebook activations in the EDA UI.
//IMPORTANT: rulebook activations do not have Edit capability in the UI. They can only be enabled or disabled.
import { randomString } from '../../../../framework/utils/random-string';
import { EdaControllerToken } from '../../../../frontend/eda/interfaces/EdaControllerToken';
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
import { ActivationRead } from '../../../../frontend/eda/interfaces/generated/eda-api';
import { edaAPI } from '../../../support/formatApiPathForEDA';
import { tag } from '../../../support/tag';

tag(['aaas-unsupported'], function () {
  describe('EDA rulebook activations - Create', () => {
    let edaProject: EdaProject;
    let edaDecisionEnvironment: EdaDecisionEnvironment;
    let edaRuleBook: EdaRulebook;
    let edaAwxToken: EdaControllerToken;

    before(() => {
      cy.createEdaProject().then((project) => {
        edaProject = project;
        cy.waitEdaProjectSync(project);
        cy.getEdaRulebooks(edaProject, 'basic_short.yml').then((edaRuleBooks) => {
          edaRuleBook = edaRuleBooks[0];
          cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
            edaDecisionEnvironment = decisionEnvironment;
            cy.addEdaCurrentUserAwxToken('E2E AWX token ' + randomString(4)).then((awxToken) => {
              edaAwxToken = awxToken;
            });
          });
        });
      });
    });

    after(() => {
      cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment, { failOnStatusCode: false });
      cy.deleteEdaProject(edaProject, { failOnStatusCode: false });
      cy.deleteAllEdaCurrentUserTokens();
    });

    it('can create a Rulebook Activation including custom variables and assert the information showing on the details page', () => {
      const name = 'E2E Rulebook Activation ' + randomString(4);
      cy.navigateTo('eda', 'rulebook-activations');
      cy.clickButton(/^Create rulebook activation$/);
      cy.get('h1').should('contain', 'Create rulebook activation');
      cy.get('[data-cy="name"]').type(name);
      cy.get('[data-cy="description"]').type('This is a new rulebook activation.');
      cy.selectDropdownOptionByResourceName('project-id', edaProject.name);
      cy.selectDropdownOptionByResourceName('rulebook', edaRuleBook.name);
      cy.selectDropdownOptionByResourceName('decision-environment-id', edaDecisionEnvironment.name);
      cy.selectDropdownOptionByResourceName('awx-token-id', edaAwxToken.name);
      cy.intercept('POST', edaAPI`/activations/`).as('edaRBA');
      cy.clickButton(/^Create rulebook activation$/);
      cy.wait('@edaRBA').then((edaRBA) => {
        const rbaToBeDeleted = edaRBA?.response?.body as ActivationRead;
        cy.get('h1').should('contain', name);
        cy.navigateTo('eda', 'rulebook-activations');
        cy.deleteEdaRulebookActivation(rbaToBeDeleted);
      });
      cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
      cy.deleteEdaProject(edaProject);
      cy.deleteAllEdaCurrentUserTokens();
    });
  });
});
