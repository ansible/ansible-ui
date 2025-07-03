import { SystemJobTemplate } from '@ansible/awx-ui/interfaces/generated-from-swagger/api';
import { awxAPI } from '../../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../../support/utils';

describe('Management Jobs Page - List and Launch Jobs', () => {
  it('render the management jobs list page, assert the management jobs listed', () => {
    const managementJobsList = [
      'Cleanup Activity Stream',
      'Cleanup Expired Sessions',
      'Cleanup Job Details',
    ];
    cy.intercept('GET', awxAPI`/system_job_templates/?order_by=name&page=1&page_size=10`).as(
      'getManagementJobsListPage'
    );
    cy.navigateTo('awx', 'management-jobs');
    cy.verifyPageTitle('Management Jobs');
    cy.wait('@getManagementJobsListPage')
      .its('response.body.results')
      .then((results: SystemJobTemplate[]) => {
        const responseJobsList = results?.map((job: SystemJobTemplate) => job.name);
        cy.wrap(managementJobsList).each((managementJob) => {
          cy.wrap(responseJobsList).should('include', managementJob);
        });
      });
  });

  const managementJobs = ['Cleanup Expired Sessions'];
  managementJobs.forEach((jobName) => {
    it(`admin can launch management job: ${jobName}`, () => {
      cy.intercept('GET', awxAPI`/system_job_templates/?order_by=name&page=1&page_size=10`).as(
        'getManagementJobsListPage'
      );
      cy.navigateTo('awx', 'management-jobs');
      cy.verifyPageTitle('Management Jobs');
      cy.wait('@getManagementJobsListPage')
        .its('response.body.results')
        .then((results: SystemJobTemplate[]) => {
          const jobId = results.find((job) => job.name === jobName)?.id;
          if (jobId) {
            cy.intercept('POST', awxAPI`/system_job_templates/${jobId.toString()}/launch/`).as(
              'launchJob'
            );
            cy.getTableRow('name', jobName, { disableFilter: true }).within(() => {
              cy.get(`[data-cy="actions-column-cell"]`).within(() => {
                cy.getBy(`[data-cy="launch-management-job"]`).click();
              });
            });
            cy.wait('@launchJob')
              .its('response.body.id')
              .then((jobId: string) => {
                cy.verifyPageTitle(jobName);
                cy.url().should('include', `/jobs/management/${jobId}/output`);
                cy.waitForManagementJobToProcess(jobId).then(() => {
                  cy.clickTab('Details', true);
                  cy.getByDataCy('id').should('have.text', jobId);
                  cy.getByDataCy('name').should('have.text', jobName);
                  cy.getByDataCy('type').should('have.text', 'Management job');
                  cy.intercept('DELETE', awxAPI`/system_jobs/${jobId}/`).as('deleteMgtJob');
                  cy.getByDataCy('actions-dropdown').click();
                  cy.getBy('button[id="delete-job"]').click();
                  cy.getModal().within(() => {
                    cy.get('#confirm').click();
                    cy.clickButton(/^Delete job/);
                  });
                  cy.wait('@deleteMgtJob')
                    .its('response')
                    .then((response) => {
                      expect(response?.statusCode).to.eql(204);
                    });
                });
              });
          }
        });
      cy.navigateTo('awx', 'management-jobs');
    });
  });

  const managementJobsWithModal = ['Cleanup Activity Stream', 'Cleanup Job Details'];
  const rententionDays = '4';
  managementJobsWithModal.forEach((jobName) => {
    it(`admin can launch management job: ${jobName} with the retention days set`, () => {
      cy.intercept('GET', awxAPI`/system_job_templates/?order_by=name&page=1&page_size=10`).as(
        'getManagementJobsListPage'
      );
      cy.navigateTo('awx', 'management-jobs');
      cy.verifyPageTitle('Management Jobs');
      cy.wait('@getManagementJobsListPage')
        .its('response.body.results')
        .then((results: SystemJobTemplate[]) => {
          const jobId = results.find((job) => job.name === jobName)?.id;
          if (jobId) {
            cy.intercept('POST', awxAPI`/system_job_templates/${jobId.toString()}/launch/`).as(
              'launchJob'
            );
            cy.getTableRow('name', jobName, { disableFilter: true }).within(() => {
              cy.get(`[data-cy="actions-column-cell"]`).within(() => {
                cy.getBy(`[data-cy="launch-management-job"]`).click();
              });
            });
            cy.get('[data-cy="extra-vars-days"]').clear().type(rententionDays);
            cy.clickButton(/^Launch/);
            cy.wait('@launchJob')
              .its('response.body.id')
              .then((jobId: string) => {
                cy.verifyPageTitle(jobName);
                cy.url().should('include', `/jobs/management/${jobId}/output`);
                cy.waitForManagementJobToProcess(jobId).then(() => {
                  cy.clickTab('Details', true);
                  cy.getByDataCy('id').should('have.text', jobId);
                  cy.getByDataCy('name').should('have.text', jobName);
                  cy.getByDataCy('type').should('have.text', 'Management job');
                  cy.intercept('DELETE', awxAPI`/system_jobs/${jobId}/`).as('deleteMgtJob');
                  cy.clickPageAction('delete-job');
                  cy.get('#confirm').click();
                  cy.clickButton(/^Delete job/);
                  cy.wait('@deleteMgtJob')
                    .its('response')
                    .should((response) => {
                      expect(response?.statusCode).to.eql(204);
                    });
                });
              });
          }
        });
      cy.navigateTo('awx', 'management-jobs');
    });
  });
});

