import { EdaControllerToken } from '../../../../frontend/eda/interfaces/EdaControllerToken';
describe('EDA Admin User', () => {
  before(() => {
    cy.edaLogin();
  });

  const checkEmptyState = () => {
    cy.contains('h4', 'You currently do not have any tokens from Automation Controller.');
    cy.contains(
      'div',
      'Please create a token from Automation Controller by using the button below.'
    );
    cy.contains('button', 'Create controller token').should('be.enabled');
  };

  it('checks the empty state for Controller token page and create Controller token CTA does not exist with existing token', () => {
    cy.intercept('GET', 'api/eda/v1/users/me/awx-tokens/?page=1&page_size=10').as('checkToken');
    cy.navigateTo(/^Users$/);
    cy.contains('h1', 'Users');
    cy.contains(
      'p',
      'A user is someone who has access to EDA with associated permissions and credentials.'
    );
    cy.contains('a', 'admin').click();
    cy.contains('li', 'Controller Tokens').click();
    cy.wait('@checkToken')
      .its('response.body.results')
      .then((results: Array<EdaControllerToken>) => {
        if (results.length === 0) {
          checkEmptyState();
        } else {
          cy.get('tbody').children('tr').should('exist');
          cy.contains('button', 'Create controller token').should('not.exist');
        }
      });
  });
});
