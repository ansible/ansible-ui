//Tests a user's ability to create, edit, and delete Rulebook Activations in the EDA UI.
import { randomString } from '../../../../framework/utils/random-string';

describe('EDA Rulebook Activations- Create, Edit, Delete', () => {
  before(() => {
    cy.edaLogin();
  });

  it.only('can create a Rulebook Activation including custom variables, enable it, and assert the information showing on the details page', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.optionsWait(2000);
      cy.getEdaRulebooks(edaProject).then((edaRuleBooks) => {
        const edaRulebook = edaRuleBooks[0];
        const name = 'E2E Rulebook Activation ' + randomString(4);
        cy.visit('/eda/rulebook-activations/create');
        cy.clickButton(/^Add rulebook activation$/);
        cy.get('h1').should('contain', 'Create rulebook activation');
        cy.typeByLabel(/^Name$/, name);
        cy.typeByLabel(/^Description$/, 'This is a new rulebook activation.');
        cy.selectByLabel(/^Rulebook$/, edaRulebook.name, { disableSearch: true });
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

  it.skip('can edit a Rulebook Activation and then disable it', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.getEdaRulebooks(edaProject).then((edaRuleBooks) => {
        const edaRulebook = edaRuleBooks[0];
        cy.createEdaRulebookActivation(edaRulebook).then((edaRulebookActivation) => {
          // Verify
          cy.deleteEdaRulebookActivation(edaRulebookActivation);
        });
      });
      cy.deleteEdaProject(edaProject);
    });
  });

  it.skip('can delete a Rulebook Activation from the details view', () => {
    cy.createEdaProject().then((edaProject) => {
      cy.getEdaRulebooks(edaProject).then((edaRuleBooks) => {
        const edaRulebook = edaRuleBooks[0];
        cy.createEdaRulebookActivation(edaRulebook).then((edaRulebookActivation) => {
          // Verify
          cy.deleteEdaRulebookActivation(edaRulebookActivation);
        });
      });
      cy.deleteEdaProject(edaProject);
    });
  });
});
