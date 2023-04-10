//Tests a user's ability to perform certain actions on the Rulebook Activations list in the EDA UI.
import { EdaProject } from '../../../../frontend/eda/interfaces/EdaProject';
import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';

describe('EDA Rulebook Activations List', () => {
  let edaProject: EdaProject
  let edaRulebookActivation: EdaRulebookActivation
  before(() => {
    cy.edaLogin();
    cy.createEdaProject().then((project) => {
      edaProject = project
//      cy.waitEdaProjectSync(edaProject);
      cy.getEdaRulebooks(edaProject).then((edaRuleBooks) => {
        if (edaRuleBooks) {
          cy.createEdaRulebookActivation(edaRuleBooks[0]).then((result) => {
            edaRulebookActivation = result;
          });
          cy.createEdaRulebookActivation(edaRuleBooks[0]); // create a second rulebook for filter test
        };
      });
    });
  });
  after(() => {
    cy.deleteEdaRulebookActivation(edaRulebookActivation);
    cy.deleteEdaProject(edaProject);
  });

  it('can filter the Rulebook Activations list based on Name', () => {
    // need to type in this element cy.get('.pf-c-text-input-group__text-input')
    cy.visit('/eda/rulebook-activations/');
    cy.switchToolbarFilter('Name');
    cy.filterByText(edaRulebookActivation.name.split(' ').pop())
    cy.verifyTableLength(1); // only one item should match the name of the uploaded rulebook
  });

  it.skip('can Relaunch a Rulebook Activation from the list view', () => {
    //write test here
    // click on cy.get('#pf-dropdown-toggle-id-14')
    // then click cy.get(':nth-child(1) > .pf-m-icon') to relaunch
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
