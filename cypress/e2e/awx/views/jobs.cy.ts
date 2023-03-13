/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import {
  JobTemplate,
  UnifiedJobList,
} from '../../../../frontend/awx/interfaces/generated-from-swagger/api';
import { AwxResources } from '../../../support/commands';

describe('jobs', () => {
  let jobTemplate: JobTemplate;
  let job: UnifiedJobList;

  before(() => {
    cy.awxLogin();

    cy.createBaselineResourcesForAWX().then((resources) => {
      jobTemplate = (resources as AwxResources).jobTemplate;
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
  });

  it('jobs list', () => {
    cy.navigateTo(/^Jobs$/, false);
    cy.hasTitle(/^Jobs$/);
  });

  it('toolbar and row actions', () => {
    cy.get('pf-c-toolbar__content #toggle-kebab').click();
    cy.get('pf-c-dropdown__menu').within(() => {
      cy.contains('/^Delete selected jobs$/').should('be.visible');
      cy.contains('/^Cancel selected jobs$/').should('be.visible');
    });
    cy.get('tr .toggle-kebab')
      .first()
      .within(() => {
        cy.contains('/^Delete job$/').should('be.visible');
        cy.contains('/^Cancel job$/').should('be.visible');
      });
  });

  it('filter job by id', () => {
    cy.get('.pf-c-select__toggle').click();
    cy.clickButton('ID');
    const jobId = job.id ? job.id.toString() : '';
    cy.get('#filter-input').type(jobId, { delay: 0 });
    cy.get('[aria-label="apply filter"]').click();
    cy.get('tr').should('have.length.greaterThan', 0);
    if (job.name) {
      cy.contains(job.name).should('be.visible');
    }
  });

  it('jobs table row: delete job', () => {
    cy.get('.pf-c-select__toggle').click();
    cy.clickButton('ID');
    const jobTemplateId = jobTemplate.id ? jobTemplate.id.toString() : '';
    cy.requestPost<UnifiedJobList>(
      `/api/v2/job_templates/${jobTemplateId}/launch/`,
      {} as UnifiedJobList
    ).then((testJob) => {
      cy.navigateTo(/^Jobs$/, false);
      const jobId = testJob.id ? testJob.id.toString() : '';
      cy.clickRowAction(jobId, /^Delete job$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete job/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.getRowFromList(jobId).should('not.exist');
      cy.clickButton(/^Clear all filters$/);
    });
  });

  it('jobs toolbar: delete job', () => {
    cy.get('.pf-c-select__toggle').click();
    cy.clickButton('ID');
    const jobTemplateId = jobTemplate.id ? jobTemplate.id.toString() : '';
    cy.requestPost<UnifiedJobList>(
      `/api/v2/job_templates/${jobTemplateId}/launch/`,
      {} as UnifiedJobList
    ).then((testJob) => {
      cy.navigateTo(/^Jobs$/, false);
      const jobId = testJob.id ? testJob.id.toString() : '';
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
