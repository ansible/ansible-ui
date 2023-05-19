import { RestartPolicyEnum } from '../../../../frontend/eda/interfaces/generated/eda-api';

//Tests a user's ability to perform certain actions on the rulebook activations list in the EDA UI.
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

  it('can filter the rulebook activations list based on Name filter option', () => {
    cy.addEdaCurrentUserAwxToken(awxToken.token).then((activeUserToken) => {
      cy.createEdaProject().then((edaProject) => {
        cy.getEdaRulebooks(edaProject).then((edaRuleBooksArray) => {
          const gitHookDeployRuleBook = edaRuleBooksArray[0];
          cy.createEdaDecisionEnvironment().then((edaDecisionEnvironment) => {
            cy.createEdaRulebookActivation({
              rulebook_id: gitHookDeployRuleBook.id,
              decision_environment_id: edaDecisionEnvironment.id,
            }).then((edaRulebookActivation) => {
              cy.navigateTo(/^Rulebook Activations$/);
              cy.hasTitle(/^Rulebook Activations$/)
                .next('p')
                .should(
                  'have.text',
                  'Rulebook activations are rulebooks that have been activated to run.'
                );

              /*
            filtering by text doesn't work for rulebook activations
            cy.filterTableByText(edaRulebookActivation.name);
            */
              cy.contains('td[data-label="Name"]', edaRulebookActivation.name).should('be.visible');
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

  // TODO enable the test when the restart bug for an activation with no project id is fixed [AAP-11217]
  it.skip('can restart a Rulebook Activation from the from the line item in list view', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.getEdaRulebooks(edaProject).then((edaRuleBooksArray) => {
        const gitHookDeployRuleBook = edaRuleBooksArray[0];
        cy.createEdaDecisionEnvironment().then((edaDecisionEnvironment) => {
          cy.createEdaRulebookActivation({
            rulebook_id: gitHookDeployRuleBook.id,
            decision_environment_id: edaDecisionEnvironment.id,
            restart_policy: RestartPolicyEnum.Always,
          }).then((edaRulebookActivation) => {
            cy.navigateTo(/^Rulebook Activations$/);
            /*
      filtering by text doesn't work for rulebook activations
      cy.filterTableByText(edaRulebookActivation.name);
      */
              cy.edaRuleBookActivationActions(
                'Restart rulebook activation',
                edaRulebookActivation.name
              );
              cy.clickModalConfirmCheckbox();
              cy.clickModalButton('Restart rulebook activations');
              cy.assertModalSuccess();
              cy.clickButton(/^Close$/);
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

  // it('can disable a Rulebook Activation from the line item in list view', () => {
  //   cy.createEdaProject().then((edaProject) => {
  //     cy.getEdaRulebooks(edaProject).then((edaRuleBooksArray) => {
  //       const gitHookDeployRuleBook = edaRuleBooksArray[0];
  //       cy.createEdaRulebookActivation(gitHookDeployRuleBook).then((edaRulebookActivation) => {
  //         cy.visit('eda/rulebook-activations');
  //         /*
  //     filtering by text doesn't work for rulebook activations
  //     cy.filterTableByText(edaRulebookActivation.name);
  //     */
  //         cy.edaRuleBookActivationActions(
  //           'Disable rulebook activation',
  //           edaRulebookActivation.name
  //         );
  //         cy.clickModalConfirmCheckbox();
  //         cy.clickModalButton('Disable rulebook activations');
  //         cy.assertModalSuccess();
  //         cy.clickButton(/^Close$/);
  //       });
  //     });
  //     cy.deleteEdaProject(edaProject);
  //   });
  // });

  it('can delete a single Rulebook Activation from the line item on the list view', () => {
    cy.addEdaCurrentUserAwxToken(awxToken.token).then((activeUserToken) => {
      cy.createEdaProject().then((edaProject) => {
        cy.getEdaRulebooks(edaProject).then((edaRuleBooksArray) => {
          const gitHookDeployRuleBook = edaRuleBooksArray[0];
          cy.createEdaDecisionEnvironment().then((edaDecisionEnvironment) => {
            cy.createEdaRulebookActivation({
              rulebook_id: gitHookDeployRuleBook.id,
              decision_environment_id: edaDecisionEnvironment.id,
            }).then((edaRulebookActivation) => {
              cy.navigateTo(/^Rulebook Activations$/);
              /*
      filtering by text doesn't work for rulebook activations
      cy.filterTableByText(edaRulebookActivation.name);
      */
              cy.edaRuleBookActivationActions('Delete', edaRulebookActivation.name);
              cy.clickModalConfirmCheckbox();
              cy.clickModalButton('Delete rulebook activations');
              cy.assertModalSuccess();
              cy.clickButton(/^Close$/);
            });
            cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
          });
        });
        cy.deleteEdaProject(edaProject);
        cy.deleteEdaCurrentUserAwxToken(activeUserToken);
      });
    });
  });

  it('can bulk delete rulebook activations from the toolbar', () => {
    cy.addEdaCurrentUserAwxToken(awxToken.token).then((activeUserToken) => {
      cy.createEdaProject().then((edaProject1) => {
        cy.getEdaRulebooks(edaProject1).then((edaRuleBooksArray) => {
          const gitHookDeployRuleBook = edaRuleBooksArray[0];
          cy.createEdaDecisionEnvironment().then((edaDecisionEnvironment) => {
            cy.createEdaRulebookActivation({
              rulebook_id: gitHookDeployRuleBook.id,
              decision_environment_id: edaDecisionEnvironment.id,
            }).then((edaRulebookActivation1) => {
              cy.createEdaProject().then((edaProject2) => {
                cy.getEdaRulebooks(edaProject2).then((edaRuleBooksArray) => {
                  const gitHookDeployRuleBook = edaRuleBooksArray[0];
                  cy.createEdaDecisionEnvironment().then((edaDecisionEnvironment) => {
                    cy.createEdaRulebookActivation({
                      rulebook_id: gitHookDeployRuleBook.id,
                      decision_environment_id: edaDecisionEnvironment.id,
                    }).then((edaRulebookActivation2) => {
                      cy.intercept(
                        'DELETE',
                        `api/eda/v1/activations/${edaRulebookActivation1.id}/`
                      ).as('edaRulebookActivation1');
                      cy.intercept(
                        'DELETE',
                        `api/eda/v1/activations/${edaRulebookActivation2.id}/`
                      ).as('edaRulebookActivation2');
                      cy.navigateTo(/^Rulebook Activations$/);
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
                      cy.clickToolbarKebabAction(/^Delete selected activations$/);
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
                      cy.contains('h1', 'Rulebook Activations').should('be.visible');
                    });
                    cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
                  });
                });
                cy.deleteEdaProject(edaProject1);
                cy.deleteEdaProject(edaProject2);
              });
              cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
              cy.deleteEdaCurrentUserAwxToken(activeUserToken);
            });
          });
        });
      });
    });
  });
});
