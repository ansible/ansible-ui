import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Project Delete', () => {
  let organization: Organization;
  let project: Project;
  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxProject(organization).then((proj) => {
        project = proj;
      });
    });
  });
  after(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  beforeEach(() => {
    cy.navigateTo('awx', 'projects');
    cy.verifyPageTitle('Projects');
    cy.filterTableByMultiSelect('name', [project.name]);
  });

  it('can get to the project delete dialog from the list toolbar', () => {
    cy.selectTableRowByCheckbox('name', `${project.name}`, { disableFilter: true });
    cy.clickToolbarKebabAction('delete-projects');
    expect(cy.getModal().contains('Permanently delete projects'));
    expect(cy.getModal().contains(project.name));
    cy.clickButton(/^Cancel$/);
  });

  it('can get to the project delete dialog from the project details page', () => {
    cy.clickTableRowLink('name', project.name, { disableFilter: true });
    cy.get('[data-cy="page-title"]').should('contain', `${project.name}`);
    cy.clickPageAction('delete-project');
    expect(cy.getModal().contains('Permanently delete projects'));
    expect(cy.getModal().contains(project.name));
    cy.clickButton(/^Cancel$/);
  });

  it('can get to the project delete dialog from the projects list row', () => {
    cy.clickTableRowAction('name', `${project.name}`, 'delete-project', {
      inKebab: true,
      disableFilter: true,
    });
    expect(cy.getModal().contains('Permanently delete projects'));
    expect(cy.getModal().contains(project.name));
    cy.clickButton(/^Cancel$/);
  });

  it('can delete a project', () => {
    cy.clickTableRowAction('name', `${project.name}`, 'delete-project', {
      inKebab: true,
      disableFilter: true,
    });
    cy.get('#confirm').click();
    cy.intercept('DELETE', awxAPI`/projects/${project.id.toString()}/`).as('deleted');
    cy.clickButton(/^Delete project/);
    cy.wait('@deleted')
      .its('response')
      .then((deleted) => {
        expect(deleted?.statusCode).to.eql(204);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
        cy.clearAllFilters();
      });
  });
});
