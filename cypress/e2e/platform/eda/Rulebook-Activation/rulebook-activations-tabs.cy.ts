import { EdaDecisionEnvironment } from '../../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { LogLevelEnum } from '../../../../../frontend/eda/interfaces/generated/eda-api';
import { IAwxResources } from '../../../../support/awx-commands';
import { EdaOrganization } from '../../../../../frontend/eda/interfaces/EdaOrganization';
import { awxAPI } from '../../../../support/formatApiPathForAwx';
import { Settings } from '../../../../../frontend/awx/interfaces/Settings';
import { SAAS_URL } from '../../../../support/constants';

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

  describe('EDA rulebook activations- Create, Edit, Delete', () => {
    let awxResources: IAwxResources;
    let edaProject: EdaProject;
    let edaDecisionEnvironment: EdaDecisionEnvironment;
    let edaRBA: EdaRulebookActivation;
    let edaRuleBook: EdaRulebook;
    let edaOrganization: EdaOrganization;

    before(() => {
      cy.ensureEdaCurrentUserAwxToken();
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
      cy.deleteAwxResources(awxResources, { failOnStatusCode: false });
      cy.deleteEdaRulebookActivation(edaRBA);
      cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment, { failOnStatusCode: false });
      cy.deleteEdaProject(edaProject, { failOnStatusCode: false });
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
