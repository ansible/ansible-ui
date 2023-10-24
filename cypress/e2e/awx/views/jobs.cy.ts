/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />

import { UnifiedJobList } from '../../../../frontend/awx/interfaces/generated-from-swagger/api';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';

describe('jobs', () => {
  let inventory: Inventory;
  let jobTemplate: JobTemplate;
  let jobList: UnifiedJobList;

  before(() => {
    cy.awxLogin();
  });

  before(function () {
    const globalOrganization = this.globalProjectOrg as Organization;
    const globalProject = this.globalProject as Project;
    cy.createAwxInventory({ organization: globalOrganization.id }).then((inv) => {
      inventory = inv;
      cy.createAwxJobTemplate({
        organization: globalOrganization.id,
        project: globalProject.id,
        inventory: inv.id,
      }).then((jt) => {
        jobTemplate = jt;

        // Launch job to populate jobs list
        cy.awxRequestPost(`/api/v2/job_templates/${jobTemplate.id.toString()}/launch/`, {}).then(
          (jl) => {
            jobList = jl;
          }
        );
      });
    });
  });

  after(() => {
    const jobId = jobList?.id ? jobList?.id.toString() : '';
    cy.awxRequestDelete(`/api/v2/jobs/${jobId}/`, { failOnStatusCode: false });
    cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
  });

  it('renders jobs list', () => {
    cy.navigateTo('awx', 'jobs');
    cy.verifyPageTitle('Jobs');
    const jobId = jobList.id ? jobList.id.toString() : '';
    const jobName = jobList.name ? jobList.name : '';
    cy.filterTableByTypeAndText('ID', jobId);
    cy.contains(jobName);
    cy.clickButton(/^Clear all filters$/);
  });

  it('relaunches job and navigates to job output', () => {
    cy.navigateTo('awx', 'jobs');
    const jobId = jobList.id ? jobList.id.toString() : '';
    const jobName = jobList.name ? jobList.name : '';
    cy.filterTableByTypeAndText('ID', jobId);
    cy.clickTableRowPinnedAction(jobName, 'relaunch-job', false);
    cy.verifyPageTitle(jobName);
    cy.contains('.pf-v5-c-tabs a', 'Output').should('have.attr', 'aria-selected', 'true');
  });

  it('renders the toolbar and row actions', () => {
    cy.navigateTo('awx', 'jobs');
    cy.get('.pf-v5-c-toolbar__group button.toggle-kebab').click();
    cy.get('.pf-v5-c-dropdown__menu').within(() => {
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
        cy.get('.pf-v5-c-dropdown__toggle').click();
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete job$/).should('exist');
      });
    cy.clickButton(/^Clear all filters$/);
  });

  it('renders additional details on expanding job row', () => {
    cy.navigateTo('awx', 'jobs');
    cy.filterTableByTypeAndText('ID', jobList.id ? jobList.id.toString() : '');
    const jobName = jobList.name ? jobList.name : '';
    cy.expandTableRow(jobName, false);
    cy.hasDetail('Inventory', 'E2E Inventory');
    cy.hasDetail('Project', 'Project');
    // cy.hasDetail('Launched by', 'admin'); // not always admin
    cy.hasDetail('Job slice', '0/1');
    cy.clickButton(/^Clear all filters$/);
  });

  it('filters jobs by id', () => {
    cy.navigateTo('awx', 'jobs');
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
});

describe('job delete', () => {
  let inventory: Inventory;
  let jobTemplate: JobTemplate;
  let jobList: UnifiedJobList;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(function () {
    const globalOrganization = this.globalProjectOrg as Organization;
    const globalProject = this.globalProject as Project;
    cy.createAwxInventory({ organization: globalOrganization.id }).then((inv) => {
      inventory = inv;
      cy.createAwxJobTemplate({
        organization: globalOrganization.id,
        project: globalProject.id,
        inventory: inv.id,
      }).then((jt) => {
        jobTemplate = jt;

        // Launch job to populate jobs list
        cy.awxRequestPost(`/api/v2/job_templates/${jobTemplate.id.toString()}/launch/`, {}).then(
          (jl) => {
            jobList = jl;
          }
        );
      });
    });
  });

  afterEach(() => {
    const jobId = jobList?.id ? jobList?.id.toString() : '';
    cy.awxRequestDelete(`/api/v2/jobs/${jobId}/`, { failOnStatusCode: false });
    cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
  });

  it('deletes a job from the jobs list row', () => {
    const jobTemplateId = jobTemplate.id ? jobTemplate.id.toString() : '';
    cy.requestPost<UnifiedJobList>(`/api/v2/job_templates/${jobTemplateId}/launch/`, {}).then(
      (testJob) => {
        cy.navigateTo('awx', 'jobs');
        const jobId = testJob.id ? testJob.id.toString() : '';
        cy.filterTableByTypeAndText('ID', jobId);
        const jobName = testJob.name ? testJob.name : '';
        cy.getTableRowByText(jobName, false).within(() => {
          cy.get('[data-label="Status"]', { timeout: 120 * 1000 })
            .should('not.contain', 'New')
            .should('not.contain', 'Waiting')
            .should('not.contain', 'Pending')
            .should('not.contain', 'Running');
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
      cy.navigateTo('awx', 'jobs');
      const jobId = jobList.id ? jobList.id.toString() : '';
      cy.filterTableByTypeAndText('ID', jobId);
      const jobName = jobList.name ? jobList.name : '';
      cy.intercept(
        'GET',
        `/api/v2/unified_jobs/?not__launch_type=sync&id=${jobId}&order_by=-finished&page=1&page_size=10`
      ).as('jobRun');
      cy.getTableRowByText(jobName, false).within(() => {
        cy.wait('@jobRun');
        cy.get('[data-label="Status"]', { timeout: 120 * 1000 })
          .should('not.contain', 'New')
          .should('not.contain', 'Waiting')
          .should('not.contain', 'Pending')
          .should('not.contain', 'Running');
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
