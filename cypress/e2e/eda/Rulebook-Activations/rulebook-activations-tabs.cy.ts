import { AwxToken } from '../../../../frontend/awx/interfaces/AwxToken';
import { EdaControllerToken } from '../../../../frontend/eda/interfaces/EdaControllerToken';
import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
import { IAwxResources } from '../../../support/awx-commands';

describe('EDA rulebook activations- Create, Edit, Delete', () => {
  let awxToken: AwxToken;
  let awxResources: IAwxResources;
  let edaProject: EdaProject;
  let edaDecisionEnvironment: EdaDecisionEnvironment;
  let edaRBA: EdaRulebookActivation;
  let edaToken: EdaControllerToken;
  let edaRuleBook: EdaRulebook;

  before(() => {
    cy.edaLogin();

    cy.createAwxToken().then((token) => {
      awxToken = token;
      cy.addEdaCurrentUserAwxToken(awxToken.token).then((token) => {
        edaToken = token;
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
    });
  });

  after(() => {
    cy.deleteAwxToken(awxToken);
    cy.deleteAwxResources(awxResources);
    cy.deleteEdaRulebookActivation(edaRBA);
    cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
    cy.deleteEdaProject(edaProject);
    cy.deleteEdaCurrentUserAwxToken(edaToken);
    cy.deleteAllEdaCurrentUserTokens();
  });

  it('renders the instances that are related to the rulebook activation', () => {
    cy.intercept('GET', `api/eda/v1/activations/${edaRBA.id}/instances/?page=1&page_size=10`).as(
      'getRBAInstance'
    );
    cy.navigateTo(/^Rulebook Activations$/);
    cy.clickTableRow(edaRBA.name);
    cy.contains('h1', edaRBA.name).should('be.visible');
    cy.contains('li', 'History').click();
    cy.wait('@getRBAInstance')
      .its('response.body.results[0].id')
      .then((id) => {
        cy.wrap(id).as('ID');
        cy.get('@ID').then(($id) => {
          const id = $id.toString();
          cy.contains('td[data-label="Name"]', `${id} - ${edaRBA.name}`);
        });
      });
  });

  it.skip('can filter results on the history tab based on Status', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.getEdaRulebooks(edaProject).then((edaRuleBooksArray) => {
        const gitHookDeployRuleBook = edaRuleBooksArray[0];
        cy.createEdaDecisionEnvironment().then((edaDecisionEnvironment) => {
          cy.createEdaRulebookActivation({
            rulebook_id: gitHookDeployRuleBook.id,
            decision_environment_id: edaDecisionEnvironment.id,
          }).then((edaRulebookActivation) => {
            cy.intercept(
              'GET',
              `api/eda/v1/activations/${edaRulebookActivation.id}/instances/?order_by=name&page=1&page_size=10`
            ).as('getRBAInstance');
            cy.navigateTo(/^Rulebook Activations$/);
            cy.clickTableRow(edaRulebookActivation.name);
            cy.contains('li', 'History').click();
            // TODO: needs further work when RBA actions are done
            cy.wait('@getRBAInstance')
              .its('response.body.results[0].id')
              .then((id) => {
                cy.wrap(id).as('ID');
                cy.get('@ID').then(() => {
                  cy.selectToolbarFilterType(`Status`);
                  cy.contains('td[data-label="Status"]', `Failed`);
                });
              });
            cy.deleteEdaRulebookActivation(edaRulebookActivation);
          });
          cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
        });
      });
      cy.deleteEdaProject(edaProject);
    });
  });
});
