import { Organization } from '../../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../../frontend/awx/interfaces/Project';
import { awxAPI } from '../../../../support/formatApiPathForAwx';

describe('Project Edit, Copy, Sync', () => {
  let awxOrganization: Organization;
  let project: Project;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      awxOrganization = org;
      cy.createAwxProject(awxOrganization).then((proj) => (project = proj));
    });
  });

  after(() => {
    cy.waitForProjectToFinishSyncing(project.id).then((syncedProject) => {
      cy.deleteAwxProject(syncedProject, { failOnStatusCode: false });
    });
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  beforeEach(() => {
    cy.navigateTo('awx', 'projects');
    cy.verifyPageTitle('Projects');
    cy.filterTableByMultiSelect('name', [project.name]);
  });

  describe('Project Edit and Sync', () => {
    it('can edit a project from the project list row', () => {
      cy.get(`[data-cy="row-id-${project.id}"]`).within(() => {
        cy.get('[data-cy="edit-project"]').click();
      });
      cy.verifyPageTitle(`Edit ${project.name}`);
      cy.get('[data-cy="name"]').should('have.value', `${project.name}`);
      cy.get('[data-cy="name"]').clear().type(`${project.name} - edited`);
      cy.intercept('PATCH', awxAPI`/projects/${project.id.toString()}/`).as('edited');
      cy.clickButton(/^Save project$/);
      cy.wait('@edited')
        .its('response.body')
        .then((edited: Project) => {
          expect(edited.name).to.eql(`${project.name} - edited`);
          cy.verifyPageTitle(`${edited.name}`);
          cy.clickButton(/^Edit project$/);
          cy.get('[data-cy="name"]').clear().type(`${project.name}`);
          cy.clickButton(/^Save project$/);
          cy.verifyPageTitle(project.name);
        });
    });

    it('can edit a project from the project details page', () => {
      cy.clickTableRowLink('name', project.name, { disableFilter: true });
      cy.verifyPageTitle(project.name);
      cy.clickButton(/^Edit project$/);
      cy.verifyPageTitle(`Edit ${project.name}`);
      cy.get('[data-cy="name"]').clear().type(`${project.name} - edited`);
      cy.intercept('PATCH', awxAPI`/projects/${project.id.toString()}/`).as('edited');
      cy.clickButton(/^Save project$/);
      cy.wait('@edited')
        .its('response.body')
        .then((edited: Project) => {
          expect(edited.name).of.eql(`${project.name} - edited`);
          cy.verifyPageTitle(`${project.name} - edited`);
          cy.clickButton(/^Edit project$/);
          cy.get('[data-cy="name"]').clear().type(`${project.name}`);
          cy.clickButton(/^Save project$/);
          cy.verifyPageTitle(project.name);
        });
    });

    it('can copy a project from the projects list row', () => {
      cy.intercept('POST', awxAPI`/projects/${project.id.toString()}/copy/`).as('copiedProject');
      cy.clickTableRowAction('name', project.name, 'copy-project', {
        inKebab: true,
        disableFilter: true,
      });
      cy.wait('@copiedProject')
        .its('response.body')
        .then((copiedProject: Project) => {
          cy.waitForProjectToFinishSyncing(copiedProject.id);
          cy.filterTableByMultiSelect('name', [project.name, copiedProject.name]).then(() => {
            cy.getTableRow('name', project.name, { disableFilter: true }).should('be.visible');
            cy.getTableRow('name', copiedProject.name, { disableFilter: true }).should(
              'be.visible'
            );
            cy.waitForProjectToFinishSyncing(copiedProject.id).then((syncedProject) => {
              cy.deleteAwxProject(syncedProject, { failOnStatusCode: false });
            });
          });
        });
    });

    it('can copy a project from the project details page', () => {
      cy.clickTableRowLink('name', project.name, { disableFilter: true });
      cy.intercept('POST', awxAPI`/projects/${project.id.toString()}/copy/`).as('copiedProject');
      cy.clickKebabAction('actions-dropdown', 'copy-project');
      cy.wait('@copiedProject')
        .its('response.body')
        .then((copiedProject: Project) => {
          cy.waitForProjectToFinishSyncing(copiedProject.id).then((syncedProject) => {
            cy.deleteAwxProject(syncedProject, { failOnStatusCode: false });
          });
        });
    });

    it('can sync a project from the projects list row', () => {
      cy.intercept('POST', awxAPI`/projects/${project.id.toString()}/update/`).as(
        'projectUpdateRequest'
      );
      cy.clickTableRowAction('name', `${project.name}`, 'sync-project', { disableFilter: true });
      cy.wait('@projectUpdateRequest')
        .its('response.statusCode')
        .then((statusCode) => expect(statusCode).to.eql(202));
      cy.hasAlert(`Syncing ${project.name}`).should('be.visible');
    });

    it('can sync a project from the project details page', () => {
      cy.clickTableRowLink('name', project.name, { disableFilter: true });
      cy.verifyPageTitle(`${project.name}`);
      cy.intercept('POST', awxAPI`/projects/${project.id.toString()}/update/`).as(
        'projectUpdateRequest'
      );
      cy.clickButton(/^Sync project$/);
      cy.wait('@projectUpdateRequest')
        .its('response')
        .then((update) => {
          expect(update?.statusCode).to.eql(202);
        });
    });
  });
});
