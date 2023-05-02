//Tests a user's ability to perform certain actions on the Users list in the EDA UI.

describe('EDA Users List', () => {
  before(() => {
    cy.edaLogin();
  });

  it.skip('renders the Users list page', () => {
    cy.navigateTo(/^Users$/);
    cy.hasTitle(/^Users$/);
  });

  it.skip('renders the Users details page and shows expected information', () => {
    cy.createEdaUser().then((edaUser) => {
      cy.navigateTo(/^Users$/);
      cy.clickTableRow(edaUser.username);
      cy.hasTitle(edaUser.username);
      cy.clickButton(/^Details$/);
      cy.get('#name').should('contain', edaUser.username);
      cy.deleteEdaUser(edaUser);
    });
  });

  it.skip('can filter the Users list based on Name', () => {
    cy.createEdaUser().then((edaUser) => {
      cy.navigateTo(/^Users$/);
      cy.filterTableByText(edaUser.username);
      cy.get('td[data-label="Name"]').should('contain', edaUser.username);
      cy.deleteEdaUser(edaUser);
    });
  });

  it.skip('can bulk delete Users from the list', () => {
    cy.createEdaUser().then((edaUser1) => {
      cy.createEdaUser().then((edaUser2) => {
        cy.navigateTo(/^Users$/);
        cy.selectTableRow(edaUser1.username);
        cy.selectTableRow(edaUser2.username);
        cy.clickToolbarKebabAction(/^Delete selected users$/);
        cy.intercept('DELETE', `/api/eda/v1/users/${edaUser1.id}/`).as('edaUser1');
        cy.intercept('DELETE', `/api/eda/v1/users/${edaUser2.id}/`).as('edaUser2');
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete users');
        cy.wait(['@edaUser1', '@edaUser2']).then((activationArr) => {
          expect(activationArr[0]?.response?.statusCode).to.eql(204);
          expect(activationArr[1]?.response?.statusCode).to.eql(204);
        });
        cy.assertModalSuccess();
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });

  it.skip('deletes a User from kebab menu from the project details page', () => {
    cy.createEdaUser().then((edaUser) => {
      cy.navigateTo(/^Users$/);
      cy.selectTableRow(edaUser.username);
      cy.clickToolbarKebabAction(/^Delete selected users$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete user/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it.skip('can view the groups that the user is associated with', () => {
    // TODO: needs further work when Users page is functional
  });
});
