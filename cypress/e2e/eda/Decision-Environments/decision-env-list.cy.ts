//Tests a user's ability to perform certain actions on the Decision Environment list in the EDA UI.
import { edaAPI } from '../../../support/formatApiPathForEDA';
import { tag } from '../../../support/tag';

tag(['aaas-unsupported'], function () {
  describe('EDA Decision Environment List', () => {
    it('can filter the Decision Environment list based on Name filter option', () => {
      cy.createEdaDecisionEnvironment().then((edaDE) => {
        cy.navigateTo('eda', 'decision-environments');
        cy.verifyPageTitle('Decision Environments');
        cy.setTableView('table');
        cy.filterTableByTextFilter('name', edaDE.name, { disableFilterSelection: true });
        cy.contains('td', edaDE.name).should('be.visible');
        cy.deleteEdaDecisionEnvironment(edaDE);
      });
    });

    it('can bulk delete Decision Environments from the list', () => {
      cy.createEdaDecisionEnvironment().then((edaDE1) => {
        cy.createEdaDecisionEnvironment().then((edaDE2) => {
          cy.navigateTo('eda', 'decision-environments');
          cy.verifyPageTitle('Decision Environments');
          cy.setTableView('table');
          cy.selectTableRowByCheckbox('name', edaDE1.name, { disableFilterSelection: true });
          cy.selectTableRowByCheckbox('name', edaDE2.name, { disableFilterSelection: true });
          cy.clickToolbarKebabAction('delete-decision-environments');
          cy.intercept('DELETE', edaAPI`/decision-environments/${edaDE1.id.toString()}/`).as(
            'edaDE1'
          );
          cy.intercept('DELETE', edaAPI`/decision-environments/${edaDE2.id.toString()}/`).as(
            'edaDE2'
          );
          cy.clickModalConfirmCheckbox();
          cy.clickModalButton('Delete decision environments');
          cy.wait(['@edaDE1', '@edaDE2']).then((edaArr) => {
            expect(edaArr[0]?.response?.statusCode).to.eql(204);
            expect(edaArr[1]?.response?.statusCode).to.eql(204);
          });
          cy.assertModalSuccess();
          cy.clickButton(/^Close$/);
          cy.clickButton(/^Clear all filters$/);
        });
      });
    });

    it('can verify the delete functionality of items in the kebab menu of the DE list view', () => {
      cy.createEdaDecisionEnvironment().then((edaDE) => {
        cy.navigateTo('eda', 'decision-environments');
        cy.verifyPageTitle('Decision Environments');
        cy.setTableView('table');
        cy.filterTableByTextFilter('name', edaDE.name, { disableFilterSelection: true });
        cy.setTableView('card');
        cy.clickListCardKebabAction(edaDE.id, 'delete-decision-environment');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete decision environment/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
        cy.verifyPageTitle('Decision Environments');
      });
    });
  });
});
