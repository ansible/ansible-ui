/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { UnifiedJobList } from '../../../../frontend/awx/interfaces/generated-from-swagger/api';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Job } from '../../../../frontend/awx/interfaces/Job';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Jobs: List', () => {
  let inventory: Inventory;
  let jobTemplate: JobTemplate;
  let job: Job;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(function () {
    const globalOrganization = this.globalOrganization as Organization;
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
        cy.awxRequestPost(awxAPI`/job_templates/${jobTemplate.id.toString()}/launch/`, {}).then(
          (jl: Job) => {
            job = jl;
          }
        );
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxJob(job, { failOnStatusCode: false });
    cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
  });

  it('can render the jobs list', () => {
    cy.navigateTo('awx', 'jobs');
    cy.verifyPageTitle('Jobs');
    const jobId = job.id ? job.id.toString() : '';
    const jobName = job.name ? job.name : '';
    cy.filterTableByMultiSelect('id', [jobId]);
    cy.contains(jobName);
    cy.clearAllFilters();
  });

  it('can relaunch the job and navigate to job output', () => {
    cy.navigateTo('awx', 'jobs');
    const jobId = job.id ? job.id.toString() : '';
    const jobName = job.name ? job.name : '';
    cy.filterTableByMultiSelect('id', [jobId]);
    cy.clickTableRowPinnedAction(jobName, 'relaunch-job', false);
    cy.verifyPageTitle(jobName);
    cy.contains('.pf-v5-c-tabs a', 'Output').should('have.attr', 'aria-selected', 'true');
  });

  it('can render the toolbar and row actions', () => {
    cy.navigateTo('awx', 'jobs');
    cy.get('.pf-v5-c-toolbar__group button.toggle-kebab').click();
    cy.get('.pf-v5-c-dropdown__menu').within(() => {
      cy.contains(/^Delete selected jobs$/).should('exist');
      cy.contains(/^Cancel selected jobs$/).should('exist');
    });
    cy.filterTableByMultiSelect('id', [job.id ? job.id.toString() : '']);
    const jobName = job.name ? job.name : '';
    cy.contains('td', jobName)
      .parent()
      .within(() => {
        // Relaunch job
        cy.get('#relaunch-job').should('exist');
        cy.get('.pf-v5-c-dropdown__toggle').click();
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete job$/).should('exist');
      });
    cy.clearAllFilters();
  });

  it('can render additional details on expanding job row', () => {
    cy.navigateTo('awx', 'jobs');
    cy.filterTableByMultiSelect('id', [job.id ? job.id.toString() : '']);
    const jobName = job.name ? job.name : '';
    cy.expandTableRow(jobName, false);
    cy.hasDetail('Inventory', 'E2E Inventory');
    cy.hasDetail('Project', 'Project');
    // cy.hasDetail('Launched by', 'admin'); // not always admin
    cy.hasDetail('Job slice', '0/1');
    cy.clearAllFilters();
  });

  it('can filter jobs by id', () => {
    cy.navigateTo('awx', 'jobs');
    const jobId = job.id ? job.id.toString() : '';
    cy.filterTableByMultiSelect('id', [jobId]);
    cy.get('tr').should('have.length.greaterThan', 0);
    if (job.name) {
      cy.contains(job.name).should('be.visible');
    }
    cy.clearAllFilters();
  });
});

