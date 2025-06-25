import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { Project } from '@ansible/awx-ui/interfaces/Project';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Project Edit, Copy, Sync', () => {
  let awxOrganization: Organization;
  let project: Project;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      awxOrganization = org;
    });
  });

  after(() => {
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  describe('Project Edit and Sync', () => {
    it('can edit a project from the project list row', () => {
      cy.createAwxProject(awxOrganization).then((proj) => {
        project = proj;
        cy.navigateTo('awx', 'projects');
        cy.verifyPageTitle('Projects');
        cy.intercept('GET', awxAPI`/projects/?*`).as('projectsList');
        cy.filterTableBySearch(project.name);
        cy.wait('@projectsList');
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
            cy.verifyPageTitle(`Edit ${edited.name}`);
            cy.get('[data-cy="name"]').clear().type(`${project.name}`);
            cy.clickButton(/^Save project$/);
            cy.verifyPageTitle(project.name);
          });
        cy.waitForProjectToFinishSyncing(project.id).then((syncedProject) => {
          cy.deleteAwxProject(syncedProject, { failOnStatusCode: false });
        });
      });
    });

    it('can edit a project from the project details page', () => {
      cy.createAwxProject(awxOrganization).then((proj) => {
        project = proj;
        cy.navigateTo('awx', 'projects');
        cy.verifyPageTitle('Projects');
        cy.intercept('GET', awxAPI`/projects/?*`).as('projectsList');
        cy.filterTableBySearch(project.name);
        cy.wait('@projectsList');
        cy.clickTableRowLink('name', project.name, { disableFilter: true });
        cy.verifyPageTitle(project.name);
        cy.clickButton(/^Edit project$/);
        cy.verifyPageTitle(`Edit ${project.name}`);
        cy.get('input[data-cy="name"]').clear().type(`${project.name} - edited`);
        cy.intercept('PATCH', awxAPI`/projects/${project.id.toString()}/`).as('edited');
        cy.clickButton(/^Save project$/);
        cy.wait('@edited')
          .its('response.body')
          .then((edited: Project) => {
            expect(edited.name).of.eql(`${project.name} - edited`);
            cy.verifyPageTitle(`${project.name} - edited`);
            cy.clickButton(/^Edit project$/);
            cy.verifyPageTitle(`Edit ${edited.name}`);
            cy.get('input[data-cy="name"]').clear().type(`${project.name}`);
            cy.clickButton(/^Save project$/);
            cy.verifyPageTitle(project.name);
          });
        cy.waitForProjectToFinishSyncing(project.id).then((syncedProject) => {
          cy.deleteAwxProject(syncedProject, { failOnStatusCode: false });
        });
      });
    });

    it('can copy a project from the projects list row', () => {
      cy.createAwxProject(awxOrganization).then((proj) => {
        project = proj;
        cy.navigateTo('awx', 'projects');
        cy.verifyPageTitle('Projects');
        cy.intercept('GET', awxAPI`/projects/?*search=*`).as('projectSearch');
        cy.filterTableBySearch(project.name);
        cy.wait('@projectSearch');
        cy.intercept('POST', awxAPI`/projects/${project.id.toString()}/copy/`).as('copiedProject');
        cy.clickTableRowAction('name', project.name, 'duplicate-project', {
          inKebab: true,
          disableFilter: true,
        });
        cy.wait('@copiedProject')
          .its('response.body')
          .then((copiedProject: Project) => {
            cy.waitForProjectToFinishSyncing(copiedProject.id);
            cy.filterTableBySearch(copiedProject.name).then(() => {
              cy.getTableRow('name', copiedProject.name, { disableFilter: true }).should(
                'be.visible'
              );
              cy.waitForProjectToFinishSyncing(copiedProject.id).then((syncedProject) => {
                cy.deleteAwxProject(syncedProject, { failOnStatusCode: false });
              });
            });
          });
      });
    });

    it('can copy a project from the project details page', () => {
      cy.createAwxProject(awxOrganization).then((proj) => {
        project = proj;
        cy.navigateTo('awx', 'projects');
        cy.verifyPageTitle('Projects');
        cy.intercept('GET', awxAPI`/projects/?*`).as('projectsList');
        cy.filterTableBySearch(project.name);
        cy.wait('@projectsList');
        cy.clickTableRowLink('name', project.name, { disableFilter: true });
        cy.intercept('POST', awxAPI`/projects/${project.id.toString()}/copy/`).as('copiedProject');
        cy.getBy(`[data-cy="actions-dropdown"]`).click();
        cy.getBy('[data-cy="duplicate-project"]').click();
        cy.wait('@copiedProject')
          .its('response.body')
          .then((copiedProject: Project) => {
            cy.waitForProjectToFinishSyncing(copiedProject.id).then((syncedProject) => {
              cy.deleteAwxProject(syncedProject, { failOnStatusCode: false });
            });
          });
      });
    });

    it('can sync a project from the projects list row', () => {
      cy.createAwxProject(awxOrganization).then((proj) => {
        project = proj;
        cy.navigateTo('awx', 'projects');
        cy.verifyPageTitle('Projects');
        cy.intercept('GET', awxAPI`/projects/?*`).as('projectsList');
        cy.filterTableBySearch(project.name);
        cy.wait('@projectsList');
        cy.intercept('POST', awxAPI`/projects/${project.id.toString()}/update/`).as(
          'projectUpdateRequest'
        );
        cy.clickTableRowAction('name', `${project.name}`, 'sync-project', { disableFilter: true });
        cy.wait('@projectUpdateRequest')
          .its('response.statusCode')
          .then((statusCode) => expect(statusCode).to.eql(202));
        cy.hasAlert(`Syncing ${project.name}`).should('be.visible');
        cy.waitForProjectToFinishSyncing(project.id).then((syncedProject) => {
          cy.deleteAwxProject(syncedProject, { failOnStatusCode: false });
        });
      });
    });

    it('can sync a project from the project details page', () => {
      cy.createAwxProject(awxOrganization).then((proj) => {
        project = proj;
        cy.navigateTo('awx', 'projects');
        cy.verifyPageTitle('Projects');
        cy.intercept('GET', awxAPI`/projects/?*`).as('projectsList');
        cy.filterTableBySearch(project.name);
        cy.wait('@projectsList');
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
        cy.waitForProjectToFinishSyncing(project.id).then((syncedProject) => {
          cy.deleteAwxProject(syncedProject, { failOnStatusCode: false });
        });
      });
    });
  });
});
