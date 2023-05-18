/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import {
  JobTemplate,
  UnifiedJobList,
} from '../../../../frontend/awx/interfaces/generated-from-swagger/api';
import { IAwxResources } from '../../../support/awx-commands';

describe('jobs', () => {
  let awxResources: IAwxResources;
  let jobTemplate: JobTemplate;
  let job: UnifiedJobList;

  before(() => {
    cy.awxLogin();

    cy.createAwxOrganizationProjectInventoryJobTemplate().then((resources) => {
      awxResources = resources;
      jobTemplate = resources.jobTemplate;

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
    cy.deleteAwxResources(awxResources);
  });

  it('renders jobs list', () => {
    cy.navigateTo(/^Jobs$/);
    cy.hasTitle(/^Jobs$/);
    cy.contains(job.name as string);
  });

  it('relaunches job and navigates to job output', () => {
    cy.navigateTo(/^Jobs$/);
    const jobId = job.id ? job.id.toString() : '';
    const jobName = job.name ? job.name : '';
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
    cy.filterTableByTypeAndText('ID', job.id ? job.id.toString() : '');
    const jobName = job.name ? job.name : '';
    cy.contains('td', jobName)
      .parent()
      .within(() => {
        // Relaunch job
        cy.get('#relaunch-job').should('exist');
        cy.get('.pf-c-dropdown__toggle').click();
        cy.contains('.pf-c-dropdown__menu-item', /^Delete job$/).should('exist');
        cy.contains('.pf-c-dropdown__menu-item', /^Cancel job$/, { timeout: 60 * 1000 }).should(
          'exist'
        );
      });
  });

  it('renders additional details on expanding job row', () => {
    cy.navigateTo(/^Jobs$/);
    cy.filterTableByTypeAndText('ID', job.id ? job.id.toString() : '');
    const jobName = job.name ? job.name : '';
    cy.expandTableRow(jobName, false);
    cy.hasDetail('Inventory', 'E2E Inventory');
    cy.hasDetail('Project', 'Project');
    // cy.hasDetail('Launched by', 'admin'); // not always admin
    cy.hasDetail('Job slice', '0/1');
  });

  it('filters jobs by id', () => {
    cy.navigateTo(/^Jobs$/);
    const jobId = job.id ? job.id.toString() : '';
    cy.selectToolbarFilterType('ID');
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
      const jobId = testJob.id ? testJob.id.toString() : '';
      cy.filterTableByTypeAndText('ID', jobId);
      const jobName = testJob.name ? testJob.name : '';
      cy.clickTableRowKebabAction(jobName, /^Delete job$/, false);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete job/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.contains('tr', jobId).should('not.exist');
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
      const jobId = testJob.id ? testJob.id.toString() : '';
      cy.filterTableByTypeAndText('ID', jobId);
      const jobName = job.name ? job.name : '';
      cy.tableHasRowWithSuccess(jobName, false);
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
