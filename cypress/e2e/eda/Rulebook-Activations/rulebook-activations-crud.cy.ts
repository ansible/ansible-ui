//Tests a user's ability to create, edit, and delete Rulebook Activations in the EDA UI.
// import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';

describe('EDA Rulebook Activations- Create, Edit, Delete', () => {
  // let edarulebookactivation: EdaRulebookActivation;
  let project: EdaProject;

  before(() => {
    cy.edaLogin();

    // cy.createEdaRulebookActivation().then((rulebookactivation) => {
    //   edarulebookactivation = rulebookactivation;
    // });
  });

  after(() => {
    cy.deleteEdaProject(project);
  });

  it.only('can create a Rulebook Activation including custom variables, enable it, and assert the information showing on the details page', () => {
    cy.createEdaProject().then((proj) => {
      project = proj;
      cy.requestGet<EdaResult<EdaRulebook>>('/api/eda/v1/rulebooks/').then((rulebooks) => {
        const name = 'E2E Rulebook Activation ' + randomString(4);
        cy.navigateTo(/^Rulebook activations$/);
        cy.clickButton(/^Add rulebook activation$/);
        cy.get('h1').should('contain', 'Create rulebook activation');
        cy.typeByLabel(/^Name$/, name);
        cy.typeByLabel(/^Description$/, 'This is a new rulebook activation.');
        cy.selectFromDropdown(/^Rulebook$/, rulebooks.results[0].name);
        cy.selectFromDropdown(/^Restart policy$/, 'Always');
        cy.selectFromDropdown(/^Project$/, project.name);
        cy.clickButton(/^Add rulebook activation$/);
        cy.get('h1').should('contain', name);
        cy.clickPageAction(/^Delete rulebookActivation$/);
        cy.confirmModalAction('Delete rulebookActivation');
      });
    });
  });

  it.skip('can edit a Rulebook Activation and then disable it', () => {
    //write test here
  });

  it.skip('can delete a Rulebook Activation from the details view', () => {
    //write test here
  });
});
