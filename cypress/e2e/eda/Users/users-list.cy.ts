//Tests a user's ability to perform certain actions on the Users list in the EDA UI.

import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('EDA Users List', () => {
  before(() => {
    cy.edaLogin();
  });

  it('renders the Users list page', () => {
    cy.navigateTo('eda', 'users');
    cy.verifyPageTitle('Users');
  });

  it('renders the Users details page and shows expected information', () => {
    cy.createEdaUser({
      is_superuser: true,
    }).then((edaUser) => {
      cy.navigateTo('eda', 'users');
      cy.setTablePageSize('100');
      cy.clickTableRow(edaUser.username, false);
      cy.contains(edaUser.username).click();
      cy.verifyPageTitle(edaUser.username);
      cy.clickLink(/^Details$/);
      cy.get('dd#username').should('contain', edaUser.username);
      cy.get('dd#user-type').should('contain', 'System administrator');
      cy.deleteEdaUser(edaUser);
    });
  });

  it('can bulk delete Users from the list', () => {
    cy.createEdaUser().then((userA) => {
      cy.createEdaUser({
        is_superuser: true,
      }).then((userB) => {
        cy.navigateTo('eda', 'users');
        cy.selectTableRow(userA.username, false);
        cy.selectTableRow(userB.username, false);
        cy.clickToolbarKebabAction('delete-selected-users');
        cy.intercept('DELETE', edaAPI`/users/${userA.id.toString()}/`).as('userA');
        cy.intercept('DELETE', edaAPI`/users/${userB.id.toString()}/`).as('userB');
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete users');
        cy.wait(['@userA', '@userB']).then((activationArr) => {
          expect(activationArr[0]?.response?.statusCode).to.eql(204);
          expect(activationArr[1]?.response?.statusCode).to.eql(204);
        });
        cy.assertModalSuccess();
        cy.clickButton(/^Close$/);
      });
    });
  });

  it('deletes a User from kebab menu from the project details page', () => {
    cy.createEdaUser().then((edaUser) => {
      cy.navigateTo('eda', 'users');
      cy.selectTableRow(edaUser.username, false);
      cy.clickToolbarKebabAction('delete-selected-users');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete user/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
    });
  });
});
