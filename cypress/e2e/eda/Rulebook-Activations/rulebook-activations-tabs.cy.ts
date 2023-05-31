describe('EDA rulebook activations History Tab', () => {
  before(() => {
    cy.edaLogin();
    cy.ensureEdaCurrentUserAwxToken();
  });

  it.skip('renders the instances that are related to the rulebook activation', () => {
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
