import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { SystemJobTemplate } from '../../../../frontend/awx/interfaces/SystemJobTemplate';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../support/utils';

describe('Management Jobs Page - List and Launch Jobs', () => {
  it('render the management jobs list page, assert the management jobs listed', () => {
    const managementJobsList = [
      'Cleanup Activity Stream',
      'Cleanup Expired OAuth 2 Tokens',
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
        expect(responseJobsList).to.have.members(managementJobsList);
        cy.get('.pf-v5-c-table__tbody tr').should('have.length', responseJobsList.length);
        cy.get('.pf-v5-c-table__tbody tr').each(($row, index) => {
          cy.wrap($row).find('td').eq(0).should('contain', responseJobsList[index]);
        });
      });
  });

  const managementJobs = ['Cleanup Expired OAuth 2 Tokens', 'Cleanup Expired Sessions'];
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
            cy.clickTableRowAction('name', jobName, 'launch-management-job', {
              inKebab: false,
              disableFilter: true,
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
                  cy.clickPageAction('delete-job');
                  cy.get('#confirm').click();
                  cy.clickButton(/^Delete job/);
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
            cy.clickTableRowAction('name', jobName, 'launch-management-job', {
              inKebab: false,
              disableFilter: true,
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
describe.skip('Management Jobs - Schedules Tab', () => {
  const managementJobsList = [
    'Cleanup Activity Stream',
    'Cleanup Expired OAuth 2 Tokens',
    'Cleanup Expired Sessions',
    'Cleanup Job Details',
  ];

  const autoGeneratedSchedules = [
    'Cleanup Activity Schedule',
    'Cleanup Expired OAuth 2 Tokens',
    'Cleanup Expired Sessions',
    'Cleanup Job Schedule',
  ];

  managementJobsList.forEach((jobName, index) => {
    it(`admin can see existing auto generated schedules of the management job: ${jobName}`, () => {
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
            cy.filterTableByMultiSelect('name', [jobName]);
            cy.clickTableRowLink('name', jobName, { disableFilter: true });
            cy.verifyPageTitle(jobName);
            cy.clickTab('Schedules', true);
            cy.filterTableByMultiSelect('name', [autoGeneratedSchedules[index]]);
            cy.get('[data-cy="name-column-cell"]')
              .should('have.text', autoGeneratedSchedules[index])
              .should('be.visible');
          }
        });
    });
  });

  managementJobsList.forEach((jobName) => {
    it(`admin can perform crud actions and toggle the schedule of management job: ${jobName} from the details tab`, () => {
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
            cy.filterTableByMultiSelect('name', [jobName]);
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
            } else if (
              ['Cleanup Expired OAuth 2 Tokens', 'Cleanup Expired Sessions'].includes(jobName)
            ) {
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
                cy.filterTableByMultiSelect('name', [scheduleName]);
                cy.getByDataCy('actions-column-cell').within(() => {
                  cy.clickKebabAction('actions-dropdown', 'edit-schedule');
                });
                cy.getByDataCy('description').clear().type('edited description');
                cy.verifyPageTitle('Edit Schedule');
                cy.clickButton('Next');
                cy.clickButton('Next');
                cy.clickButton('Next');
                cy.clickButton('Finish');
                cy.verifyPageTitle(scheduleName);

                // Assert the schedule is enabled initially
                cy.get('.pf-v5-c-switch__label.pf-m-on')
                  .should('have.text', 'Schedule enabled')
                  .should('be.visible');

                // Toggle the schedule to disabled
                cy.getByDataCy('toggle-switch').click();

                // Assert the schedule is disabled
                cy.get('.pf-v5-c-switch__label.pf-m-off')
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
    it(`admin can perform crud actions and toggle the schedule for management job: ${jobName} from the list row`, () => {
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
            cy.filterTableByMultiSelect('name', [jobName]);
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
            } else if (
              ['Cleanup Expired OAuth 2 Tokens', 'Cleanup Expired Sessions'].includes(jobName)
            ) {
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
                } else if (
                  ['Cleanup Expired OAuth 2 Tokens', 'Cleanup Expired Sessions'].includes(jobName)
                ) {
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
                } else if (
                  ['Cleanup Expired OAuth 2 Tokens', 'Cleanup Expired Sessions'].includes(jobName)
                ) {
                  cy.get('[data-cy="schedule-days-to-keep"]').should('not.exist');
                }
                cy.clickTab('Schedules', true);

                cy.intercept('DELETE', awxAPI`/schedules/${scheduleId.toString()}/`).as(
                  'deleteMgtJobSchedule'
                );
                cy.filterTableByMultiSelect('name', [scheduleName]);
                cy.getByDataCy('actions-column-cell').within(() => {
                  cy.clickKebabAction('actions-dropdown', 'delete-schedule');
                });
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

describe('Management Jobs - Notifications Tab', function () {
  let awxOrganization: Organization;

  before(function () {
    cy.createAwxOrganization().then((thisOrg) => {
      awxOrganization = thisOrg;
    });
  });

  after(function () {
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  const managementJobsList = [
    'Cleanup Activity Stream',
    'Cleanup Expired OAuth 2 Tokens',
    'Cleanup Expired Sessions',
    'Cleanup Job Details',
  ];

  managementJobsList.forEach((jobName) => {
    it(`admin can see the notification created from the notification tab of management job ${jobName}`, function () {
      cy.intercept('GET', awxAPI`/notification_templates/?order_by=name&page=1&page_size=10`).as(
        'getNotifiers'
      );
      cy.intercept('GET', awxAPI`/system_job_templates/?order_by=name&page=1&page_size=10`).as(
        'getManagementJobsListPage'
      );
      const notifierName = `AWX Notifier Pager Duty ${randomE2Ename()}`;
      cy.navigateTo('awx', 'notification-templates');
      cy.verifyPageTitle('Notifiers');
      cy.wait('@getNotifiers');
      cy.getByDataCy('add-notifier').click();
      cy.verifyPageTitle('Create notifier');
      cy.getByDataCy('name').type(notifierName);
      cy.getByDataCy('description').type('AWX Notifier Description');
      cy.singleSelectByDataCy('organization', awxOrganization.name);
      cy.singleSelectByDataCy('notification_type', 'Pagerduty');
      cy.getByDataCy('notification-configuration-subdomain').type('pagerduty.com');
      cy.getByDataCy('notification-configuration-token').type('token');
      cy.getByDataCy('notification-configuration-service-key').type('service-key');
      cy.getByDataCy('notification-configuration-client-name').type('client-name');
      cy.getByDataCy('Submit').click();
      cy.verifyPageTitle(notifierName);
      cy.navigateTo('awx', 'management-jobs');
      cy.verifyPageTitle('Management Jobs');
      cy.wait('@getManagementJobsListPage')
        .its('response.body.results')
        .then((results: SystemJobTemplate[]) => {
          const job = results.find((job) => job.name === jobName);
          if (job) {
            cy.filterTableByMultiSelect('name', [jobName]);
            cy.clickTableRowLink('name', jobName, { disableFilter: true });
            cy.clickTab('Notifications', true);
            cy.getTableRow('name', notifierName).within(() => {
              //enable and disable start, success and failure switches of the notifier
              cy.toggleAndAssert(['start', 'success', 'failure']);
              cy.contains('a', notifierName).click();
            });
            cy.verifyPageTitle(notifierName);
            cy.clickPageAction('delete-notifier');
            cy.intercept('DELETE', awxAPI`/notification_templates/*/`).as('deleteNotifier');
            cy.get('#confirm').click();
            cy.clickButton(/^Delete notifier/);
            cy.wait('@deleteNotifier')
              .its('response')
              .then((response) => {
                expect(response?.statusCode).to.eql(204);
                cy.verifyPageTitle('Notifiers');
              });
          }
        });
    });
  });
});
