//Tests a user's ability to create, edit, and delete Rulebook Activations in the EDA UI.
// import { EdaRulebookActivation } from '../../../../frontend/eda/interfaces/EdaRulebookActivation';

describe('EDA Rulebook Activations- Create, Edit, Delete', () => {
  // let edarulebookactivation: EdaRulebookActivation;

  before(() => {
    cy.edaLogin();

    // cy.createEdaRulebookActivation().then((rulebookactivation) => {
    //   edarulebookactivation = rulebookactivation;
    // });
  });

  it.skip('can create a Rulebook Activation including custom variables, enable it, and assert the information showing on the details page', () => {
    cy.navigateTo(/^Rulebook activations$/);
  });

  it.skip('can edit a Rulebook Activation and then disable it', () => {
    //write test here
  });

  it.skip('can delete a Rulebook Activation from the details view', () => {
    //write test here
  });
});
