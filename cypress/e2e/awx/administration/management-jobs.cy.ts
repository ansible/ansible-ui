import { SystemJobTemplate } from '../../../../frontend/awx/interfaces/SystemJobTemplate';

describe('Management Jobs Page - List and Launch Jobs', () => {
  beforeEach(() => {
    cy.awxLogin();
  });

  it('render the management jobs list page, assert the management jobs listed', () => {
    const managementJobsList = [
      'Cleanup Activity Stream',
      'Cleanup Expired OAuth 2 Tokens',
      'Cleanup Expired Sessions',
      'Cleanup Job Details',
    ];
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

  const managementJobs = ['Cleanup Expired OAuth 2 Tokens', 'Cleanup Expired Sessions'];
  managementJobs.forEach((jobName) => {
    it(`admin can launch management job: ${jobName}`, () => {
      cy.intercept('GET', 'api/v2/system_job_templates/?order_by=name&page=1&page_size=10').as(
        'getManagementJobsListPage'
      );
      cy.navigateTo('awx', 'management-jobs');
      cy.verifyPageTitle('Management Jobs');
      cy.wait('@getManagementJobsListPage')
        .its('response.body.results')
        .then((results: SystemJobTemplate[]) => {
          const jobId = results.find((job) => job.name === jobName)?.id;
          if (jobId) {
            cy.intercept('POST', `/api/v2/system_job_templates/${jobId}/launch/`).as('launchJob');
            cy.clickTableRowAction('name', jobName, 'launch-management-job', {
              inKebab: false,
              disableFilter: true,
            });
            cy.wait('@launchJob')
              .its('response.body.id')
              .then((jobId: string) => {
                cy.verifyPageTitle(jobName);
                cy.url().should('include', `/jobs/management/${jobId}/output`);
                cy.waitForManagementJobStatus(jobId).then((response: SystemJobTemplate) => {
                  const status = response.status;
                  let resultStatus;
                  if (status === 'successful') {
                    resultStatus = 'Success';
                  }
                  cy.contains('a[role="tab"]', 'Details').click();
                  cy.get('[data-cy="id"]').should('have.text', jobId).should('be.visible');
                  cy.get('[data-cy="name"]').should('have.text', jobName).should('be.visible');
                  cy.get('[data-cy="status"]')
                    .should('have.text', resultStatus)
                    .should('be.visible');
                  cy.get('[data-cy="type"]')
                    .should('have.text', 'Management job')
                    .should('be.visible');
                  cy.get('[data-cy="id"]').should('have.text', jobId).should('be.visible');
                  cy.intercept('DELETE', `api/v2/system_jobs/${jobId}/`).as('deleteMgtJob');
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
    it(`admin can launch management job: ${jobName} with retention days`, () => {
      cy.intercept('GET', 'api/v2/system_job_templates/?order_by=name&page=1&page_size=10').as(
        'getManagementJobsListPage'
      );
      cy.navigateTo('awx', 'management-jobs');
      cy.verifyPageTitle('Management Jobs');
      cy.wait('@getManagementJobsListPage')
        .its('response.body.results')
        .then((results: SystemJobTemplate[]) => {
          const jobId = results.find((job) => job.name === jobName)?.id;
          if (jobId) {
            cy.intercept('POST', `/api/v2/system_job_templates/${jobId}/launch/`).as('launchJob');
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
                cy.waitForManagementJobStatus(jobId).then((response: SystemJobTemplate) => {
                  const status = response.status;
                  let resultStatus;
                  if (status === 'successful') {
                    resultStatus = 'Success';
                  }
                  cy.contains('a[role="tab"]', 'Details').click();
                  cy.get('[data-cy="id"]').should('have.text', jobId).should('be.visible');
                  cy.get('[data-cy="name"]').should('have.text', jobName).should('be.visible');
                  cy.get('[data-cy="status"]')
                    .should('have.text', resultStatus)
                    .should('be.visible');
                  cy.get('[data-cy="type"]')
                    .should('have.text', 'Management job')
                    .should('be.visible');
                  cy.intercept('DELETE', `api/v2/system_jobs/${jobId}/`).as('deleteMgtJob');
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
});
