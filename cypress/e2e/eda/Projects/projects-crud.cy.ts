/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

//Tests a user's ability to create, edit, and delete a Project in the EDA UI.
import { EdaOrganization } from '@ansible/eda-ui/interfaces/EdaOrganization';
import { edaAPI } from '../../../support/formatApiPathForEDA';

describe('Check if the build includes EDA', () => {
  before(function () {
    cy.getPlatformApis().then((data) => {
      if (data?.apis && !data?.apis?.eda) {
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });
  describe('EDA Projects CRUD', () => {
    let edaOrg: EdaOrganization;
    before(() => {
      cy.createEdaOrganization().then((organization) => {
        edaOrg = organization;
      });
    });
    after(() => {
      cy.deleteEdaOrganization(edaOrg);
    });

    it('can edit a project from the project details page', () => {
      cy.createEdaProject(edaOrg?.id).then((edaProject) => {
        cy.waitEdaProjectSync(edaProject);
        cy.navigateTo('eda', 'projects');
        cy.verifyPageTitle('Projects');
        cy.clickTableRow(edaProject.name);
        cy.verifyPageTitle(`${edaProject.name}`);
        cy.getByDataCy('edit-project').click();
        cy.verifyPageTitle(`Edit ${edaProject.name}`);
        cy.getByDataCy('name')
          .clear()
          .type(edaProject.name + ' edited');
        cy.clickButton(/^Save project$/);
        cy.verifyPageTitle(`${edaProject.name} edited`);
        cy.deleteEdaProject(edaProject);
      });
    });

    it('deletes a Project from kebab menu from the project details page', () => {
      cy.createEdaProject(edaOrg?.id).then((edaProject) => {
        cy.waitEdaProjectSync(edaProject);
        cy.navigateTo('eda', 'projects');
        cy.clickTableRow(edaProject.name);
        cy.verifyPageTitle(edaProject.name);
        cy.url().should('contain', '/details');
        cy.intercept('DELETE', edaAPI`/projects/${edaProject.id.toString()}/`).as('deleted');
        cy.getByDataCy('actions-dropdown').click();
        cy.getBy('button[id="delete-project"]').click();
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete projects');
        cy.wait('@deleted').then((deleted) => {
          expect(deleted?.response?.statusCode).to.eql(204);
          cy.verifyPageTitle('Projects');
        });
      });
    });
  });
});
