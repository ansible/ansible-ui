//Tests a user's ability to perform certain actions on the Rulebook Activations list in the EDA UI.
// import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';

describe('EDA Rulebook Activations List', () => {
  before(() => {
    cy.edaLogin();
    cy.createEdaProject().then((edaProject) => {
      cy.optionsWait(2000);
      cy.getEdaRulebooks(edaProject).then((edaRuleBooks) => {
        if (edaRuleBooks) {
          cy.createEdaRulebookActivation(edaRuleBooks[0]);
        }
      });
    });
  });

  it.skip('can filter the Rulebook Activations list based on Name', () => {
    // need to type in this element cy.get('.pf-c-text-input-group__text-input')
    cy.visit('/eda/rulebook-activations/');
    cy.contains('E2E Rulebook Activation').first().then((name) => {
      const unique_activation_id = name.text().split(" ").slice(-1).pop()
      cy.get('.pf-c-text-input-group__text-input').type(unique_activation_id + "{enter}");
      cy.get('div > a').filter(':contains("E2E Rulebook Activation")').should('have.length', 1)
      });
  });

  it('can Relaunch a Rulebook Activation from the list view', () => {
    //write test here
    // click on cy.get('#pf-dropdown-toggle-id-14')
    // then click cy.get(':nth-child(1) > .pf-m-icon') to relaunch
    cy.visit('/eda/rulebook-activations/');
    cy.contains('E2E Rulebook Activation').debug()
//    then((activationRow) => {
  });

  it.skip('can Restart a Rulebook Activation from the list view', () => {
    //write test here
    // click on cy.get('#pf-dropdown-toggle-id-14')
    // then click cy.get(':nth-child(2) > .pf-m-icon') to relaunch
    // verify that status is changed
  });

  it.skip('can delete a single Rulebook Activation from the line item on the list view', () => {
    //write test here
    // click on cy.get('#pf-dropdown-toggle-id-14')
    // then click cy.get(':nth-child(3) > .pf-m-icon') to relaunch
    // verify that status is changed
  });

  it.skip('can bulk delete Rulebook Activations from the list', () => {
    //write test here
    // add a second rulebook activation
    // click on multiple checkmarks cy.get('.pf-c-table__check > label > input')
    // click on 
    // click on cy.get('.pf-m-icon') to kick off deletion
    // verify that count of cy.get('[data-label="Name"]') is 0 (nothing in table)
    //
  });
});
