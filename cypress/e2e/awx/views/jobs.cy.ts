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
    cy.navigateTo(/^Jobs$/, false);
    cy.hasTitle(/^Jobs$/);
    cy.contains(job.name as string);
  });

  it('renders the toolbar and row actions', () => {
    cy.get('.pf-c-toolbar__group button.toggle-kebab').click();
    cy.get('.pf-c-dropdown__menu').within(() => {
      cy.contains(/^Delete selected jobs$/).should('exist');
      cy.contains(/^Cancel selected jobs$/).should('exist');
    });
    const jobName = job.name ? job.name : '';
    cy.contains('td', jobName)
      .parent()
      .within(() => {
        cy.get('.pf-c-dropdown__toggle').click();
        cy.get('.pf-c-dropdown__menu-item')
          .contains(/^Delete job$/)
          .should('exist');
        cy.get('.pf-c-dropdown__menu-item')
          .contains(/^Cancel job$/)
          .should('exist');
      });
  });

  it('filters jobs by id', () => {
    cy.get('.pf-c-select__toggle').click();
    cy.clickButton('ID');
    const jobId = job.id ? job.id.toString() : '';
    cy.get('#filter-input').type(jobId, { delay: 0 });
    cy.get('[aria-label="apply filter"]').click();
    cy.get('tr').should('have.length.greaterThan', 0);
    if (job.name) {
      cy.contains(job.name).should('be.visible');
    }
    cy.clickButton(/^Clear all filters$/);
  });

  it('deletes a job from the jobs list row', () => {
    cy.get('.pf-c-select__toggle').click();
    cy.clickButton('ID');
    const jobTemplateId = jobTemplate.id ? jobTemplate.id.toString() : '';
    cy.requestPost<UnifiedJobList>(
      `/api/v2/job_templates/${jobTemplateId}/launch/`,
      {} as UnifiedJobList
    ).then((testJob) => {
      cy.navigateTo(/^Jobs$/, false);
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
    cy.get('.pf-c-select__toggle').click();
    cy.clickButton('ID');
    const jobTemplateId = jobTemplate.id ? jobTemplate.id.toString() : '';
    cy.requestPost<UnifiedJobList>(
      `/api/v2/job_templates/${jobTemplateId}/launch/`,
      {} as UnifiedJobList
    ).then((testJob) => {
      cy.navigateTo(/^Jobs$/, false);
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
});
