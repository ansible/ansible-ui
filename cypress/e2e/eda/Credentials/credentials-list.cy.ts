//Tests a user's ability to perform certain actions on the Credentials list in the EDA UI.

describe('EDA Credentials List', () => {
  before(() => {
    cy.edaLogin();
  });

  it('renders the Credentials list page', () => {
    cy.navigateTo(/^Credentials$/);
    cy.hasTitle(/^Credentials$/);
  });

  it('renders the Credentials details page and shows expected information', () => {
    cy.createEdaCredential().then((edaCredential) => {
      cy.navigateTo(/^Credentials$/);
      cy.clickTableRow(edaCredential.name);
      cy.hasTitle(edaCredential.name);
      cy.clickButton(/^Details$/);
      cy.get('#name').should('contain', edaCredential.name);
      cy.deleteEdaCredential(edaCredential);
    });
  });

  it('can filter the Credentials list based on Name', () => {
    cy.createEdaCredential().then((edaCredential) => {
      cy.navigateTo(/^Credentials$/);
      cy.filterTableByText(edaCredential.name);
      cy.get('td[data-label="Name"]').should('contain', edaCredential.name);
      cy.deleteEdaCredential(edaCredential);
    });
  });

  it('can bulk delete Credentials from the Credentials list', () => {
    cy.createEdaCredential().then((edaCredential) => {
      cy.createEdaCredential().then((testCredential) => {
        cy.navigateTo(/^Credentials$/);
        cy.selectTableRow(edaCredential.name);
        cy.selectTableRow(testCredential.name);
        cy.clickToolbarKebabAction(/^Delete selected credentials$/);
        cy.intercept('DELETE', `/api/eda/v1/credentials/${edaCredential.id}/`).as('edaCredential');
        cy.intercept('DELETE', `/api/eda/v1/credentials/${testCredential.id}/`).as(
          'testCredential'
        );
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete credentials');
        cy.wait('@edaCredential').then((edaCredential) => {
          expect(edaCredential?.response?.statusCode).to.eql(204);
        });
        cy.wait('@testCredential').then((testCredential) => {
          expect(testCredential?.response?.statusCode).to.eql(204);
        });
        cy.assertModalSuccess();
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });
});
