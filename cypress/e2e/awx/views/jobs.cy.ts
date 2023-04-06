/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import {
  JobTemplate,
  UnifiedJobList,
} from '../../../../frontend/awx/interfaces/generated-from-swagger/api';

describe('jobs', () => {
  let jobTemplate: JobTemplate;
  let job: UnifiedJobList;

  before(() => {
    cy.awxLogin();

    cy.createAwxJobTemplate().then((template) => {
      jobTemplate = template;
      // Launch job to populate jobs list
      const templateId = jobTemplate.id ? jobTemplate.id.toString() : '';
      cy.requestPost<UnifiedJobList>(
        `/api/v2/job_templates/${templateId}/launch/`,
        {} as UnifiedJobList
      ).then((testJob) => {
        job = testJob;
      });
    });
  });

  after(() => {
    // Delete launched job
    const jobId = job.id ? job.id.toString() : '';
    cy.requestDelete(`/api/v2/jobs/${jobId}/`, true);
    cy.deleteAwxJobTemplate(jobTemplate);
  });

  it('renders jobs list', () => {
    cy.navigateTo(/^Jobs$/);
    cy.hasTitle(/^Jobs$/);
    cy.contains(job.name as string);
  });

  it('renders the toolbar and row actions', () => {
    cy.navigateTo(/^Jobs$/);
    cy.get('.pf-c-toolbar__group button.toggle-kebab').click();
    cy.get('.pf-c-dropdown__menu').within(() => {
      cy.contains(/^Delete selected jobs$/).should('exist');
      cy.contains(/^Cancel selected jobs$/).should('exist');
    });
    const jobName = job.name ? job.name : '';
    cy.contains('td', jobName)
      .parent()
      .within(() => {
        // Relaunch job
        cy.get('button[aria-label="Relaunch job"]').should('exist');
        cy.get('.pf-c-dropdown__toggle').click();
        // Delete job
        cy.get('.pf-c-dropdown__menu-item')
          .contains(/^Delete job$/)
          .should('exist');
        // Cancel job
        cy.get('.pf-c-dropdown__menu-item')
          .contains(/^Cancel job$/)
          .should('exist');
      });
  });

  it('renders additional details on expanding job row', () => {
    // Expand top row
    cy.get('button[id="expand-toggle0"]').click();
    cy.contains('dt', 'Inventory').next().should('contain', 'E2E Inventory');
    cy.contains('dt', 'Project').next().should('contain', 'E2E Project');
    cy.contains('dt', 'Launched by').next().should('contain', 'admin');
    cy.contains('dt', 'Execution Environment').next().should('contain', 'AWX EE (latest)');
    cy.contains('dt', 'Job Slice').next().should('contain', '0/1');
  });

  it('filters jobs by id', () => {
    cy.navigateTo(/^Jobs$/);
    const jobId = job.id ? job.id.toString() : '';
    cy.switchToolbarFilter('ID');
    cy.get('#filter-input').type(jobId, { delay: 0 });
    cy.get('[aria-label="apply filter"]').click();
    cy.get('tr').should('have.length.greaterThan', 0);
    if (job.name) {
      cy.contains(job.name).should('be.visible');
    }
    cy.clickButton(/^Clear all filters$/);
  });

  it('deletes a job from the jobs list row', () => {
    const jobTemplateId = jobTemplate.id ? jobTemplate.id.toString() : '';
    cy.requestPost<UnifiedJobList>(
      `/api/v2/job_templates/${jobTemplateId}/launch/`,
      {} as UnifiedJobList
    ).then((testJob) => {
      cy.navigateTo(/^Jobs$/);
      cy.switchToolbarFilter('ID');
      const jobId = testJob.id ? testJob.id.toString() : '';
      const jobName = testJob.name ? testJob.name : '';
      cy.contains('td', jobName)
        .parent()
        .within(() => {
          cy.contains('.pf-c-alert__title', 'Successful');
        });
      cy.clickRowAction(jobId, /^Delete job$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete job/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.getRowFromList(jobId).should('not.exist');
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('deletes a job from the jobs list toolbar', () => {
    const jobTemplateId = jobTemplate.id ? jobTemplate.id.toString() : '';
    cy.requestPost<UnifiedJobList>(
      `/api/v2/job_templates/${jobTemplateId}/launch/`,
      {} as UnifiedJobList
    ).then((testJob) => {
      cy.navigateTo(/^Jobs$/);
      cy.switchToolbarFilter('ID');
      const jobId = testJob.id ? testJob.id.toString() : '';
      const jobName = job.name ? job.name : '';
      cy.contains('td', jobName)
        .parent()
        .within(() => {
          cy.contains('.pf-c-alert__title', 'Successful');
        });
      cy.selectRow(jobId);
      cy.clickToolbarAction(/^Delete selected jobs$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete job/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.getRowFromList(jobId).should('not.exist');
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('relaunches job and navigates to job output', () => {
    cy.navigateTo(/^Jobs$/);
    const jobName = job.name ? job.name : '';
    cy.contains('td', jobName)
      .parent()
      .within(() => {
        cy.get('button.relaunch-job').click();
      });
    cy.hasTitle(jobName).should('be.visible');
    cy.contains('.pf-c-tabs button', 'Output').should('have.attr', 'aria-selected', 'true');
    // Clean up newly launched job
    cy.url().then((url) => {
      const jobId = url.substring(url.lastIndexOf('/') + 1);
      cy.navigateTo(/^Jobs$/);
      cy.requestDelete(`/api/v2/jobs/${jobId}/`, true);
    });
  });
});
