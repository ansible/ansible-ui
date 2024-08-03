import { Inventory } from '../../../../../frontend/awx/interfaces/Inventory';
import { Job } from '../../../../../frontend/awx/interfaces/Job';
import { JobTemplate } from '../../../../../frontend/awx/interfaces/JobTemplate';
import { NotificationTemplate } from '../../../../../frontend/awx/interfaces/NotificationTemplate';
import { Organization } from '../../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../../frontend/awx/interfaces/Project';
import { Schedule } from '../../../../../frontend/awx/interfaces/Schedule';
import { awxAPI } from '../../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../../support/utils';

describe('Projects', () => {
  let project: Project;
  let awxOrganization: Organization;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      awxOrganization = org;
      cy.createAwxProject(awxOrganization).then((proj) => {
        project = proj;
      });
    });
  });

  after(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  describe('Projects: User Access Tab', () => {
    it('can navigate to project access tab', () => {
      cy.navigateTo('awx', 'projects');
      cy.filterTableByMultiSelect('name', [project.name]);
      cy.clickTableRowLink('name', `${project.name}`, {
        disableFilter: true,
      });
      cy.verifyPageTitle(`${project.name}`);
      cy.clickTab(/^User Access$/, true);
    });
  });

  describe('Projects: Team Access Tab', () => {
    it('can navigate to team access tab', () => {
      cy.navigateTo('awx', 'projects');
      cy.filterTableByMultiSelect('name', [project.name]);
      cy.clickTableRowLink('name', `${project.name}`, {
        disableFilter: true,
      });
      cy.verifyPageTitle(`${project.name}`);
      cy.clickTab(/^Team Access$/, true);
    });
  });

  describe('Projects: Schedules Tab', () => {
    let schedule: Schedule;

    beforeEach(() => {
      cy.createAWXSchedule({
        name: `Schedule` + `${randomE2Ename()}`,
        unified_job_template: project.id,
        rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
      }).then((sched: Schedule) => {
        schedule = sched;
        cy.navigateTo('awx', 'projects');
        cy.filterTableBySingleSelect('name', project.name);
        cy.get('[data-cy="name-column-cell"]').click();
        cy.clickTab('Schedules', true);
      });
    });

    afterEach(() => {
      cy.deleteAWXSchedule(schedule, { failOnStatusCode: false });
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
      cy.intercept('GET', awxAPI`/projects/${project.id.toString()}/`).as('projectList');
      cy.wait('@edited');
      cy.wait('@projectList');
      cy.get('[data-ouia-component-id="simple-table"]')
        .first()
        .scrollIntoView()
        .should('be.visible');
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
      cy.clickTableRowAction('name', schedule.name, 'delete-schedule', {
        disableFilter: true,
        inKebab: true,
      });
      cy.getModal().then(() => {
        cy.get('#confirm').click();
        cy.intercept('DELETE', awxAPI`/schedules/${schedule.id.toString()}/`).as('deleted');
        cy.clickButton(/^Delete schedule/);
        cy.wait('@deleted')
          .its('response')
          .then((deleted) => {
            expect(deleted?.statusCode).to.eql(204);
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
      cy.clickToolbarKebabAction('delete-schedules');
      cy.intercept('DELETE', awxAPI`/schedules/${schedule.id.toString()}/`).as('deleted');
      cy.getModal().then(() => {
        cy.get('#confirm').click();
        cy.clickButton(/^Delete schedule/);
        cy.wait('@deleted')
          .its('response')
          .then((deleted) => {
            expect(deleted?.statusCode).to.eql(204);
            cy.contains(/^Success$/);
            cy.clickButton(/^Close$/);
          });
      });
      cy.contains('No results found');
      cy.clickButton(/^Clear all filters$/);
    });
  });

  describe('Projects: Job Templates Tab', () => {
    let jobTemplate: JobTemplate;
    let inventory: Inventory;
    beforeEach(() => {
      cy.createAwxInventory(awxOrganization).then((inv) => {
        inventory = inv;
        cy.createAwxJobTemplate({
          organization: awxOrganization.id,
          project: project.id,
          inventory: inventory.id,
        }).then((jt1) => {
          jobTemplate = jt1;
        });
      });
    });

    afterEach(() => {
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    it('can associate a project with a newly created job template and view that JT on the templates tab of the project', () => {
      cy.createAwxProject(awxOrganization).then((thisProject) => {
        cy.navigateTo('awx', 'templates');
        cy.filterTableByMultiSelect('name', [jobTemplate.name]);
        cy.getTableRow('name', jobTemplate.name, { disableFilter: true }).should('be.visible');
        cy.selectTableRow(jobTemplate.name, false);
        cy.getBy('[data-cy="edit-template"]').click();
        cy.verifyPageTitle(`Edit ${jobTemplate.name}`);
        cy.selectDropdownOptionByResourceName('project', thisProject.name);
        cy.intercept('PATCH', awxAPI`/job_templates/${jobTemplate.id.toString()}/`).as('edited');
        cy.getByDataCy('Submit').click();
        cy.wait('@edited')
          .its('response.body')
          .then((editedJt: JobTemplate) => {
            expect(editedJt.project).to.eql(thisProject.id);
            cy.intercept('POST', awxAPI`/job_templates/${editedJt.id.toString()}/launch/`).as(
              'launched'
            );
            cy.getByDataCy('launch-template').click();
            cy.wait('@launched')
              .its('response.body')
              .then((launched: Job) => {
                cy.verifyPageTitle(editedJt.name);
                cy.url().should('include', '/output');
                cy.get('[data-cy="relaunch-job"]').should('be.visible');
                cy.waitForJobToProcessEvents(launched.id.toString(), 'jobs');
              });
          });
        cy.navigateTo('awx', 'projects');
        cy.verifyPageTitle('Projects');
        cy.filterTableByMultiSelect('name', [thisProject.name]);
        cy.get(`[data-cy="row-id-${thisProject.id}"]`).within(() => {
          cy.get('[data-cy="name-column-cell"]').click();
        });
        cy.navigateTo('awx', 'projects');
        cy.verifyPageTitle('Projects');
        cy.filterTableByMultiSelect('name', [thisProject.name]);
        cy.get(`[data-cy="row-id-${thisProject.id}"]`).within(() => {
          cy.get('[data-cy="name-column-cell"]').click();
        });
        cy.clickTab('Job Templates', true);
        cy.url().should(
          'contain',
          `/projects/${thisProject.id}/job-templates?page=1&perPage=10&sort=name`
        );
        cy.filterTableByMultiSelect('name', [jobTemplate.name]);
        cy.getTableRow('name', jobTemplate.name, { disableFilter: true }).should('be.visible');
        cy.selectTableRow(jobTemplate.name, false);
        cy.clickTableRowAction('name', jobTemplate.name, 'delete-template', {
          inKebab: true,
          disableFilter: true,
        });
        cy.getModal().then(() => {
          cy.get('h1').should('contain', 'Permanently delete job template');
          cy.get('#confirm').click();
          cy.get('[data-ouia-component-id="submit"]').click();
          cy.clickButton('Close');
        });
        cy.get('h2').should('contain', 'No results found');
      });
    });
  });

  describe('Projects: Notifications Tab', () => {
    let notification: NotificationTemplate;

    beforeEach(() => {
      const notificationName = `${randomE2Ename()}`;
      cy.createNotificationTemplate(notificationName, awxOrganization).then((notifier) => {
        notification = notifier;
      });
    });

    afterEach(() => {
      cy.deleteNotificationTemplate(notification, { failOnStatusCode: false });
    });

    it('can navigate to the Projects Notifications list, toggle a Notification on Start, and navigate to its details page', () => {
      cy.navigateTo('awx', 'projects');
      cy.filterTableByMultiSelect('name', [project.name]);
      cy.clickTableRowLink('name', `${project.name}`, {
        disableFilter: true,
      });
      cy.verifyPageTitle(`${project.name}`);
      cy.clickTab(/^Notifications$/, true);
      cy.getBy('#filter-input').type(`${notification.name}`);
      cy.getByDataCy('apply-filter').click();
      cy.intercept(
        'POST',
        awxAPI`/projects/${project.id.toString()}/notification_templates_started/`
      ).as('started');
      cy.intercept(
        'GET',
        awxAPI`/projects/${project.id.toString()}/notification_templates_started/`
      ).as('getStarted');
      cy.getTableRow('name', notification.name, { disableFilter: true }).within(() => {
        cy.contains('[data-cy="toggle-switch"]', 'Start').find('span').eq(0).click();
        cy.contains('[data-cy="toggle-switch"]', 'Start')
          .find('input[aria-label="Click to disable start"]')
          .invoke('val')
          .then((val) => {
            expect(val).to.eql('on');
          });
        cy.wait('@started')
          .its('response')
          .then((started) => {
            expect(started?.statusCode).to.eql(204);
          });
      });
      cy.wait('@getStarted');
      cy.getTableRow('name', notification.name, { disableFilter: true })
        .should('be.visible')
        .within(() => {
          cy.get('a').click();
        });
      cy.verifyPageTitle(notification.name);
      cy.url().should('contain', `/administration/notifiers/${notification.id}/details`);
    });
  });
});
