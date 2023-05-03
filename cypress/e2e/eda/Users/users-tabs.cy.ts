//Tests the actions a user can perform on the tabs inside of a User in the EDA UI.
import { randomString } from '../../../../framework/utils/random-string';
import { AwxToken } from '../../../../frontend/awx/interfaces/AwxToken';

describe('EDA User Tokens Tab', () => {
  let awxToken: AwxToken;
  before(() => {
    cy.createAwxToken().then((token) => {
      awxToken = token;
    });
    cy.edaLogin();
  });

  it('can add a new Token', () => {
    const newTokenName = 'E2E Token ' + randomString(8);
    cy.getEdaUser().then((activeUser) => {
      cy.navigateTo('Users');
      cy.clickTableRow(activeUser.username);
      cy.clickTab('Controller Tokens');
      cy.clickButton('Create controller token');
      cy.hasTitle('Create Controller Token');
      cy.typeInputByLabel('Name', newTokenName);
      cy.typeInputByLabel('Token', awxToken.token);
      cy.clickButton('Create controller token');
      cy.contains('td', newTokenName);
    });
  });

  it.skip('can verify the functionality of items in the kebab menu on the Tokens list view', () => {
    //disable ruleset
  });

  it.skip('can bulk delete Tokens from the list', () => {
    //disable ruleset
  });
});
