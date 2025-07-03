//Tests a user's ability to create, edit, and delete rulebook activations in the EDA UI.
//IMPORTANT: rulebook activations do not have Edit capability in the UI. They can only be enabled or disabled.
import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { EdaDecisionEnvironment } from '@ansible/eda-ui/interfaces/EdaDecisionEnvironment';
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { EdaProject } from '@ansible/eda-ui/interfaces/EdaProject';
import { EdaRulebook } from '@ansible/eda-ui/interfaces/EdaRulebook';
import { ActivationRead } from '@ansible/eda-ui/interfaces/generated/eda-api';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('Check if the build includes EDA', () => {
  before(function () {
    cy.getPlatformApis().then((data) => {
      if (data?.apis && !data?.apis?.eda) {
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });

  describe('EDA rulebook activations - Create', () => {
    let edaProject: EdaProject;
    let edaDecisionEnvironment: EdaDecisionEnvironment;
    let edaRuleBook: EdaRulebook;
    let edaOrg: EdaOrganization;

    before(() => {
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
        cy.createEdaProject(edaOrg?.id).then((project) => {
          edaProject = project;
          cy.waitEdaProjectSync(project);
          cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
            edaRuleBook = edaRuleBooks[0];
            cy.createEdaDecisionEnvironment(edaOrg?.id).then((decisionEnvironment) => {
              edaDecisionEnvironment = decisionEnvironment;
            });
          });
        });
      });
    });

    after(() => {
      cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment, { failOnStatusCode: false });
      cy.deleteEdaProject(edaProject, { failOnStatusCode: false });
      cy.deleteAllEdaCurrentUserTokens();
      cy.deleteEdaOrganization(edaOrg);
    });

    it('can create a Rulebook Activation including custom variables and assert the information showing on the details page', () => {
      const name = 'E2E Rulebook Activation ' + randomString(4);
      cy.navigateTo('eda', 'rulebook-activations');
      cy.clickLink(/^Create rulebook activation$/);
      cy.contains('h1', 'Create rulebook activation').should('be.visible');
      cy.get('[data-cy="name"]').type(name);
      cy.get('[data-cy="description"]').type('This is a new rulebook activation.');
      cy.getBy('[data-cy="organization_id"]').click();
      cy.clickButton('Browse');
      cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
        cy.get('table').should('exist');
        cy.getBy('[data-cy="text-input"] input').type(edaOrg.name);
        cy.getBy('button[data-cy="apply-filter"]').click();
        cy.get('tbody tr input').click();
        cy.clickButton('Confirm');
      });
      cy.get('[data-cy="project_id"]').click();
      cy.clickButton('Browse');
      cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
        cy.get('table').should('exist');
        cy.getBy('[data-cy="text-input"] input').type(edaProject.name);
        cy.getBy('button[data-cy="apply-filter"]').click();
        cy.get('tbody tr input').click();
        cy.clickButton('Confirm');
      });
      cy.get('[data-cy="rulebook_id"]').click();
      cy.clickButton('Browse');
      cy.get('[data-ouia-component-type="PF6/ModalContent"]').within(() => {
        cy.get('table').should('exist');
        cy.getBy('[data-cy="text-input"] input').type(edaRuleBook.name);
        cy.getBy('button[data-cy="apply-filter"]').click();
        cy.get('tbody tr input').click();
        cy.clickButton('Confirm');
      });
      cy.selectDropdownOptionByResourceName('decision-environment-id', edaDecisionEnvironment.name);
      cy.intercept('POST', edaAPI`/activations/`).as('edaRBA');
      cy.clickButton(/^Create rulebook activation$/);
      cy.wait('@edaRBA').then((edaRBA) => {
        const rbaToBeDeleted = edaRBA?.response?.body as ActivationRead;
        cy.contains('h1', name).should('be.visible');
        cy.navigateTo('eda', 'rulebook-activations');
        cy.deleteEdaRulebookActivation(rbaToBeDeleted);
      });
    });
  });
});
