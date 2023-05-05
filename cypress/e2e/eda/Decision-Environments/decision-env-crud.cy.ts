//Tests a user's ability to create, edit, and delete an decision environment in the EDA UI.
import { randomString } from '../../../../framework/utils/random-string';
describe('EDA decision environment- Create, Edit, Delete', () => {
  before(() => {
    cy.edaLogin();
  });

  it('can render the decision environments list page', () => {
    cy.navigateTo(/^Decision Environments$/);
    cy.hasTitle(/^Decision Environments$/);
  });

  it('can create an decision environment and assert the information showing on the details page', () => {
    const de_name = 'E2E Decision Environment ' + randomString(4);
    cy.navigateTo(/^Decision Environments$/);
    cy.hasTitle(/^Decision Environments$/);
    cy.clickButton(/^Create decision environment$/);
    cy.typeInputByLabel(/^Name$/, de_name);
    cy.typeInputByLabel(/^Image$/, 'quay.io/ansible/ansible-rulebook:main');
    cy.clickButton(/^Create decision environment$/);
    cy.hasTitle(de_name);
    cy.getEdaDecisionEnvironmentByName(de_name).then((de) => {
      cy.wrap(de).should('not.be.undefined');
      if (de) cy.deleteEdaDecisionEnvironment(de);
    });
  });

  it.skip('can create an decision environment and test the connection', () => {
    //write test here
  });

  it('can verify edit functionality of a decision environment', () => {
    cy.createEdaDecisionEnvironment().then((edaDE) => {
      cy.navigateTo(/^Decision Environments$/);
      cy.hasTitle(/^Decision Environments$/);
      /*
      DE's are displayed by default in card view hence clickTableRow() doesn't work 
      cy.clickTableRow(edaDE.name);
      */
      cy.get('button[aria-label="table view"]').click();
      cy.contains('td', edaDE.name).within(() => {
        cy.get('a').click();
      });
      cy.clickButton(/^Edit decision environment$/);
      cy.hasTitle(`Edit ${edaDE.name}`);
      cy.typeInputByLabel(/^Name$/, edaDE.name + 'edited');
      cy.clickButton(/^Save decision environment$/);
      cy.hasTitle(`${edaDE.name}edited`);
      cy.deleteEdaDecisionEnvironment(edaDE);
    });
  });

  it.skip('can sync a decision environment to Controller', () => {
    //should this test be in this repo, or should it be moved to a private repo?
  });

  it('can delete a decision environment from the details page', () => {
    cy.createEdaDecisionEnvironment().then((edaDE) => {
      cy.navigateTo(/^Decision Environments$/);
      cy.hasTitle(/^Decision Environments$/);
      cy.get('button[aria-label="table view"]').click();
      cy.contains('td', edaDE.name).within(() => {
        cy.get('a').click();
      });
      cy.hasTitle(edaDE.name);
      cy.intercept('DELETE', `/api/eda/v1/decision-environments/${edaDE.id}/`).as('deleteDE');
      cy.clickPageAction(/^Delete decision environment$/);
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete decision environments');
      cy.wait('@deleteDE').then((deleteDE) => {
        expect(deleteDE?.response?.statusCode).to.eql(204);
      });
      cy.hasTitle(/^Decision Environments$/);
    });
  });
});
