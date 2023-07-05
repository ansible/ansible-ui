/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { UnifiedJobList } from '../../../../frontend/awx/interfaces/generated-from-swagger/api';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('jobs', () => {
  let organization: Organization;
  let jobTemplate: JobTemplate;
  let jobList: UnifiedJobList;

  before(() => {
    cy.awxLogin();

    cy.createAwxOrganization().then((o) => {
      organization = o;
      cy.createAwxProject({ organization: organization.id }).then((project) => {
        cy.createAwxInventory({ organization: organization.id }).then((inventory) => {
          cy.createAwxJobTemplate({
            organization: organization.id,
            project: project.id,
            inventory: inventory.id,
          }).then((jt) => {
            jobTemplate = jt;

            // Launch job to populate jobs list
            cy.requestPost<UnifiedJobList>(
              `/api/v2/job_templates/${jobTemplate.id.toString()}/launch/`,
              {}
            ).then((jl) => {
              jobList = jl;
            });
          });
        });
      });
    });
  });

  after(() => {
    // Delete launched job
    const jobId = jobList?.id ? jobList?.id.toString() : '';
    cy.requestDelete(`/api/v2/jobs/${jobId}/`, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization);
  });

  it('renders jobs list', () => {
    cy.navigateTo(/^Jobs$/);
    cy.hasTitle(/^Jobs$/);
    cy.contains(jobList.name as string);
  });

  it('relaunches job and navigates to job output', () => {
    cy.navigateTo(/^Jobs$/);
    const jobId = jobList.id ? jobList.id.toString() : '';
    const jobName = jobList.name ? jobList.name : '';
    cy.filterTableByTypeAndText('ID', jobId);
    cy.clickTableRowPinnedAction(jobName, 'Relaunch job', false);
    cy.hasTitle(jobName).should('be.visible');
    cy.contains('.pf-c-tabs a', 'Output').should('have.attr', 'aria-selected', 'true');
  });

  it('renders the toolbar and row actions', () => {
    cy.navigateTo(/^Jobs$/);
    cy.get('.pf-c-toolbar__group button.toggle-kebab').click();
    cy.get('.pf-c-dropdown__menu').within(() => {
      cy.contains(/^Delete selected jobs$/).should('exist');
      cy.contains(/^Cancel selected jobs$/).should('exist');
    });
    cy.filterTableByTypeAndText('ID', jobList.id ? jobList.id.toString() : '');
    const jobName = jobList.name ? jobList.name : '';
    cy.contains('td', jobName)
      .parent()
      .within(() => {
        // Relaunch job
        cy.get('#relaunch-job').should('exist');
        cy.get('.pf-c-dropdown__toggle').click();
        cy.contains('.pf-c-dropdown__menu-item', /^Delete job$/).should('exist');
      });
  });

  it('renders additional details on expanding job row', () => {
    cy.navigateTo(/^Jobs$/);
    cy.filterTableByTypeAndText('ID', jobList.id ? jobList.id.toString() : '');
    const jobName = jobList.name ? jobList.name : '';
    cy.expandTableRow(jobName, false);
    cy.hasDetail('Inventory', 'E2E Inventory');
    cy.hasDetail('Project', 'Project');
    // cy.hasDetail('Launched by', 'admin'); // not always admin
    cy.hasDetail('Job slice', '0/1');
  });

  it('filters jobs by id', () => {
    cy.navigateTo(/^Jobs$/);
    const jobId = jobList.id ? jobList.id.toString() : '';
    cy.selectToolbarFilterType('ID');
    cy.get('#filter-input').type(jobId, { delay: 0 });
    cy.get('[aria-label="apply filter"]').click();
    cy.get('tr').should('have.length.greaterThan', 0);
    if (jobList.name) {
      cy.contains(jobList.name).should('be.visible');
    }
    cy.clickButton(/^Clear all filters$/);
  });

  it('deletes a job from the jobs list row', () => {
    const jobTemplateId = jobTemplate.id ? jobTemplate.id.toString() : '';
    cy.requestPost<UnifiedJobList>(`/api/v2/job_templates/${jobTemplateId}/launch/`, {}).then(
      (testJob) => {
        cy.navigateTo(/^Jobs$/);
        const jobId = testJob.id ? testJob.id.toString() : '';
        cy.filterTableByTypeAndText('ID', jobId);
        const jobName = testJob.name ? testJob.name : '';
        cy.getTableRowByText(jobName, false).within(() => {
          cy.get('[data-label="Status"]', { timeout: 120 * 1000 }).should('not.contain', 'New');
          cy.get('[data-label="Status"]', { timeout: 120 * 1000 }).should('not.contain', 'Waiting');
          cy.get('[data-label="Status"]', { timeout: 120 * 1000 }).should('not.contain', 'Pending');
          cy.get('[data-label="Status"]', { timeout: 120 * 1000 }).should('not.contain', 'Running');
        });
        cy.clickTableRowKebabAction(jobName, /^Delete job$/, false);
        cy.get('#confirm').click();
        cy.clickButton(/^Delete job/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
        cy.contains('tr', jobId).should('not.exist');
        cy.clickButton(/^Clear all filters$/);
      }
    );
  });

  it('deletes a job from the jobs list toolbar', () => {
    cy.requestPost<UnifiedJobList>(
      `/api/v2/job_templates/${jobTemplate.id.toString()}/launch/`,
      {} as UnifiedJobList
    ).then((jobList) => {
      cy.navigateTo(/^Jobs$/);
      const jobId = jobList.id ? jobList.id.toString() : '';
      cy.filterTableByTypeAndText('ID', jobId);
      const jobName = jobList.name ? jobList.name : '';
      cy.getTableRowByText(jobName, false).within(() => {
        cy.get('[data-label="Status"]', { timeout: 120 * 1000 }).should('not.contain', 'New');
        cy.get('[data-label="Status"]', { timeout: 120 * 1000 }).should('not.contain', 'Waiting');
        cy.get('[data-label="Status"]', { timeout: 120 * 1000 }).should('not.contain', 'Pending');
        cy.get('[data-label="Status"]', { timeout: 120 * 1000 }).should('not.contain', 'Running');
      });
      cy.selectTableRow(jobName, false);
      cy.clickToolbarKebabAction(/^Delete selected jobs$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete job/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.contains('tr', jobId).should('not.exist');
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
