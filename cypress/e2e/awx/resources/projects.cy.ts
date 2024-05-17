/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { randomString } from '../../../../framework/utils/random-string';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Schedule } from '../../../../frontend/awx/interfaces/Schedule';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Projects', () => {
  let schedule: Schedule;
  let project: Project;
  let thisProject: Project;
  let organization: Organization;
  let user: AwxUser;

  before(function () {
    cy.awxLogin();
  });

  describe('Projects: List View', () => {
    beforeEach(function () {
      cy.createAwxOrganization().then((org) => {
        organization = org;
        cy.createAwxUser(organization).then((testUser) => {
          user = testUser;
          cy.createAwxProject({ organization: organization.id }).then((proj) => {
            project = proj;
            cy.giveUserProjectAccess(project.name, user.id, 'Read');
          });
        });
      });
    });

    afterEach(() => {
      cy.deleteAwxProject(project, { failOnStatusCode: false });
      cy.deleteAwxUser(user, { failOnStatusCode: false });
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    });

    it('can create a project and then delete it from the project details page', function () {
      const projectName = 'E2E Project ' + randomString(4);
      cy.navigateTo('awx', 'projects');
      cy.verifyPageTitle('Projects');
      cy.clickLink(/^Create project$/);
      cy.get('[data-cy="name"]').type(projectName);
      cy.singleSelectByDataCy('organization', `${(this.globalOrganization as Organization).name}`);
      cy.selectDropdownOptionByResourceName('source_control_type', 'Git');
      cy.get('[data-cy="scm-url"]').type('https://github.com/ansible/ansible-ui');
      cy.get('[data-cy="option-allow-override"]').click();
      cy.intercept('POST', awxAPI`/projects/`).as('newProject');
      cy.clickButton(/^Create project$/);
      cy.wait('@newProject')
        .its('response.body')
        .then((newProject: Project) => {
          cy.verifyPageTitle(newProject.name);
          cy.hasDetail(/^Organization$/, `${(this.globalOrganization as Organization).name}`);
          cy.hasDetail(/^Source control type$/, 'Git');
          cy.hasDetail(/^Enabled options$/, 'Allow branch override');
          cy.waitForProjectToFinishSyncing(newProject.id);
          cy.intercept('DELETE', awxAPI`/projects/${newProject.id.toString()}/`).as('deleted');
          cy.clickPageAction('delete-project');
          cy.get('#confirm').click();
          cy.clickButton(/^Delete project/);
          cy.wait('@deleted').then((deleted) => {
            expect(deleted?.response?.statusCode).to.eql(204);
            cy.getModal().within(() => {
              cy.contains('Permanently delete projects');
            });
          });
        });
    });

    it('can edit a project from the project list row', () => {
      cy.navigateTo('awx', 'projects');
      cy.verifyPageTitle('Projects');
      cy.filterTableByMultiSelect('name', [project.name]);
      cy.get(`[data-cy="row-id-${project.id}"]`).within(() => {
        cy.get('[data-cy="edit-project"]').click();
      });
      cy.verifyPageTitle('Edit Project');
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

    it('can copy a project from the projects list row', function () {
      const endOfProject = project.name.split(' ').slice(-1).toString();
      cy.navigateTo('awx', 'projects');
      cy.verifyPageTitle('Projects');
      cy.filterTableByMultiSelect('name', [endOfProject]);
      cy.intercept('POST', awxAPI`/projects/${project.id.toString()}/copy/`).as('copiedProject');
      cy.clickTableRowAction('name', `${endOfProject}`, 'copy-project', {
        inKebab: true,
        disableFilter: true,
      });
      cy.wait('@copiedProject')
        .its('response.body')
        .then((response: Project) => {
          cy.waitForProjectToFinishSyncing(response.id);
          cy.filterTableByMultiSelect('name', [project.name, project.name, response.name]).then(
            () => {
              cy.get('#filter-input').click();
              cy.getTableRow('name', project.name, { disableFilter: true }).should('be.visible');
              cy.getTableRow('name', response.name, { disableFilter: true }).should('be.visible');
              cy.clickTableRowAction('name', `${response.name}`, 'delete-project', {
                inKebab: true,
                disableFilter: true,
              });
              cy.getModal().within(() => {
                cy.get('#confirm').click();
                cy.get('[data-ouia-component-id="submit"]').click();
                cy.clickButton('Close');
              });
            }
          );
        });
    });

    it('can sync a project from the projects list row', function () {
      cy.navigateTo('awx', 'projects');
      cy.verifyPageTitle('Projects');
      cy.filterTableByMultiSelect('name', [project.name]);
      cy.intercept(`api/v2/projects/${project.id}/update/`).as('projectUpdateRequest');
      cy.clickTableRowAction('name', `${project.name}`, 'sync-project', {
        disableFilter: true,
      });
      cy.hasAlert(`Syncing ${project.name}`).should('be.visible');
      cy.waitForProjectToFinishSyncing(project.id);
      cy.wait('@projectUpdateRequest')
        .its('response')
        .then((response) => {
          expect(response.statusCode).to.eql(202);
        });
    });

    it('can delete a project from the projects list row', function () {
      cy.navigateTo('awx', 'projects');
      cy.verifyPageTitle('Projects');
      cy.filterTableByMultiSelect('name', [project.name]);
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
          expect(deleted.statusCode).to.eql(204);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clearAllFilters();
        });
    });

    it('can delete a project from projects list toolbar', function () {
      const endOfProject = project.name.split(' ').slice(-1).toString();
      cy.navigateTo('awx', 'projects');
      cy.verifyPageTitle('Projects');
      cy.filterTableByMultiSelect('name', [endOfProject]);
      cy.selectTableRowByCheckbox('name', `${project.name}`, { disableFilter: true });
      cy.intercept('DELETE', awxAPI`/projects/${project.id.toString()}/`).as('deleted');
      cy.clickToolbarKebabAction('delete-selected-projects');
      cy.get('#confirm').click();
      cy.get('button[data-ouia-component-id="submit"]').click();
      cy.wait('@deleted')
        .its('response')
        .then((deleted) => {
          expect(deleted.statusCode).to.eql(204);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clearAllFilters();
        });
    });
  });

  describe('Projects: Details View', () => {
    beforeEach(function () {
      cy.createAwxOrganization().then((org) => {
        organization = org;
        cy.createAwxUser(organization).then((testUser) => {
          user = testUser;
          cy.createAwxProject({ organization: organization.id }).then((proj) => {
            project = proj;
            cy.giveUserProjectAccess(project.name, user.id, 'Read');
          });
        });
      });
    });

    afterEach(() => {
      cy.deleteAwxProject(project, { failOnStatusCode: false });
      cy.deleteAwxUser(user, { failOnStatusCode: false });
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    });

    it('can edit a project from the project details page', () => {
      cy.navigateTo('awx', 'projects');
      cy.filterTableByMultiSelect('name', [project.name]);
      cy.clickTableRowLink('name', project.name, {
        disableFilter: true,
      });
      cy.verifyPageTitle(project.name);
      cy.clickButton(/^Edit project$/);
      cy.verifyPageTitle('Edit Project');
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

    it('can copy a project from the project details page', function () {
      const endOfProject = project.name.split(' ').slice(-1).toString();
      cy.navigateTo('awx', 'projects');
      cy.verifyPageTitle('Projects');
      cy.filterTableByMultiSelect('name', [endOfProject]);
      cy.get(`[data-cy="row-id-${project.id}"]`).within(() => {
        cy.get('[data-cy="name-column-cell"]').click();
      });
      cy.intercept('POST', awxAPI`/projects/${project.id.toString()}/copy/`).as('copiedProject');
      cy.get('[data-cy="actions-dropdown"]')
        .click()
        .then(() => {
          cy.get('[data-cy="copy-project"]').click();
        });
      cy.wait('@copiedProject')
        .its('response.body')
        .then((response: Project) => {
          cy.waitForProjectToFinishSyncing(response.id);
          cy.get('[data-cy="Projects"]').eq(1).click();
          cy.verifyPageTitle('Projects');
          cy.filterTableByMultiSelect('name', [response.name]).then(() => {
            cy.get('#filter-input').click();
            cy.getTableRow('name', response.name, { disableFilter: true }).should('be.visible');
            cy.clickTableRowAction('name', `${response.name}`, 'delete-project', {
              inKebab: true,
              disableFilter: true,
            });
            cy.getModal().within(() => {
              cy.get('#confirm').click();
              cy.get('[data-ouia-component-id="submit"]').click();
              cy.clickButton('Close');
            });
          });
        });
    });

    it('can sync a project from the project details page', function () {
      cy.navigateTo('awx', 'projects');
      cy.verifyPageTitle('Projects');
      cy.filterTableByMultiSelect('name', [project.name]);
      cy.clickTableRowLink('name', project.name, {
        disableFilter: true,
      });
      cy.verifyPageTitle(`${project.name}`);
      cy.intercept(`api/v2/projects/${project.id}/update/`).as('projectUpdateRequest');
      cy.clickButton(/^Sync project$/);
      cy.get('[data-cy="last-job-status"]').should('contain', 'Running');
      cy.waitForProjectToFinishSyncing(project.id);
      cy.wait('@projectUpdateRequest')
        .its('response')
        .then((update) => {
          expect(update.statusCode).to.eql(202);
        });
    });

    it('can delete a project from project details page', function () {
      cy.navigateTo('awx', 'projects');
      cy.verifyPageTitle('Projects');
      cy.filterTableByMultiSelect('name', [project.name]);
      cy.clickTableRowLink('name', project.name, { disableFilter: true });
      cy.get('[data-cy="page-title"]').should('contain', `${project.name}`);
      cy.intercept('DELETE', awxAPI`/projects/${project.id.toString()}/`).as('deleted');
      cy.clickPageAction('delete-project');
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.clickButton(/^Delete project/);
        cy.wait('@deleted')
          .its('response')
          .then((deleted) => {
            expect(deleted.statusCode).to.eql(204);
          });
      });
      cy.verifyPageTitle('Projects');
    });
  });

  describe('Projects: Access Tab', () => {
    //More testing will be needed here- add later
    it('can navigate to project access tab', function () {
      cy.navigateTo('awx', 'projects');
      cy.filterTableByMultiSelect('name', [(this.globalProject as Project).name]);
      cy.clickTableRowLink('name', `${(this.globalProject as Project).name}`, {
        disableFilter: true,
      });
      cy.verifyPageTitle(`${(this.globalProject as Project).name}`);
      cy.clickTab(/^Access$/, true);
    });
  });

  describe('Projects: Schedules Tab', () => {
    beforeEach(function () {
      cy.createAwxOrganization().then((org) => {
        organization = org;
        cy.createAwxProject({ organization: organization.id }).then((proj) => {
          thisProject = proj;
          const name = 'E2E' + randomString(4);
          cy.createAWXSchedule({
            name,
            unified_job_template: thisProject.id,
            rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
          }).then((sched: Schedule) => {
            schedule = sched;
            cy.navigateTo('awx', 'projects');
            cy.filterTableBySingleSelect('name', thisProject.name);
            cy.get('[data-cy="name-column-cell"]').click();
            cy.clickTab('Schedules', true);
          });
        });
      });
    });

    afterEach(() => {
      cy.deleteAWXSchedule(schedule, { failOnStatusCode: false });
      cy.deleteAwxProject(thisProject, { failOnStatusCode: false });
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    });

    it('can edit a simple schedule from details page', () => {
      cy.filterTableBySingleSelect('name', schedule.name);
      cy.clickTableRowPinnedAction(schedule.name, 'edit-schedule', false);
      cy.getByDataCy('wizard-nav').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
      cy.get('[data-cy="description"]').type('-edited');
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="description"]').contains('-edited');
      cy.clickButton(/^Finish$/);
      //Add more robust assertions here
      cy.verifyPageTitle(schedule.name);
    });

    it('can edit a simple schedule from the schedules list row', () => {
      cy.filterTableBySingleSelect('name', schedule.name);
      cy.clickTableRowPinnedAction(schedule.name, 'edit-schedule', false);
      cy.get('[data-cy="wizard-nav"]').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
      cy.getByDataCy('description').type('-edited');
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="description"]').contains('-edited');
      cy.clickButton(/^Finish$/);
      //Add more robust assertions here
      cy.verifyPageTitle(schedule.name);
    });

    it('can edit a schedule to add a rule and then edit a schedule to remove a rule', () => {
      cy.filterTableBySingleSelect('name', schedule.name);
      cy.clickTableRowLink('name', `${schedule.name}`, {
        disableFilter: true,
      });
      cy.verifyPageTitle(schedule.name);
      cy.get('[data-ouia-component-id="simple-table"]')
        .scrollIntoView()
        .within(() => {
          cy.getByDataCy('rules-column-header').should('be.visible').and('contain', 'Rules');
          cy.getByDataCy('rules-column-cell').should('have.descendants', 'ul');
          cy.get('tbody tr').should('have.length', 1); //First, 1 rule is showing
        });
      cy.getByDataCy('edit-schedule').click();
      cy.get('[data-cy="wizard-nav"]').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Add rule$/);
      cy.clickButton(/^Save rule$/);
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Finish$/);
      cy.verifyPageTitle(schedule.name);
      cy.get('[data-ouia-component-id="simple-table"]')
        .scrollIntoView()
        .within(() => {
          cy.getByDataCy('rules-column-header').should('be.visible').and('contain', 'Rules');
          cy.getByDataCy('rules-column-cell').should('have.descendants', 'ul');
          cy.get('tbody tr').should('have.length', 2); //Now, 2 rules are showing
        });
      cy.getByDataCy('edit-schedule').click();
      cy.get('[data-cy="wizard-nav"]').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
      cy.clickButton(/^Next$/);
      cy.getBy('[data-cy="row-id-1"]').within(() => {
        cy.getBy('[data-cy="delete-rule"]').click();
      });
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Finish$/);
      cy.get('[data-ouia-component-id="simple-table"]')
        .scrollIntoView()
        .within(() => {
          cy.getByDataCy('rules-column-header').should('be.visible').and('contain', 'Rules');
          cy.getByDataCy('rules-column-cell').should('have.descendants', 'ul');
          cy.get('tbody tr').should('have.length', 1); //1 Rule is showing again
        });
    });

    it('can edit a schedule to add and then remove exceptions', () => {
      cy.filterTableBySingleSelect('name', schedule.name);
      cy.clickTableRowLink('name', schedule.name, { disableFilter: true });
      cy.getBy('[data-cy="edit-schedule"]').click();
      cy.get('[data-cy="wizard-nav"]').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Create exception$/);
      cy.clickButton(/^Save exception$/);
      cy.intercept('POST', awxAPI`/schedules/preview/`).as('preview');
      cy.intercept('GET', awxAPI`/schedules/${schedule.id.toString()}`).as('projectSchedules');
      cy.clickButton(/^Next$/);
      cy.wait('@preview');
      cy.getByDataCy('local-time-zone').should('contain', 'UTC');
      cy.get('[data-cy="exceptions-column-header"]')
        .should('be.visible')
        .and('contain', 'Exceptions');
      cy.intercept('PATCH', awxAPI`/schedules/${schedule.id.toString()}/`).as('edited');
      cy.getByDataCy('Submit').click();
      cy.intercept('GET', awxAPI`/projects/${thisProject.id.toString()}/`).as('projectList');
      cy.wait('@edited');
      cy.wait('@projectList');
      cy.get('[data-cy="exceptions-column-header"]').should('be.visible');
      cy.getBy('[data-cy="edit-schedule"]').click();
      cy.get('[data-cy="wizard-nav"]').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Next$/);
      cy.getBy('[data-cy="row-id-1"]').within(() => {
        cy.getBy('[data-cy="delete-exception"]').click();
      });
      cy.clickButton(/^Next$/);
      cy.intercept('PATCH', awxAPI`/schedules/${schedule.id.toString()}/`).as('editedAgain');
      cy.getByDataCy('Submit').click();
      cy.wait('@editedAgain');
      cy.get('[data-cy="exceptions-column-header"]').should('not.exist');
    });

    it('can toggle a schedule', () => {
      cy.filterTableBySingleSelect('name', schedule.name);
      cy.get(`tr[data-cy="row-id-${schedule.id}"]`).within(() => {
        cy.get('[data-cy="toggle-switch"]').click();
      });
      cy.get('input[aria-label="Click to enable schedule"]').should('exist');
      cy.get(`tr[data-cy="row-id-${schedule.id}"]`).within(() => {
        cy.get('[data-cy="toggle-switch"]').click();
      });
      cy.get('input[aria-label="Click to disable schedule"]').should('exist');
    });

    it('can delete a schedule from the schedules list row', () => {
      cy.filterTableBySingleSelect('name', schedule.name);
      cy.clickTableRowKebabAction(schedule.name, 'delete-schedule', false);
      cy.getModal().then(() => {
        cy.get('#confirm').click();
        cy.intercept('DELETE', awxAPI`/schedules/${schedule.id.toString()}/`).as('deleted');
        cy.clickButton(/^Delete schedule/);
        cy.wait('@deleted')
          .its('response')
          .then((deleted) => {
            expect(deleted.statusCode).to.eql(204);
            cy.contains(/^Success$/);
            cy.clickButton(/^Close$/);
          });
      });
      cy.contains('No results found');
      cy.clickButton(/^Clear all filters$/);
    });

    it('can delete a schedule from the schedules list toolbar', () => {
      cy.filterTableBySingleSelect('name', schedule.name);
      cy.getTableRow('name', schedule.name, { disableFilter: true }).within(() => {
        cy.get('input[aria-label="Select all rows"]').click();
      });
      cy.clickToolbarKebabAction('delete-selected-schedules');
      cy.intercept('DELETE', awxAPI`/schedules/${schedule.id.toString()}/`).as('deleted');
      cy.getModal().then(() => {
        cy.get('#confirm').click();
        cy.clickButton(/^Delete schedule/);
        cy.wait('@deleted')
          .its('response')
          .then((deleted) => {
            expect(deleted.statusCode).to.eql(204);
            cy.contains(/^Success$/);
            cy.clickButton(/^Close$/);
          });
      });
      cy.contains('No results found');
      cy.clickButton(/^Clear all filters$/);
    });
  });

  describe('Projects: Job Templates Tab', () => {
    it('can navigate to project job templates tab', function () {
      cy.navigateTo('awx', 'projects');
      cy.filterTableByMultiSelect('name', [(this.globalProject as Project).name]);
      cy.clickTableRowLink('name', `${(this.globalProject as Project).name}`, {
        disableFilter: true,
      });
      cy.verifyPageTitle(`${(this.globalProject as Project).name}`);
      cy.clickTab(/^Job templates$/, true);
    });

    it.skip('can associate a project with a newly created job template and view that JT on the templates tab of the project', () => {
      //use the project created in the beforeEach block
      //create a JT in this test and specifically associate the project to it
      //visit the templates tab of the project and assert the JT showing there
      //delete the JT at the end of this test
    });
  });

  describe('Projects: Notifications Tab', () => {
    //This describe block should create a Project to use in these tests
    //The Project needs to be deleted after the tests run

    it('can navigate to project notifications tab', function () {
      //This test should be combined with the test directly below, when that other test gets written
      cy.navigateTo('awx', 'projects');
      cy.filterTableByMultiSelect('name', [(this.globalProject as Project).name]);
      cy.clickTableRowLink('name', `${(this.globalProject as Project).name}`, {
        disableFilter: true,
      });
      cy.verifyPageTitle(`${(this.globalProject as Project).name}`);
      cy.clickTab(/^Notifications$/, true);
    });

    it.skip('can navigate to the Projects -> Notifications list and then to the details page of the Notification', () => {
      //Assert the navigation to the notifications tab of the Project
      //Assert the navigation to the details page of the notification
    });

    it.skip('can toggle the Projects -> Notification on and off for job start', () => {
      //Assert the navigation to the notifications tab of the Project
      //Assert the start toggling on
      //Assert the start toggling off
    });

    it.skip('can toggle the Projects -> Notification on and off for job success', () => {
      //Assert the navigation to the notifications tab of the Project
      //Assert the success toggling on
      //Assert the success toggling off
    });

    it.skip('can toggle the Projects -> Notification on and off for job failure', () => {
      //Assert the navigation to the notifications tab of the Project
      //Assert the failure toggling on
      //Assert the failure toggling off
    });
  });

  // TODO - Move this to a unit test as on an e2e server the project might sync too fast and cancel will not be avail/enabled
  // it('can cancel project sync from projects list table row kebab menu', () => {
  //   cy.requestPost<Project>(awxAPI`/projects/`, {
  //     name: 'E2E Project ' + randomString(4),
  //     organization: organization.id,
  //     scm_type: 'git', // Only projects with scm_type and scm_url can be synced
  //     scm_url: 'https://github.com/ansible/ansible-ui',
  //   }).then((testProject) => {
  //     cy.navigateTo('awx', 'projects');
  //     cy.filterTableByText(testProject.name);
  //     cy.contains('td', testProject.name)
  //       .parent()
  //       .within(() => {
  //         cy.get('#cancel-sync').click();
  //       });
  //     cy.get('#confirm').click();
  //     cy.clickButton(/^Cancel project sync/);
  //     cy.contains(/^Success$/);
  //     cy.clickButton(/^Close$/);
  //     cy.filterTableByText(testProject.name);
  //     cy.get('td[data-label="Status"]').should('contain', 'Canceled');
  //     cy.clickButton(/^Clear all filters$/);
  //     cy.deleteAwxProject(testProject);
  //   });
  // });

  // TODO - Move this to a unit test as on an e2e server the project might sync too fast and cancel will not be avail/enabled
  // it('can cancel project sync from projects list toolbar ', () => {
  //   cy.requestPost<Project>(awxAPI`/projects/`, {
  //     name: 'E2E Project ' + randomString(4),
  //     organization: organization.id,
  //     scm_type: 'git', // Only projects with scm_type and scm_url can be synced
  //     scm_url: 'https://github.com/ansible/ansible-ui',
  //   }).then((testProject) => {
  //     cy.navigateTo('awx', 'projects');
  //     cy.selectTableRow(testProject.name);
  //     cy.clickToolbarKebabAction('cancel-selected-projects');
  //     cy.get('#confirm').click();
  //     cy.clickButton(/^Cancel project sync/);
  //     cy.contains(/^Success$/);
  //     cy.clickButton(/^Close$/);
  //     cy.filterTableByText(testProject.name);
  //     cy.get('td[data-label="Status"]').should('contain', 'Canceled');
  //     cy.clickButton(/^Clear all filters$/);
  //   });
  // });
});