//TODO: Skipping the test due to test failures with typing issue in the Schedule name field in the UI
describe('Management Jobs - Schedules Tab', () => {
  const managementJobsList = [
    'Cleanup Activity Stream',
    'Cleanup Expired Sessions',
    'Cleanup Job Details',
  ];

  const autoGeneratedSchedules = [
    'Cleanup Activity Schedule',
    'Cleanup Expired Sessions',
    'Cleanup Job Schedule',
  ];

  managementJobsList.forEach((jobName, index) => {
    it.skip(`admin can see existing auto generated schedules of the management job: ${jobName}`, () => {
      cy.intercept('GET', awxAPI`/system_job_templates/?order_by=name&page=1&page_size=10`).as(
        'getManagementJobsListPage'
      );
      cy.navigateTo('awx', 'management-jobs');
      cy.verifyPageTitle('Management Jobs');
      cy.wait('@getManagementJobsListPage')
        .its('response.body.results')
        .then((results: SystemJobTemplate[]) => {
          const jobId = results.find((job) => job.name === jobName)?.id;
          cy.log(jobName);
          if (jobId) {
            cy.filterTableBySearch(jobName);
            cy.clickTableRowLink('name', jobName, { disableFilter: true });
            cy.verifyPageTitle(jobName);
            cy.clickTab('Schedules', true);
            cy.filterTableBySearch(autoGeneratedSchedules[index]);
            cy.get('[data-cy="name-column-cell"]')
              .should('have.text', autoGeneratedSchedules[index])
              .should('be.visible');
          }
        });
    });
  });

  managementJobsList.forEach((jobName) => {
    it.skip(`admin can perform crud actions and toggle the schedule of management job: ${jobName} from the details tab`, () => {
      const scheduleName = `${jobName} ${randomE2Ename()}`;
      cy.intercept('GET', awxAPI`/system_job_templates/?order_by=name&page=1&page_size=10`).as(
        'getManagementJobsListPage'
      );
      cy.navigateTo('awx', 'management-jobs');
      cy.verifyPageTitle('Management Jobs');
      cy.wait('@getManagementJobsListPage')
        .its('response.body.results')
        .then((results: SystemJobTemplate[]) => {
          const jobId = results.find((job) => job.name === jobName)?.id;
          if (jobId) {
            cy.filterTableBySearch(jobName);
            cy.clickTableRowLink('name', jobName, { disableFilter: true });
            cy.verifyPageTitle(jobName);
            cy.clickTab('Schedules', true);
            cy.intercept('POST', awxAPI`/system_job_templates/${jobId.toString()}/schedules/`).as(
              'createSchedule'
            );
            cy.getByDataCy('create-schedule').click();
            cy.verifyPageTitle('Create Schedule');
            cy.getByDataCy('name').type(scheduleName, { delay: 0 });
            cy.getByDataCy('description').type('description');
            if (['Cleanup Activity Stream', 'Cleanup Job Details'].includes(jobName)) {
              cy.get('[data-cy="schedule-days-to-keep"]').should('exist').type('10');
            } else if (['Cleanup Expired Sessions'].includes(jobName)) {
              cy.get('[data-cy="schedule-days-to-keep"]').should('not.exist');
            }
            cy.clickButton('Next');
            cy.clickButton('Save rule');
            cy.clickButton('Next');
            cy.clickButton('Next');
            cy.clickButton('Finish');
            cy.wait('@createSchedule')
              .its('response.body.id')
              .then((scheduleId: number) => {
                cy.log(`Schedule ID: ${typeof scheduleId}`);
                cy.verifyPageTitle(scheduleName);
                cy.clickTab('Back to Schedules', true);
                cy.filterTableBySearch(scheduleName);
                cy.getByDataCy('actions-column-cell').within(() => {
                  cy.getBy(`[data-cy="actions-dropdown"]`).click();
                });
                cy.getBy('[data-cy="edit-schedule"]').click();
                cy.getByDataCy('description').clear().type('edited description');
                cy.verifyPageTitle('Edit Schedule');
                cy.clickButton('Next');
                cy.clickButton('Next');
                cy.clickButton('Next');
                cy.clickButton('Finish');
                cy.verifyPageTitle(scheduleName);
                cy.get('.pf-v6-c-switch__label.pf-m-on')
                  .should('have.text', 'Schedule enabled')
                  .should('be.visible');
                cy.getByDataCy('toggle-switch').click();
                cy.get('.pf-v6-c-switch__label.pf-m-off')
                  .should('have.text', 'Schedule disabled')
                  .should('be.visible');
                cy.intercept('DELETE', awxAPI`/schedules/${scheduleId.toString()}/`).as(
                  'deleteMgtJobSchedule'
                );
                cy.clickPageAction('delete-schedule');

                cy.get('#confirm').click();
                cy.clickButton(/^Delete schedule/);
                cy.wait('@deleteMgtJobSchedule')
                  .its('response')
                  .should((response) => {
                    expect(response?.statusCode).to.eql(204);
                  });
              });
          }
        });
    });
  });

  managementJobsList.forEach((jobName) => {
    it.skip(`admin can perform crud actions and toggle the schedule for management job: ${jobName} from the list row`, () => {
      const scheduleName = `${jobName} ${randomE2Ename()}`;
      cy.intercept('GET', awxAPI`/system_job_templates/?order_by=name&page=1&page_size=10`).as(
        'getManagementJobsListPage'
      );
      cy.navigateTo('awx', 'management-jobs');
      cy.verifyPageTitle('Management Jobs');
      cy.wait('@getManagementJobsListPage')
        .its('response.body.results')
        .then((results: SystemJobTemplate[]) => {
          const jobId = results.find((job) => job.name === jobName)?.id;
          if (jobId) {
            cy.filterTableBySearch(jobName);
            cy.clickTableRowLink('name', jobName, { disableFilter: true });
            cy.verifyPageTitle(jobName);
            cy.clickTab('Schedules', true);

            cy.intercept('POST', awxAPI`/system_job_templates/${jobId.toString()}/schedules/`).as(
              'createSchedule'
            );
            cy.getByDataCy('create-schedule').click();
            cy.verifyPageTitle('Create Schedule');
            cy.get('[data-cy="name"]').type(scheduleName, { delay: 0 });
            cy.get('[data-cy="description"]').type('description');
            if (['Cleanup Activity Stream', 'Cleanup Job Details'].includes(jobName)) {
              cy.get('[data-cy="schedule-days-to-keep"]').should('exist').type('10');
            } else if (['Cleanup Expired Sessions'].includes(jobName)) {
              cy.get('[data-cy="schedule-days-to-keep"]').should('not.exist');
            }
            cy.clickButton('Next');
            cy.clickButton('Save rule');
            cy.clickButton('Next');
            cy.clickButton('Next');
            cy.clickButton('Finish');
            cy.wait('@createSchedule')
              .its('response.body.id')
              .then((scheduleId: number) => {
                cy.verifyPageTitle(scheduleName);
                cy.clickTab('Back to Schedules', true);
                cy.filterTableBySingleSelect('name', scheduleName);

                cy.clickTableRowPinnedAction(scheduleName, 'edit-schedule', false);
                cy.verifyPageTitle('Edit Schedule');
                cy.getByDataCy('description').clear().type('description-edited');
                if (['Cleanup Activity Stream', 'Cleanup Job Details'].includes(jobName)) {
                  cy.get('[data-cy="schedule-days-to-keep"]').should('exist').clear().type('20');
                } else if (['Cleanup Expired Sessions'].includes(jobName)) {
                  cy.get('[data-cy="schedule-days-to-keep"]').should('not.exist');
                }
                cy.clickButton(/^Next$/);
                cy.clickButton(/^Next$/);
                cy.clickButton(/^Next$/);
                cy.clickButton(/^Finish$/);
                cy.verifyPageTitle(scheduleName);
                cy.getByDataCy('description').should('have.text', 'description-edited');
                if (['Cleanup Activity Stream', 'Cleanup Job Details'].includes(jobName)) {
                  cy.getByDataCy('days-of-data-to-keep').should('have.text', '20');
                } else if (['Cleanup Expired Sessions'].includes(jobName)) {
                  cy.get('[data-cy="schedule-days-to-keep"]').should('not.exist');
                }
                cy.clickTab('Schedules', true);

                cy.intercept('DELETE', awxAPI`/schedules/${scheduleId.toString()}/`).as(
                  'deleteMgtJobSchedule'
                );
                cy.filterTableBySearch(scheduleName);
                cy.getByDataCy('actions-column-cell').within(() => {
                  cy.getBy(`[data-cy="actions-dropdown"]`).click();
                });
                cy.getBy('[data-cy="delete-schedule"]').click();
                cy.clickModalConfirmCheckbox();
                cy.clickModalButton('Delete schedule');

                cy.clickButton(/^Close/);
                cy.wait('@deleteMgtJobSchedule')
                  .its('response')
                  .should((response) => {
                    expect(response?.statusCode).to.eql(204);
                  });
              });
          }
        });
    });
  });
});
