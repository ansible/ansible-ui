/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />
import { cyLabel } from '../../../support/cyLabel';
import { edaAPI } from '../../../support/formatApiPathForEDA';
import { EdaOrganization } from '../../../../frontend/eda/interfaces/EdaOrganization';

cyLabel(['aaas-unsupported'], function () {
  describe('EDA Projects List', () => {
    let edaOrg: EdaOrganization;
    before(() => {
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
      });
    });
    after(() => {
      cy.deleteEdaOrganization(edaOrg);
    });
    it('renders the EDA projects page', () => {
      cy.navigateTo('eda', 'projects');
      cy.verifyPageTitle('Projects');
    });

    it('renders the Project details page', () => {
      cy.createEdaProject(edaOrg?.id).then((edaProject) => {
        cy.navigateTo('eda', 'projects');
        cy.clickTableRow(edaProject.name);
        cy.verifyPageTitle(edaProject.name);
        cy.clickLink(/^Details$/);
        cy.verifyPageTitle(edaProject.name);
        cy.deleteEdaProject(edaProject);
      });
    });

    it('can filter the Projects list based on Name', () => {
      cy.createEdaProject(edaOrg?.id).then((edaProject) => {
        cy.navigateTo('eda', 'projects');
        cy.filterTableByText(edaProject.name);
        cy.get('td[data-cy=name-column-cell]').should('contain', edaProject.name);
        cy.deleteEdaProject(edaProject);
      });
    });

    it('can bulk delete Projects from the Projects list', () => {
      cy.createEdaProject(edaOrg?.id).then((edaProject) => {
        cy.createEdaProject(edaOrg?.id).then((testProject) => {
          cy.navigateTo('eda', 'projects');
          cy.selectTableRow(edaProject.name);
          cy.clickButton(/^Clear all filters$/);
          cy.selectTableRow(testProject.name);
          cy.clickToolbarKebabAction('delete-projects');
          cy.intercept('DELETE', edaAPI`/projects/${edaProject.id.toString()}/`).as('edaProject');
          cy.intercept('DELETE', edaAPI`/projects/${testProject.id.toString()}/`).as('testProject');
          cy.clickModalConfirmCheckbox();
          cy.clickModalButton('Delete projects');
          cy.wait('@edaProject').then((edaProject) => {
            expect(edaProject?.response?.statusCode).to.eql(204);
          });
          cy.wait('@testProject').then((testProject) => {
            expect(testProject?.response?.statusCode).to.eql(204);
          });
          cy.assertModalSuccess();
          cy.clickButton(/^Close$/);
          cy.clickButton(/^Clear all filters$/);
        });
      });
    });
  });
});
