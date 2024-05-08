//Tests a user's ability to create, edit, and delete rulebook activations in the EDA UI.
//IMPORTANT: rulebook activations do not have Edit capability in the UI. They can only be enabled or disabled.
import { randomString } from '../../../../../framework/utils/random-string';
import { EdaDecisionEnvironment } from '../../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../../../frontend/eda/interfaces/EdaRulebookActivation';
import {
  ActivationRead,
  LogLevelEnum,
} from '../../../../../frontend/eda/interfaces/generated/eda-api';
import { edaAPI } from '../../../../support/formatApiPathForEDA';

describe('EDA rulebook activations - Create', () => {
  let edaProject: EdaProject;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  let edaRuleBook: EdaRulebook;

  before(() => {
    cy.platformLogin();
    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.waitEdaProjectSync(project);
      cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
        edaRuleBook = edaRuleBooks[0];
        cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
          edaDecisionEnvironment = decisionEnvironment;
        });
      });
    });
  });
  after(() => {
    cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
    cy.deleteEdaProject(edaProject);
  });

  it('can restart a Rulebook Activation from list view', () => {
    const name = 'E2E Rulebook Activation ' + randomString(4);
    cy.navigateTo('eda', 'rulebook-activations');
    cy.clickButton(/^Create rulebook activation$/);
    cy.get('h1').should('contain', 'Create Rulebook Activation');
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="description"]').type('This is a new rulebook activation.');
    cy.selectDropdownOptionByResourceName('project-id', edaProject.name);
    cy.selectDropdownOptionByResourceName('rulebook', edaRuleBook.name);
    cy.selectDropdownOptionByResourceName('decision-environment-id', edaDecisionEnvironment.name);
    cy.selectDropdownOptionByResourceName('restart-policy', 'Always');
    cy.intercept('POST', edaAPI`/activations/`).as('edaRBA');
    cy.clickButton(/^Create rulebook activation$/);
    cy.wait('@edaRBA').then((edaRBA) => {
      const rbaToBeDeleted = edaRBA?.response?.body as ActivationRead;
      cy.get('h1').should('contain', name);
      cy.get('.pf-v5-c-breadcrumb a').should('contain', 'Rulebook Activations').click();
      cy.filterTableByText(rbaToBeDeleted.name);
      cy.contains('[data-label="Status"]', 'Completed', { timeout: 120000 });
      cy.get('tbody tr').then(() => {
        cy.get(' tr [data-cy="actions-dropdown"]')
          .click()
          .then(() => {
            cy.contains('li', 'Restart rulebook activation').click();
            cy.intercept('POST', edaAPI`/activations/${rbaToBeDeleted.id.toString()}/restart/`).as(
              'restart'
            );
            cy.edaRuleBookActivationActionsModal('restart', rbaToBeDeleted.name);
            cy.get('button').contains('rulebook activations').click();
            cy.get('button').contains('Close').click();
            cy.wait('@restart').then((restart) => {
              expect(restart?.response?.statusCode).to.eq(204);
            });
          });
      });
      cy.deleteEdaRulebookActivation(rbaToBeDeleted);
    });
  });
});

describe('EDA rulebook activations - Actions', () => {
  let edaProject: EdaProject;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  let edaRBA: EdaRulebookActivation;
  let edaDisabledRBA: EdaRulebookActivation;
  let edaRuleBook: EdaRulebook;

  before(() => {
    cy.platformLogin();
    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.waitEdaProjectSync(project);
      cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
        edaRuleBook = edaRuleBooks[0];
        cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
          edaDecisionEnvironment = decisionEnvironment;
          cy.createEdaRulebookActivation({
            rulebook_id: edaRuleBook.id,
            decision_environment_id: edaDecisionEnvironment.id,
            log_level: LogLevelEnum.Error,
          }).then((edaRulebookActivation) => {
            edaRBA = edaRulebookActivation;
          });
          cy.createEdaRulebookActivation({
            rulebook_id: edaRuleBook.id,
            decision_environment_id: edaDecisionEnvironment.id,
            log_level: LogLevelEnum.Error,
            is_enabled: false,
          }).then((edaRulebookActivation) => {
            edaDisabledRBA = edaRulebookActivation;
          });
        });
      });
    });
  });

  after(() => {
    cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
    cy.deleteEdaProject(edaProject);
    cy.deleteEdaRulebookActivation(edaDisabledRBA);
  });

  it('can disable a Rulebook Activation', () => {
    cy.navigateTo('eda', 'rulebook-activations');
    cy.filterTableByText(edaRBA.name);
    cy.getTableRowByText(edaRBA.name).within(() => {
      cy.get('.pf-v5-c-switch__toggle').click();
      cy.intercept('POST', edaAPI`/activations/${edaRBA.id.toString()}/disable/`).as('disable');
    });
    cy.edaRuleBookActivationActionsModal('disable', edaRBA.name);
    cy.get('button').contains('rulebook activations').click();
    cy.get('button').contains('Close').click();
    cy.wait('@disable').then((disable) => {
      expect(disable?.response?.statusCode).to.eq(204);
    });
    cy.get('button').contains('Clear all filters').click();
  });

  it('can enable a Rulebook Activation', () => {
    cy.navigateTo('eda', 'rulebook-activations');
    cy.filterTableByText(edaDisabledRBA.name);
    cy.getTableRowByText(edaDisabledRBA.name).within(() => {
      cy.contains('tr', edaDisabledRBA.name);
      cy.get('.pf-v5-c-switch__toggle').click();
    });
    cy.contains('[data-label="Status"]', 'Completed', { timeout: 120000 });
  });
});
