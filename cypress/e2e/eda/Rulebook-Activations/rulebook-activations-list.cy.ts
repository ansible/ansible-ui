//Tests a user's ability to perform certain actions on the Rulebook Activations list in the EDA UI.
describe('EDA Rulebook Activations List', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can filter the Rulebook Activations list based on Name filter option', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.getEdaRulebooks(edaProject).then((edaRuleBooksArray) => {
        const gitHookDeployRuleBook = edaRuleBooksArray[0];
        cy.createEdaRulebookActivation(gitHookDeployRuleBook).then((edaRulebookActivation) => {
          cy.visit('eda/rulebook-activations');
          /*
      filtering by text doesn't work for rulebook activations
      cy.filterTableByText(edaRulebookActivation.name);
      */
          cy.contains('td[data-label="Name"]', edaRulebookActivation.name).should('be.visible');
          cy.deleteEdaRulebookActivation(edaRulebookActivation);
        });
      });
      cy.deleteEdaProject(edaProject);
    });
  });

  // TODO enable the test when the restart bug for an activation with no project id is fixed [AAP-11217]
  it.skip('can restart a Rulebook Activation from the from the line item in list view', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.getEdaRulebooks(edaProject).then((edaRuleBooksArray) => {
        const gitHookDeployRuleBook = edaRuleBooksArray[0];
        cy.createEdaRulebookActivation(gitHookDeployRuleBook, 'always').then(
          (edaRulebookActivation) => {
            cy.visit('eda/rulebook-activations');
            /*
      filtering by text doesn't work for rulebook activations
      cy.filterTableByText(edaRulebookActivation.name);
      */
          cy.edaRuleBookActivationActions('Restart rulebook activation', edaRulebookActivation.name);
          cy.edaRuleBookActivationActionsModal(
            'Restart rulebook activation',
            edaRulebookActivation.name
          );
          cy.deleteEdaRulebookActivation(edaRulebookActivation);
        });
      });
      cy.deleteEdaProject(edaProject);
    });
  });

  it('can disable a Rulebook Activation from the line item in list view', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.getEdaRulebooks(edaProject).then((edaRuleBooksArray) => {
        const gitHookDeployRuleBook = edaRuleBooksArray[0];
        cy.createEdaRulebookActivation(gitHookDeployRuleBook).then((edaRulebookActivation) => {
          cy.visit('eda/rulebook-activations');
          /*
      filtering by text doesn't work for rulebook activations
      cy.filterTableByText(edaRulebookActivation.name);
      */
          cy.edaRuleBookActivationActions('Disable rulebook activation', edaRulebookActivation.name);
          cy.edaRuleBookActivationActionsModal(
            'Disable rulebook activation',
            edaRulebookActivation.name
          );
          cy.deleteEdaRulebookActivation(edaRulebookActivation);
        });
      });
      cy.deleteEdaProject(edaProject);
    });
  });

  it('can delete a single Rulebook Activation from the line item on the list view', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.getEdaRulebooks(edaProject).then((edaRuleBooksArray) => {
        const gitHookDeployRuleBook = edaRuleBooksArray[0];
        cy.createEdaRulebookActivation(gitHookDeployRuleBook).then((edaRulebookActivation) => {
          cy.visit('eda/rulebook-activations');
          /*
      filtering by text doesn't work for rulebook activations
      cy.filterTableByText(edaRulebookActivation.name);
      */
          cy.edaRuleBookActivationActions('Delete rulebook activation', edaRulebookActivation.name);
          cy.clickModalConfirmCheckbox();
          cy.clickModalButton('Delete rulebook activations');
          cy.assertModalSuccess();
          cy.clickButton(/^Close$/);
        });
      });
      cy.deleteEdaProject(edaProject);
    });
  });

  it('can bulk delete Rulebook Activations from the toolbar', () => {
    cy.createEdaProject().then((edaProject1) => {
      cy.getEdaRulebooks(edaProject1).then((edaRuleBooksArray) => {
        const gitHookDeployRuleBook = edaRuleBooksArray[0];
        cy.createEdaRulebookActivation(gitHookDeployRuleBook).then((edaRulebookActivation1) => {
          cy.createEdaProject().then((edaProject2) => {
            cy.getEdaRulebooks(edaProject2).then((edaRuleBooksArray) => {
              const gitHookDeployRuleBook = edaRuleBooksArray[0];
              cy.createEdaRulebookActivation(gitHookDeployRuleBook).then(
                (edaRulebookActivation2) => {
                  cy.intercept('DELETE', `api/eda/v1/activations/${edaRulebookActivation1.id}/`).as(
                    'edaRulebookActivation1'
                  );
                  cy.intercept('DELETE', `api/eda/v1/activations/${edaRulebookActivation2.id}/`).as(
                    'edaRulebookActivation2'
                  );
                  cy.visit('eda/rulebook-activations');
                  /*
            uncomment below when working, within() yields multiple elements as 
            currently select by name doesn't work as expected for Rulebook Activations
            cy.selectTableRow(edaRulebookActivation1.name);
            cy.selectTableRow(edaRulebookActivation2.name);
            */
                  const rulebookActivations = [
                    edaRulebookActivation1.name,
                    edaRulebookActivation2.name,
                  ];
                  rulebookActivations.forEach((rulebookActivation) => {
                    cy.contains('td[data-label="Name"]', rulebookActivation)
                      .prev()
                      .within(() => {
                        cy.get('input[type=checkbox]').check();
                      });
                  });
                  cy.clickToolbarKebabAction(/^Delete selected rulebook activations$/);
                  cy.clickModalConfirmCheckbox();
                  cy.clickModalButton('Delete rulebook activations');
                  cy.wait(['@edaRulebookActivation1', '@edaRulebookActivation2']).then(
                    (activationArr) => {
                      expect(activationArr[0]?.response?.statusCode).to.eql(204);
                      expect(activationArr[1]?.response?.statusCode).to.eql(204);
                    }
                  );
                  cy.assertModalSuccess();
                  cy.clickButton(/^Close$/);
                  cy.contains('h1', 'Rulebook activations').should('be.visible');
                }
              );
            });
            cy.deleteEdaProject(edaProject1);
            cy.deleteEdaProject(edaProject2);
          });
        });
      });
    });
  });
});
