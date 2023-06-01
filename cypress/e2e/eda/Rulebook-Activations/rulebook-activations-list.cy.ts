// //Tests a user's ability to perform certain actions on the rulebook activations list in the EDA UI.
// import { AwxToken } from '../../../../frontend/awx/interfaces/AwxToken';
// import { EdaControllerToken } from '../../../../frontend/eda/interfaces/EdaControllerToken';
// import { EdaDecisionEnvironment } from '../../../../frontend/eda/interfaces/EdaDecisionEnvironment';
// import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
// import { EdaRulebook } from '../../../../frontend/eda/interfaces/EdaRulebook';
// import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';
// import { IAwxResources } from '../../../support/awx-commands';

// describe('EDA rulebook activations- Create, Edit, Delete', () => {
//   let awxToken: AwxToken;
//   let awxResources: IAwxResources;
//   let edaProject: EdaProject;
//   let edaDecisionEnvironment: EdaDecisionEnvironment;
//   let edaRBA: EdaRulebookActivation;
//   let edaToken: EdaControllerToken;
//   let edaRuleBook: EdaRulebook;

//   before(() => {
//     cy.edaLogin();
//     cy.ensureEdaCurrentUserAwxToken();

//     cy.createAwxToken().then((token) => {
//       awxToken = token;
//       cy.addEdaCurrentUserAwxToken(awxToken.token).then((token) => {
//         edaToken = token;
//         cy.createEdaProject().then((project) => {
//           edaProject = project;
//           cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
//             edaRuleBook = edaRuleBooks[0];
//             cy.createEdaDecisionEnvironment().then((decisionEnvironment) => {
//               edaDecisionEnvironment = decisionEnvironment;
//               cy.createEdaRulebookActivation({
//                 rulebook_id: edaRuleBook.id,
//                 decision_environment_id: decisionEnvironment.id,
//               }).then((edaRulebookActivation) => {
//                 edaRBA = edaRulebookActivation;
//               });
//             });
//           });
//         });
//       });
//     });
//   });

//   after(() => {
//     cy.deleteAwxToken(awxToken);
//     cy.deleteAwxResources(awxResources);
//     cy.deleteEdaRulebookActivation(edaRBA);
//     cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
//     cy.deleteEdaProject(edaProject);
//     cy.deleteEdaCurrentUserAwxToken(edaToken);
//   });

//   it('can filter the rulebook activations list based on Name filter option', () => {
//     cy.navigateTo(/^Rulebook Activations$/);
//     cy.hasTitle(/^Rulebook Activations$/)
//       .next('p')
//       .should('have.text', 'Rulebook activations are rulebooks that have been activated to run.');
//     cy.contains('td[data-label="Name"]', edaRBA.name).should('be.visible');
//   });

//   // TODO enable the test when the restart bug for an activation with no project id is fixed [AAP-11217]
//   it.skip('can restart a Rulebook Activation from the from the line item in list view', () => {
//     cy.navigateTo(/^Rulebook Activations$/);
//     cy.edaRuleBookActivationCheckbox(edaRBA.name);
//     cy.clickEdaPageAction('Enable selected activations');
//     cy.edaRuleBookActivationActionsModal('enable', edaRBA.name);
//     cy.clickButton(/^Close$/);
//     cy.pollEdaResults(`/api/eda/v1/activations/?name=${edaRBA.name}`);
//   });

//   it('can disable a Rulebook Activation from the line item in list view', () => {
//     cy.navigateTo(/^Rulebook Activations$/);
//     cy.edaRuleBookActivationCheckbox(edaRBA.name);
//     cy.clickEdaPageAction('Disable selected activations');
//     cy.get('div[role="dialog"]').within(() => {
//       cy.get('.pf-c-check__label').should('contain', `Yes, I confirm that I want to disable these`);
//       cy.get('a').should('contain', edaRBA.name);
//       cy.get('input[id="confirm"]').click();
//       cy.get('button').contains('Disable rulebook activations').click();
//     });
//     cy.clickButton(/^Close$/);
//   });

//   it('can delete a single Rulebook Activation from the line item on the list view', () => {
//     cy.navigateTo(/^Rulebook Activations$/);
//     cy.edaRuleBookActivationCheckbox(edaRBA.name);
//     cy.clickEdaPageAction('Delete selected activations');
//     cy.get('div[role="dialog"]').within(() => {
//       cy.get('.pf-c-check__label').should('contain', `Yes, I confirm that I want to delete these`);
//       cy.get('a').should('contain', edaRBA.name);
//       cy.get('input[id="confirm"]').click();
//       cy.get('button').contains('Delete rulebook activations').click();
//     });
//     cy.clickButton(/^Close$/);
//   });

//   it.skip('can bulk delete rulebook activations from the toolbar', () => {
//     //rewrite this test when filtering is fixed
//   });
// });
