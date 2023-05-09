//Tests the actions a user can perform on the tabs inside of a User in the EDA UI.
import { randomString } from '../../../../framework/utils/random-string';
import { AwxToken } from '../../../../frontend/awx/interfaces/AwxToken';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { EdaControllerToken } from '../../../../frontend/eda/interfaces/EdaControllerToken';

describe('EDA User Tokens Tab', () => {
  let awxToken: AwxToken;
  let edaProject: Project;
  before(() => {
    cy.createAwxToken().then((token) => {
      awxToken = token;
    });
    cy.createEdaSpecificAwxProject().then((project) => {
      edaProject = project;
    });
    cy.edaLogin();
  });

  after(() => {
    cy.deleteAwxToken(awxToken);
  });

  it('can add a new Token', () => {
    const newTokenName = 'E2E Token ' + randomString(8);
    cy.getEdaActiveUser().then((activeUser) => {
      cy.navigateTo('Users');
      cy.clickTableRow(activeUser?.username ?? '');
      cy.clickTab('Controller Tokens');
      cy.clickButton('Create controller token');
      cy.hasTitle('Create Controller Token');
      cy.typeInputByLabel('Name', newTokenName);
      cy.typeInputByLabel('Token', awxToken.token as string);
      cy.intercept('POST', '/api/eda/v1/users/me/awx-tokens/').as('created');
      cy.clickButton('Create controller token');
      cy.contains('td', newTokenName);
      cy.wait('@created')
        .its('response.body')
        .then((token: EdaControllerToken) => cy.deleteCurrentUserAwxToken(token));
    });
  });

  it('can delete a Token from the list', () => {
    cy.addCurrentUserAwxToken(awxToken.token as string).then((activeUserToken) => {
      cy.getEdaActiveUser().then((activeUser) => {
        cy.navigateTo('Users');
        cy.filterTableByText(activeUser?.username);
        cy.clickLink(activeUser?.username);
        cy.clickButton('Controller Tokens');
        cy.get('.pf-c-toggle-group__button').eq(2).click();
        cy.get(`#${activeUserToken.id}`).within(() => {
          cy.get('.toggle-kebab')
            .click()
            .then(() => {
              cy.get('li').click();
            });
        });
        cy.clickModalConfirmCheckbox();
        cy.intercept('DELETE', `/api/eda/v1/users/me/awx-tokens/${activeUserToken.id}/`).as(
          'deleted'
        );
        cy.clickModalButton('Delete controller tokens');
        cy.wait('@deleted').then((deleted) => {
          expect(deleted?.response?.statusCode).to.eql(204);
        });
        cy.assertModalSuccess();
      });
    });
  });
});
