//Tests a user's ability to create, edit, and delete Rulebook Activations in the EDA UI.
//IMPORTANT: Rulebook Activations do not have Edit capability in the UI. They can only be enabled or disabled.
import { randomString } from '../../../../framework/utils/random-string';

describe('EDA Rulebook Activations- Create, Edit, Delete', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can create a Rulebook Activation including custom variables, enable it, and assert the information showing on the details page', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.waitEdaProjectSync(edaProject);
      cy.getEdaRulebooks(edaProject).then((edaRuleBooks) => {
        const edaRulebook = edaRuleBooks[0];
        const name = 'E2E Rulebook Activation ' + randomString(4);
        cy.visit('/eda/rulebook-activations/create');
        cy.clickButton(/^Add rulebook activation$/);
        cy.get('h1').should('contain', 'Create rulebook activation');
        cy.typeByLabel(/^Name$/, name);
        cy.typeByLabel(/^Description$/, 'This is a new rulebook activation.');
        cy.selectByLabel(/^Rulebook$/, edaRulebook.name);
        cy.selectFromDropdown(/^Restart policy$/, 'Always');
        cy.selectFromDropdown(/^Project$/, edaProject.name);
        cy.clickButton(/^Add rulebook activation$/);
        cy.get('h1').should('contain', name);
        cy.getEdaRulebookActivation(name).then((edaRulebookActivation) => {
          if (edaRulebookActivation) {
            cy.deleteEdaRulebookActivation(edaRulebookActivation);
          }
        });
      });
      cy.deleteEdaProject(edaProject);
    });
  });

  it.skip('can enable and disable a Rulebook Activation', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.getEdaRulebooks(edaProject).then((edaRuleBooks) => {
        const edaRulebook = edaRuleBooks[0];
        cy.createEdaRulebookActivation(edaRulebook).then((edaRulebookActivation) => {
          //verify here once this functionality is working
          cy.deleteEdaRulebookActivation(edaRulebookActivation);
        });
      });
      cy.deleteEdaProject(edaProject);
    });
  });

  it('can delete a Rulebook Activation from the details view', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.getEdaRulebooks(edaProject).then((edaRuleBooks) => {
        const edaRulebook = edaRuleBooks[0];
        cy.createEdaRulebookActivation(edaRulebook).then((edaRulebookActivation) => {
          cy.visit(`/eda/rulebook-activations/details/${edaRulebookActivation.id}`);
          cy.intercept('DELETE', `/api/eda/v1/activations/${edaRulebookActivation.id}/`).as(
            'deleted'
          );
          cy.clickPageAction(/^Delete rulebookActivation$/);
          cy.confirmModalAction('Delete rulebookActivations');
          cy.wait('@deleted').then((deleted) => {
            expect(deleted?.response?.statusCode).to.eql(204);
            cy.hasTitle(/^Rulebook activations$/);
          });
        });
      });
      cy.deleteEdaProject(edaProject);
    });
  });
});
