import { SystemJobTemplate } from '../../../../../ansible-ui/frontend/awx/interfaces/SystemJobTemplate';

describe('Management Jobs', () => {
  it('render the Management Jobs List page', () => {
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
});
