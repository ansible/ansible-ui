//Tests a user's ability to create, edit, and delete rulebook activations in the EDA UI.
//IMPORTANT: rulebook activations do not have Edit capability in the UI. They can only be enabled or disabled.
import { randomString } from '../../../../framework/utils/random-string';
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

  it('can create a Rulebook Activation including custom variables, enable it, and assert the information showing on the details page', () => {
    cy.addEdaCurrentUserAwxToken(awxToken.token).then((activeUserToken) => {
      cy.createEdaProject().then((edaProject) => {
        cy.waitEdaProjectSync(edaProject);
        cy.getEdaRulebooks(edaProject, 'hello_echo.yml').then((edaRuleBooks) => {
          cy.createEdaDecisionEnvironment().then((edaDecisionEnvironment) => {
            const edaRulebook = edaRuleBooks[0];
            const name = 'E2E Rulebook Activation ' + randomString(4);
            cy.navigateTo(/^Rulebook Activations$/);
            cy.clickButton(/^Create rulebook activation$/);
            cy.contains('h1', 'Create Rulebook Activation').should('be.visible');
            cy.typeInputByLabel(/^Name$/, name);
            cy.typeInputByLabel(/^Description$/, 'This is a new rulebook activation.');
            cy.selectDropdownOptionByLabel(/^Project$/, edaProject.name);
            cy.selectDropdownOptionByLabel(/^Rulebook$/, edaRulebook.name);
            cy.selectDropdownOptionByLabel(/^Decision environment$/, edaDecisionEnvironment.name);
            cy.selectDropdownOptionByLabel(/^Restart policy$/, 'Always');
            cy.clickButton(/^Create rulebook activation$/);
            cy.get('h1').should('contain', name);
            cy.getEdaRulebookActivation(name).then((edaRulebookActivation) => {
              if (edaRulebookActivation) {
                cy.deleteEdaRulebookActivation(edaRulebookActivation);
              }
            });
            cy.deleteEdaDecisionEnvironment(edaDecisionEnvironment);
          });
        });
        cy.deleteEdaProject(edaProject);
        cy.deleteEdaCurrentUserAwxToken(activeUserToken);
      });
    });
  });

  it.skip('can enable and disable a Rulebook Activation', () => {
    cy.addEdaCurrentUserAwxToken(awxToken.token).then((activeUserToken) => {
      cy.createEdaProject().then((edaProject) => {
        cy.getEdaRulebooks(edaProject).then((edaRuleBooks) => {
          const edaRulebook = edaRuleBooks[0];
          cy.createEdaDecisionEnvironment().then((edaDecisionEnvironment) => {
            cy.createEdaRulebookActivation({
              rulebook_id: edaRulebook.id,
              decision_environment_id: edaDecisionEnvironment.id,
            }).then((edaRulebookActivation) => {
              //verify here once this functionality is working
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

  it.skip('can delete a Rulebook Activation from the details view', () => {
    // TODO: this tests running into 500 error, remove skip when it is fixed.
    //To DO: this tests running into 500 error, remove skip when it is fixed.
    cy.addEdaCurrentUserAwxToken(awxToken.token).then((activeUserToken) => {
      cy.createEdaProject().then((edaProject) => {
        cy.getEdaRulebooks(edaProject).then((edaRuleBooks) => {
          const edaRulebook = edaRuleBooks[0];
          cy.createEdaDecisionEnvironment().then((edaDecisionEnvironment) => {
            cy.createEdaRulebookActivation({
              rulebook_id: edaRulebook.id,
              decision_environment_id: edaDecisionEnvironment.id,
            }).then((edaRulebookActivation) => {
              cy.log('eda RBA', edaRulebookActivation.status);
              cy.intercept('GET', `/api/eda/v1/activations/${edaRulebookActivation.id}`).as(
                'getRBA'
              );
              cy.visit(`/eda/rulebook-activations/details/${edaRulebookActivation.id}`);
              cy.intercept('DELETE', `/api/eda/v1/activations/${edaRulebookActivation.id}/`).as(
                'deleted'
              );
              cy.clickPageAction(/^Delete rulebook activation$/);
              cy.clickModalConfirmCheckbox();
              cy.clickModalButton('Delete rulebook activations');
              cy.wait('@deleted').then((deleted) => {
                expect(deleted?.response?.statusCode).to.eql(204);
                cy.hasTitle(/^Rulebook Activations$/);
              });
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
