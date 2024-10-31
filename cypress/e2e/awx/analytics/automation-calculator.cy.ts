import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Job } from '../../../../frontend/awx/interfaces/Job';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../support/utils';

// Skip until https://issues.redhat.com/browse/AAP-33942 is addressed
describe.skip('Automation Calculator', () => {
  let organization: Organization;
  let project: Project;
  let inventory: Inventory;
  let job_template: JobTemplate;

  before(() => {
    // launch template that will fail
    cy.createAwxOrganization().then((org) => {
      organization = org;

      cy.createAwxProject(
        organization,
        { name: randomE2Ename() },
        'https://github.com/ansible/test-playbooks'
      ).then((proj) => {
        project = proj;
        cy.createAwxInventory(organization)
          .then((i) => {
            inventory = i;
          })
          .then(() => {
            cy.createAwxJobTemplate(
              {
                organization: organization.id,
                project: project.id,
                inventory: inventory.id,
              },
              'fail.yml'
            ).then((jt) => {
              job_template = jt;
              cy.navigateTo('awx', 'templates');
              cy.verifyPageTitle('Templates');
              cy.filterTableBySingleSelect('name', job_template.name);
              cy.intercept('POST', awxAPI`/job_templates/${job_template.id.toString()}/launch/`).as(
                'launched'
              );
              cy.clickTableRowPinnedAction(job_template.name, 'launch-template', false);
              cy.wait('@launched')
                .its('response.body')
                .then((launched: Job) => {
                  const jobId = launched.id ? launched.id.toString() : '';
                  cy.waitForJobToProcessEvents(jobId, 'jobs');
                });
            });
          });
      });
    });
  });

  after(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('renders failed hosts count if one or more exists', () => {
    //set system credentials
    cy.navigateTo('awx', 'settings-system');
    cy.verifyPageTitle('System Settings');
    cy.clickButton(/^Edit$/);
    cy.get('[data-cy="redhat-username"]')
      .should('exist')
      .and('be.visible')
      .clear()
      .type('aa-qe-all');
    cy.get('[data-cy="redhat-password"]')
      .should('exist')
      .and('be.visible')
      .clear()
      .type('WeAreAnalyticsQE!');

    cy.get('[data-cy="automation-analytics-url"]')
      .should('exist')
      .and('be.visible')
      .clear()
      .type('https://console.redhat.com/api/ingress/v1/upload');

    cy.get('[data-cy="INSIGHTS_TRACKING_STATE"]').then(($checkbox) => {
      if (!$checkbox.is(':checked')) {
        cy.wrap($checkbox).check();
      }
    });
    cy.clickButton(/^Save$/);
    cy.contains(/^Automation Execution$/).click();
    cy.contains(/^Automation Decisions$/).click();
    cy.contains(/^Automation Calculator$/).click();
    cy.contains('Failed host count').should('exist');
  });
});
