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
    cy.deleteEdaRulebookActivation(edaRBA);
    cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
    cy.deleteEdaProject(edaProject);
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
});
