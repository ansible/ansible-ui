//Tests a user's ability to create, edit, and delete rulebook activations in the EDA UI.
//IMPORTANT: rulebook activations do not have Edit capability in the UI. They can only be enabled or disabled.
import { randomString } from '../../../../framework/utils/random-string';
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { ActivationRead } from '../../../../frontend/eda/interfaces/generated/eda-api';

describe('EDA rulebook activations- Create', () => {
  let edaProject: EdaProject;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  let edaRuleBook: EdaRulebook;

  before(() => {
    cy.edaLogin();
    cy.ensureEdaCurrentUserAwxToken();
    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.waitEdaProjectSync(project);
      cy.getEdaRulebooks(edaProject, 'basic_short.yml').then((edaRuleBooks) => {
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
    cy.deleteAllEdaCurrentUserTokens();
  });

  it('can create a Rulebook Activation including custom variables and assert the information showing on the details page', () => {
    const name = 'E2E Rulebook Activation ' + randomString(4);
    cy.navigateTo('eda', 'rulebook-activations');
    cy.clickButton(/^Create rulebook activation$/);
    cy.get('h1').should('contain', 'Create Rulebook Activation');
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="description"]').type('This is a new rulebook activation.');
    cy.selectDropdownOptionByLabel(/^Project$/, edaProject.name);
    cy.selectDropdownOptionByLabel(/^Rulebook$/, edaRuleBook.name);
    cy.selectDropdownOptionByLabel(/^Decision environment$/, edaDecisionEnvironment.name);
    cy.selectDropdownOptionByLabel(/^Restart policy$/, 'On failure');
    cy.intercept('POST', '/api/eda/v1/activations/').as('edaRBA');
    cy.clickButton(/^Create rulebook activation$/);
    cy.wait('@edaRBA').then((edaRBA) => {
      const rbaToBeDeleted = edaRBA?.response?.body as ActivationRead;
      cy.get('h1').should('contain', name);
      cy.navigateTo('eda', 'rulebook-activations');
      cy.deleteEdaRulebookActivation(rbaToBeDeleted);
    });
  });

  it.skip('can restart a Rulebook Activation from the from the line item in list view', () => {
    //this test should only live downstream
    const name = 'E2E Rulebook Activation ' + randomString(4);
    cy.navigateTo('eda', 'rulebook-activations');
    cy.clickButton(/^Create rulebook activation$/);
    cy.get('h1').should('contain', 'Create Rulebook Activation');
    cy.get('[data-cy="name"]').type(name);
    cy.get('[data-cy="description"]').type('This is a new rulebook activation.');
    cy.selectDropdownOptionByLabel(/^Project$/, edaProject.name);
    cy.selectDropdownOptionByLabel(/^Rulebook$/, edaRuleBook.name);
    cy.selectDropdownOptionByLabel(/^Decision environment$/, edaDecisionEnvironment.name);
    cy.selectDropdownOptionByLabel(/^Restart policy$/, 'Always');
    cy.intercept('POST', '/api/eda/v1/activations/').as('edaRBA');
    cy.clickButton(/^Create rulebook activation$/);
    cy.wait('@edaRBA').then((edaRBA) => {
      const rbaToBeDeleted = edaRBA?.response?.body as ActivationRead;
      cy.get('h1').should('contain', name);
      cy.get('.pf-c-breadcrumb a').should('contain', 'Rulebook Activations').click();
      cy.filterTableByText(rbaToBeDeleted.name);
      cy.contains('[data-label="Activation status"]', 'Completed', { timeout: 60000 });
      cy.get('tbody tr').then(() => {
        cy.get('.pf-c-dropdown__toggle pf-m-plain toggle-kebab')
          .click()
          .then(() => {
            cy.contains('li', 'Restart rulebook activation').click();
            cy.intercept('POST', `/api/eda/v1/activations/${rbaToBeDeleted.id}/restart/`).as(
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

describe('EDA rulebook activations- Edit, Delete', () => {
  let edaProject: EdaProject;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  let edaRBA: EdaRulebookActivation;
  let edaDisabledRBA: EdaRulebookActivation;
  let edaRuleBook: EdaRulebook;

  before(() => {
    cy.edaLogin();
    cy.ensureEdaCurrentUserAwxToken();

    cy.createEdaProject().then((project) => {
      edaProject = project;
      cy.waitEdaProjectSync(project);
      cy.getEdaRulebooks(edaProject, 'basic_short.yml').then((edaRuleBooks) => {
        edaRuleBook = edaRuleBooks[0];
        cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
          edaDecisionEnvironment = decisionEnvironment;
          cy.createEdaRulebookActivation({
            rulebook_id: edaRuleBook.id,
            decision_environment_id: edaDecisionEnvironment.id,
          }).then((edaRulebookActivation) => {
            edaRBA = edaRulebookActivation;
          });
          cy.createEdaRulebookActivation({
            rulebook_id: edaRuleBook.id,
            decision_environment_id: edaDecisionEnvironment.id,
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
    cy.deleteAllEdaCurrentUserTokens();
  });

  it.skip('can disable a Rulebook Activation', () => {
    //this test should only live downstream
    cy.navigateTo('eda', 'rulebook-activations');
    cy.filterTableByText(edaRBA.name);
    cy.getTableRowByText(edaRBA.name).within(() => {
      cy.get('.pf-c-switch__toggle').click();
      cy.intercept('POST', `/api/eda/v1/activations/${edaRBA.id}/disable/`).as('disable');
    });
    cy.edaRuleBookActivationActionsModal('disable', edaRBA.name);
    cy.get('button').contains('rulebook activations').click();
    cy.get('button').contains('Close').click();
    cy.wait('@disable').then((disable) => {
      expect(disable?.response?.statusCode).to.eq(204);
    });
  });

  it.skip('can enable a Rulebook Activation', () => {
    //this test should only live downstream
    cy.navigateTo('eda', 'rulebook-activations');
    cy.filterTableByText(edaDisabledRBA.name);
    cy.getTableRowByText(edaDisabledRBA.name).within(() => {
      cy.get('.pf-c-switch__toggle').click();
      cy.intercept('POST', `/api/eda/v1/activations/${edaDisabledRBA.id}/enable/`).as('enable');
    });
    cy.edaRuleBookActivationActionsModal('enable', edaDisabledRBA.name);
    cy.get('button').contains('rulebook activations').click();
    cy.get('button').contains('Close').click();
    cy.wait('@enable').then((enable) => {
      expect(enable?.response?.statusCode).to.eq(204);
    });
  });

  it.skip('can delete a Rulebook Activation from the details view', () => {
    //this test should only live downstream
    cy.visit(`/eda/rulebook-activations/details/${edaRBA.id}`);
    cy.intercept('DELETE', `/api/eda/v1/activations/${edaRBA.id}/`).as('deleted');
    cy.clickPageAction(/^Delete rulebook activation$/);
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Delete rulebook activations');
    cy.wait('@deleted').then((deleted) => {
      expect(deleted?.response?.statusCode).to.eql(204);
      cy.hasTitle(/^Rulebook Activations$/);
    });
  });
});
