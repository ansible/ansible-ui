import { AwxToken } from '../../../../frontend/awx/interfaces/AwxToken';
import { IAwxResources } from '../../../support/awx-commands';

describe('EDA rulebook activations- Create, Edit, Delete', () => {
  let awxToken: AwxToken;
  let awxResources: IAwxResources;

  before(() => {
    cy.createAwxToken().then((token) => {
      awxToken = token;
    });

    cy.edaLogin();
  });

  after(() => {
    cy.deleteAwxToken(awxToken);
    cy.deleteAwxResources(awxResources);
  });

  it('renders the instances that are related to the rulebook activation', () => {
    cy.addEdaCurrentUserAwxToken(awxToken.token).then((activeUserToken) => {
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
                `api/eda/v1/activations/${edaRulebookActivation.id}/instances/?page=1&page_size=10`
              ).as('getRBAInstance');
              cy.navigateTo(/^Rulebook Activations$/);
              cy.clickTableRow(edaRulebookActivation.name);
              cy.contains('h1', edaRulebookActivation.name).should('be.visible');
              cy.contains('li', 'History').click();
              cy.wait('@getRBAInstance')
                .its('response.body.results[0].id')
                .then((id) => {
                  cy.wrap(id).as('ID');
                  cy.get('@ID').then(($id) => {
                    const id = $id.toString();
                    cy.contains('td[data-label="Name"]', `${id} - ${edaRulebookActivation.name}`);
                  });
                });
              cy.deleteEdaRulebookActivation(edaRulebookActivation);
            });
            cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
          });
        });
        cy.deleteEdaProject(edaProject);
        cy.deleteEdaCurrentUserAwxToken(activeUserToken);
      });
    });
  });

  it.skip('can filter results on the history tab based on Status', () => {
    cy.addEdaCurrentUserAwxToken(awxToken.token).then((activeUserToken) => {
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
        cy.deleteEdaCurrentUserAwxToken(activeUserToken);
      });
    });
  });
});
