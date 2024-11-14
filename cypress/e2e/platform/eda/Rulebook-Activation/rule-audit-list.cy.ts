// //Tests a user's ability to perform certain actions on the Rule Audits list in the EDA UI.

import { Settings } from '@ansible/awx-ui/interfaces/Settings';
import { EdaDecisionEnvironment } from '@ansible/eda-ui/interfaces/EdaDecisionEnvironment';
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { EdaProject } from '@ansible/eda-ui/interfaces/EdaProject';
import { EdaRulebook } from '@ansible/eda-ui/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '@ansible/eda-ui/interfaces/EdaRulebookActivation';
import { LogLevelEnum } from '@ansible/eda-ui/interfaces/generated/eda-api';
import { SAAS_URL } from '../../../../support/constants';
import { awxAPI } from '../../../../support/formatApiPathForAwx';

describe('If SaaS Build', () => {
  before(function () {
    cy.requestGet<Settings>(awxAPI`/settings/system/`).then((data) => {
      const saasBaseUrl = data.TOWER_URL_BASE;
      const parseSaas = saasBaseUrl.split('.').slice(2).join('.').toString();
      if (parseSaas === SAAS_URL) {
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });

  describe('EDA rulebook activations- Edit, Delete', () => {
    let edaProject: EdaProject;
    let edaDecisionEnvironment: EdaDecisionEnvironment;
    let edaRBA: EdaRulebookActivation;
    let edaRuleBook: EdaRulebook;
    let edaOrganization: EdaOrganization;

    before(() => {
      cy.createEdaOrganization().then((edaOrg) => {
        edaOrganization = edaOrg;
        cy.createEdaProject(edaOrganization.id).then((project) => {
          edaProject = project;
          cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
            edaRuleBook = edaRuleBooks[0];
            cy.createEdaDecisionEnvironment(edaOrganization.id).then((decisionEnvironment) => {
              edaDecisionEnvironment = decisionEnvironment;
              cy.createEdaRulebookActivation(
                {
                  rulebook_id: edaRuleBook.id,
                  decision_environment_id: decisionEnvironment.id,
                  log_level: LogLevelEnum.Error,
                },
                edaOrganization
              ).then((edaRulebookActivation) => {
                edaRBA = edaRulebookActivation;
              });
            });
          });
        });
      });
    });

    after(() => {
      cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment, { failOnStatusCode: false });
      cy.deleteEdaProject(edaProject, { failOnStatusCode: false });
      cy.deleteEdaRulebookActivation(edaRBA);
      cy.deleteAllEdaCurrentUserTokens();
    });

    //This test doesn't work when too many Rule Audits exist in the build.
    //There is no way to filter the list of Rule Audits by Rulebook Activation name.
    it.skip('can access rule audit data for a successful rulebook activation', () => {
      cy.navigateTo('eda', 'rule-audits');
      cy.verifyPageTitle('Rule Audit');
      cy.getBy('[data-cy="text-input"]').type(edaRBA.name);
      cy.getBy('button[data-cy="apply-filter"]').click();
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