describe('Jobs: Delete', () => {
  let inventory: Inventory;
  let jobTemplate: JobTemplate;
  let jobList: UnifiedJobList;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(function () {
    const globalOrganization = this.globalOrganization as Organization;
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
        cy.awxRequestPost(awxAPI`/job_templates/${jobTemplate.id.toString()}/launch/`, {}).then(
          (jl) => {
            jobList = jl;
          }
        );
      });
    });
  });

  afterEach(() => {
    const jobId = jobList?.id ? jobList?.id.toString() : '';
    cy.awxRequestDelete(awxAPI`/jobs/${jobId}/`, { failOnStatusCode: false });
    cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
  });

  it('can delete a job from the jobs list row', () => {
    const jobTemplateId = jobTemplate.id ? jobTemplate.id.toString() : '';
    cy.requestPost<UnifiedJobList>(awxAPI`/job_templates/${jobTemplateId}/launch/`, {}).then(
      (testJob) => {
        cy.navigateTo('awx', 'jobs');
        const jobId = testJob.id ? testJob.id.toString() : '';
        cy.filterTableByMultiSelect('id', [jobId]);
        const jobName = testJob.name ? testJob.name : '';
        cy.waitForJobToProcessEvents(jobId);
        cy.get('[data-cy="refresh"]').click();
        cy.contains('tr', jobName, { timeout: 60 * 1000 }).should('contain', 'Success');
        cy.clickTableRowKebabAction(jobName, 'delete-job', false);
        cy.get('.pf-v5-c-modal-box__footer')
          .prev()
          .find('td[data-cy="status-column-cell"]')
          .within(() => {
            cy.contains('Success').should('be.visible');
          });
        cy.get('input[id="confirm"]').should('be.visible');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete job/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
        cy.contains('tr', jobId).should('not.exist');
        cy.clickButton(/^Clear all filters$/);
      }
    );
  });

  it('can delete a job from the jobs list toolbar', () => {
    const jobTemplateId = jobTemplate.id ? jobTemplate.id.toString() : '';
    cy.requestPost<UnifiedJobList>(awxAPI`/job_templates/${jobTemplateId}/launch/`, {}).then(
      (testJob) => {
        cy.navigateTo('awx', 'jobs');
        const jobId = testJob.id ? testJob.id.toString() : '';
        cy.filterTableByMultiSelect('id', [jobId]);
        const jobName = jobList.name ? jobList.name : '';
        cy.waitForJobToProcessEvents(jobId);
        cy.get('[data-cy="refresh"]').click();
        cy.contains('tr', jobName, { timeout: 60 * 1000 }).should('contain', 'Success');
        cy.selectTableRow(jobName, false);
        cy.clickToolbarKebabAction('delete-selected-jobs');
        cy.get('.pf-v5-c-modal-box__footer')
          .prev()
          .find('td[data-cy="status-column-cell"]')
          .within(() => {
            cy.contains('Success').should('be.visible');
          });
        cy.get('input[id="confirm"]').should('be.visible');
        cy.get('#confirm').click();
        cy.clickButton(/^Delete job/);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
        cy.contains('tr', jobId).should('not.exist');
        cy.clickButton(/^Clear all filters$/);
      }
    );
  });
});

describe('Jobs: Output Screen', () => {
  it.skip('can launch a Playbook Run job, let it finish, and assert expected results on the output screen', () => {
    //Create a job template with a functioning playbook
    //Assert details and launch
    //Navigate to the output screen of the job and assert details there
  });

  it.skip('can launch a Management job, let it finish, and assert expected results on the output screen', () => {
    //Access an existing management job
    //Assert details and launch
    //Navigate to the output screen of the job and assert details there
  });

  it.skip('can launch a Source Control Update job, let it finish, and assert expected results on the output screen', () => {
    //Create a project, sync will happen automatically
    //Navigate to the output screen of the job and assert details there
  });

  it.skip('can launch a Workflow job, let it finish, and assert expected results on the output screen', () => {
    //Create a workflow job template with at least one node
    //Assert details and launch
    //Navigate to the output screen of the job and assert details there
  });

  it.skip('can launch an Inventory Sync job, let it finish, and assert expected results on the output screen', () => {
    //Create an inventory with one source
    //Assert details, navigate to Source list and trigger Sync
    //Navigate to the output screen of the job and assert details there
  });
});

describe('Jobs: Details Screen', () => {
  it.skip('can launch a Playbook Run job, let it finish, and assert expected results on the details screen', () => {
    //Create a job template with a functioning playbook
    //Assert details and launch
    //Navigate to the details screen of the job and assert info there
  });

  it.skip('can launch a Management job, let it finish, and assert expected results on the details screen', () => {
    //Access an existing management job
    //Assert details and launch
    //Navigate to the details screen of the job and assert info there
  });

  it.skip('can launch a Source Control Update job, let it finish, and assert expected results on the details screen', () => {
    //Create a project, sync will happen automatically
    //Navigate to the details screen of the job and assert info there
  });

  it.skip('can launch a Workflow job, let it finish, and assert expected results on the details screen', () => {
    //Create a workflow job template with at least one node
    //Assert details and launch
    //Navigate to the details screen of the job and assert info there
  });

  it.skip('can launch an Inventory Sync job, let it finish, and assert expected results on the details screen', () => {
    //Create an inventory with one source
    //Assert details, navigate to Source list and trigger Sync
    //Navigate to the details screen of the job and assert info there
  });
});
