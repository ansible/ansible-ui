import { SystemJobTemplate } from '../../../../frontend/awx/interfaces/SystemJobTemplate';

describe('Management Jobs', () => {
  describe('Management Jobs: List View', () => {
    it('render the management jobs list page, assert the management jobs listed', () => {
      const managementJobsList = [
        'Cleanup Activity Stream',
        'Cleanup Expired OAuth 2 Tokens',
        'Cleanup Expired Sessions',
        'Cleanup Job Details',
      ];
      cy.awxLogin();
      cy.intercept('GET', 'api/v2/system_job_templates/?order_by=name&page=1&page_size=10').as(
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

    it.skip('only allows an admin user to view the management job tab', () => {
      //Assert that admin is the currently logged in user
      //Create a normal user in this test, or in the beforeEach block
      //Log out and log back in as normal user, assert that it is the normal user
      //Assert that the normal user cannot see management jobs
    });
  });

  describe('Management Jobs: Cleanup Expired OAuth 2 Tokens', () => {
    it.skip('can manually launch a job, verify redirect to output screen, and verify job details', () => {
      //Assert that the user is looking at the expected job
      //Assert the launch
      //Assert the redirect to output screen
      //Assert viewable job details
    });
  });
  describe('Management Jobs: Cleanup Expired Sessions', () => {
    it.skip('can manually launch a job, verify redirect to output screen, and verify job details', () => {
      //Assert that the user is looking at the expected job
      //Assert the launch
      //Assert the redirect to output screen
      //Assert viewable job details
    });
  });
  describe('Management Jobs: Cleanup Activity Stream', () => {
    it.skip('can manually launch a job, view a modal to set # of days, verify redirect to output screen, and verify job details', () => {
      //Assert that the user is looking at the expected job
      //Assert the launch
      //Assert the redirect to output screen
      //Assert viewable job details
    });
  });
  describe('Management Jobs: Cleanup Job Details', () => {
    it.skip('can manually launch a job, view a modal to set # of days, verify redirect to output screen, and verify job details', () => {
      //Assert that the user is looking at the expected job
      //Assert the launch
      //Assert the redirect to output screen
      //Assert viewable job details
    });
  });

  describe('Management Jobs: Schedules Tab', () => {
    it.skip('can click the Cleanup Activity Stream link on the list view and verify the details of the automatically generated schedule', () => {
      //Assert schedule presence on list view
      //Assert info on the schedule details page, including the fact that it is automatically generated
    });

    it.skip('can make multiple edits to the Cleanup Activity Stream schedule, save, disable schedule, and reenable', () => {
      //Assert the edit form showing
      //Assert that the edits made were saved
      //Assert the disabling of the schedule
      //Assert the reenabling of the schedule
    });

    it.skip('can click the Cleanup Expired OAuth 2 Tokens link on the list view and verify the details of the automatically generated schedule', () => {
      //Assert schedule presence on list view
      //Assert info on the schedule details page, including the fact that it is automatically generated
    });

    it.skip('can make multiple edits to the Cleanup Expired OAuth 2 Tokens schedule, save, disable schedule, and reenable', () => {
      //Assert the edit form showing
      //Assert that the edits made were saved
      //Assert the disabling of the schedule
      //Assert the reenabling of the schedule
    });

    it.skip('can click the Cleanup Expired Sessions link on the list view and verify the details of the automatically generated schedule', () => {
      //Assert schedule presence on list view
      //Assert info on the schedule details page, including the fact that it is automatically generated
    });

    it.skip('can make multiple edits to the Cleanup Expired Sessions schedule, save, disable schedule, and reenable', () => {
      //Assert the edit form showing
      //Assert that the edits made were saved
      //Assert the disabling of the schedule
      //Assert the reenabling of the schedule
    });

    it.skip('can click the Cleanup Job Details link on the list view and verify the details of the automatically generated schedule', () => {
      //Assert schedule presence on list view
      //Assert info on the schedule details page, including the fact that it is automatically generated
    });

    it.skip('can make multiple edits to the Cleanup Job Details schedule, save, disable schedule, and reenable', () => {
      //Assert the edit form showing
      //Assert that the edits made were saved
      //Assert the disabling of the schedule
      //Assert the reenabling of the schedule
    });
  });

  describe('Management Jobs: Notifications Tab', () => {
    it.skip('can navigate to the Management Jobs -> Notifications list and then to the details page of the Notification', () => {
      //Assert the navigation to the notifications tab of the Management Job
      //Assert the navigation to the details page of the notification
    });

    it.skip('can toggle the Management Jobs -> Notification on and off for job start', () => {
      //Assert the navigation to the notifications tab of the Management Job
      //Assert the start toggling on
      //Assert the start toggling off
    });

    it.skip('can toggle the Management Jobs -> Notification on and off for job success', () => {
      //Assert the navigation to the notifications tab of the Management Job
      //Assert the success toggling on
      //Assert the success toggling off
    });

    it.skip('can toggle the Management Jobs -> Notification on and off for job failure', () => {
      //Assert the navigation to the notifications tab of the Management Job
      //Assert the failure toggling on
      //Assert the failure toggling off
    });
  });
});
