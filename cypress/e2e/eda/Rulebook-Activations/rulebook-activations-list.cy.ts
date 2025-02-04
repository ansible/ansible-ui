//Tests a user's ability to perform certain actions on the rulebook activations list in the EDA UI.
import { EdaDecisionEnvironment } from '@ansible/eda-ui/interfaces/EdaDecisionEnvironment';
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { EdaProject } from '@ansible/eda-ui/interfaces/EdaProject';
import { EdaRulebook } from '@ansible/eda-ui/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '@ansible/eda-ui/interfaces/EdaRulebookActivation';
import { LogLevelEnum } from '@ansible/eda-ui/interfaces/generated/eda-api';
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

  describe('EDA rulebook activations- Create, Edit, Delete', () => {
    let edaProject: EdaProject;
    let edaDecisionEnvironment: EdaDecisionEnvironment;
    let edaRBA1: EdaRulebookActivation;
    let edaRBA2: EdaRulebookActivation;
    let edaRBA3: EdaRulebookActivation;
    let edaRuleBook1: EdaRulebook;
    let edaRuleBook2: EdaRulebook;
    let edaRuleBook3: EdaRulebook;
    let edaOrg: EdaOrganization;

    before(() => {
      cy.ensureEdaCurrentUserAwxToken();
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
        cy.createEdaProject(edaOrg?.id).then((project) => {
          edaProject = project;
          cy.waitEdaProjectSync(project);
          cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
            edaRuleBook1 = edaRuleBooks[0];
            cy.createEdaDecisionEnvironment(edaOrg?.id).then((decisionEnvironment) => {
              edaDecisionEnvironment = decisionEnvironment;
              cy.createEdaRulebookActivation(
                {
                  rulebook_id: edaRuleBook1.id,
                  decision_environment_id: decisionEnvironment.id,
                  k8s_service_name: 'sample',
                  log_level: LogLevelEnum.Error,
                },
                edaOrg
              ).then((edaRulebookActivation) => {
                edaRBA1 = edaRulebookActivation;
              });
            });
          });
          cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
            edaRuleBook2 = edaRuleBooks[0];
            cy.createEdaDecisionEnvironment(edaOrg?.id).then((decisionEnvironment) => {
              edaDecisionEnvironment = decisionEnvironment;
              cy.createEdaRulebookActivation(
                {
                  rulebook_id: edaRuleBook2.id,
                  decision_environment_id: decisionEnvironment.id,
                  k8s_service_name: 'sample',
                  log_level: LogLevelEnum.Error,
                },
                edaOrg
              ).then((edaRulebookActivation) => {
                edaRBA2 = edaRulebookActivation;
              });
            });
          });
          cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
            edaRuleBook3 = edaRuleBooks[0];
            cy.createEdaDecisionEnvironment(edaOrg?.id).then((decisionEnvironment) => {
              edaDecisionEnvironment = decisionEnvironment;
              cy.createEdaRulebookActivation(
                {
                  rulebook_id: edaRuleBook3.id,
                  decision_environment_id: decisionEnvironment.id,
                  k8s_service_name: 'sample',
                  log_level: LogLevelEnum.Error,
                },
                edaOrg
              ).then((edaRulebookActivation) => {
                edaRBA3 = edaRulebookActivation;
              });
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

    it('can filter the rulebook activations list based on Name filter option', () => {
      cy.navigateTo('eda', 'rulebook-activations');
      cy.verifyPageTitle('Rulebook Activations');
      cy.contains('td[data-label="Name"]', edaRBA1.name).should('be.visible');
    });

    it('can disable a Rulebook Activation from the line item in list view', () => {
      cy.navigateTo('eda', 'rulebook-activations');
      cy.edaRuleBookActivationCheckbox(edaRBA1.name).within(() => {
        cy.get('[data-cy="toggle-switch"]').click();
      });
      cy.get('div[role="dialog"]').within(() => {
        cy.get('.pf-v5-c-check__label').should(
          'contain',
          `Yes, I confirm that I want to disable these`
        );
        cy.get('td[data-label="Name"]').should('contain', edaRBA1.name);
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains('Disable rulebook activations').click();
      });
    });

    it('can delete a single Rulebook Activation from the line item on the list view', () => {
      cy.navigateTo('eda', 'rulebook-activations');
      cy.clickTableRowAction('name', edaRBA1.name, 'delete-rulebook-activation', {
        disableFilter: true,
        inKebab: true,
      });
      cy.get('div[role="dialog"]').within(() => {
        cy.get('.pf-v5-c-check__label').should(
          'contain',
          `Yes, I confirm that I want to delete these`
        );
        cy.get('td[data-label="Name"]').should('contain', edaRBA1.name);
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains('Delete rulebook activations').click();
      });
    });

    it('can bulk delete rulebook activations from the toolbar', () => {
      cy.navigateTo('eda', 'rulebook-activations');
      cy.filterTableByTextFilter('name', edaRBA2.name, {
        disableFilterSelection: true,
      });
      cy.get('tbody').find('tr').should('have.length', 1);
      cy.getTableRowByText(edaRBA2.name, false).within(() => {
        cy.get('input[type=checkbox]').eq(0).click();
      });
      cy.clickButton(/^Clear all filters$/);
      cy.filterTableByTextFilter('name', edaRBA3.name, {
        disableFilterSelection: true,
      });
      cy.get('tbody').find('tr').should('have.length', 1);
      cy.getTableRowByText(edaRBA3.name, false).within(() => {
        cy.get('input[type=checkbox]').eq(0).click();
      });
      cy.clickToolbarKebabAction('delete-rulebook-activations');
      cy.intercept('DELETE', edaAPI`/activations/${edaRBA2.id.toString()}/`).as('rba2');
      cy.intercept('DELETE', edaAPI`/activations/${edaRBA3.id.toString()}/`).as('rba3');
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete rulebook activations');
      cy.wait(['@rba2', '@rba3']).then((activationArr) => {
        expect(activationArr[0]?.response?.statusCode).to.eql(204);
        expect(activationArr[1]?.response?.statusCode).to.eql(204);
      });
      cy.assertModalSuccess();
    });
  });
});
