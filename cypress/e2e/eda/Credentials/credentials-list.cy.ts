//Tests a user's ability to perform certain actions on the Credentials list in the EDA UI.
import { edaAPI } from '../../../support/formatApiPathForEDA';
import { tag } from '../../../support/tag';

tag(['aaas-unsupported'], function () {
  describe('EDA Credentials List', () => {
    it('renders the Credentials list page', () => {
      cy.navigateTo('eda', 'credentials');
      cy.verifyPageTitle('Credentials');
    });

    it('renders the Credentials details page and shows expected information', () => {
      cy.createEdaCredential().then((edaCredential) => {
        cy.navigateTo('eda', 'credentials');
        cy.clickTableRow(edaCredential.name);
        cy.verifyPageTitle(edaCredential.name);
        cy.clickLink(/^Details$/);
        cy.get('[data-cy="name"]').should('contain', edaCredential.name);
        cy.deleteEdaCredential(edaCredential);
      });
    });

    it('can filter the Credentials list based on Name', () => {
      cy.createEdaCredential().then((edaCredential) => {
        cy.navigateTo('eda', 'credentials');
        cy.filterTableByText(edaCredential.name);
        cy.get('td[data-label="Name"]').should('contain', edaCredential.name);
        cy.deleteEdaCredential(edaCredential);
      });
    });

    it('can bulk delete Credentials from the Credentials list', () => {
      cy.createEdaCredential().then((edaCredential) => {
        cy.createEdaCredential().then((testCredential) => {
          cy.navigateTo('eda', 'credentials');
          cy.selectTableRow(edaCredential.name);
          cy.clearAllFilters();
          cy.selectTableRow(testCredential.name);
          cy.clickToolbarKebabAction('delete-credentials');
          cy.intercept('DELETE', edaAPI`/eda-credentials/${edaCredential.id.toString()}/`).as(
            'edaCredential'
          );
          cy.intercept('DELETE', edaAPI`/eda-credentials/${testCredential.id.toString()}/`).as(
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
});
