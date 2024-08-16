import { randomString } from '../../../../framework/utils/random-string';
import { UnifiedJobList } from '../../../../frontend/awx/interfaces/generated-from-swagger/api';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { Job } from '../../../../frontend/awx/interfaces/Job';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Jobs', () => {
  let project: Project;
  let awxOrganization: Organization;
  let inventory: Inventory;
  let jobTemplate: JobTemplate;
  let job: Job;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      awxOrganization = org;
      cy.createAwxProject(awxOrganization).then((p) => {
        project = p;

        cy.createAwxInventory(awxOrganization).then((inv) => {
          inventory = inv;
        });
      });
    });
  });

  after(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  describe('Jobs List', () => {
    beforeEach(function () {
      cy.createAwxInventory(awxOrganization).then((inv) => {
        inventory = inv;
        cy.createAwxJobTemplate({
          organization: awxOrganization.id,
          project: project.id,
          inventory: inventory.id,
        }).then((jt) => {
          jobTemplate = jt;

          // Launch job to populate jobs list
          cy.requestPost<Job, Partial<Omit<Job, 'id'>>>(
            awxAPI`/job_templates/${jobTemplate.id.toString()}/launch/`,
            {}
          ).then((jl: Job) => {
            job = jl;
          });
        });
      });
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
      cy.contains(/^Delete jobs$/).should('exist');
      cy.contains(/^Cancel jobs$/).should('exist');
      cy.filterTableByMultiSelect('id', [job.id ? job.id.toString() : '']);
      const jobName = job.name ? job.name : '';
      cy.contains('td', jobName)
        .parent()
        .within(() => {
          // Relaunch job
          cy.get('#relaunch-job').should('exist');
          cy.getByDataCy('actions-dropdown').click();
        });
      cy.contains('#delete-job', /^Delete job$/).should('exist');
      cy.clearAllFilters();
    });

    it('can render additional details on expanding job row', () => {
      cy.navigateTo('awx', 'jobs');
      cy.filterTableByMultiSelect('id', [job.id ? job.id.toString() : '']);
      const jobName = job.name ? job.name : '';
      cy.expandTableRow(jobName, false);
      cy.hasDetail('Inventory', 'E2E Inventory');
      cy.hasDetail('Project', 'Project');
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
    beforeEach(function () {
      cy.createAwxInventory(awxOrganization).then((inv) => {
        inventory = inv;
        cy.createAwxJobTemplate({
          organization: awxOrganization.id,
          project: project.id,
          inventory: inventory.id,
        }).then((jt) => {
          jobTemplate = jt;
        });
      });

      afterEach(() => {
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
            cy.waitForJobToProcessEvents(jobId, 'jobs');
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
            const jobName = testJob.name ? testJob.name : '';
            cy.waitForJobToProcessEvents(jobId, 'jobs');
            cy.get('[data-cy="refresh"]').click();
            cy.contains('tr', jobName, { timeout: 60 * 1000 }).should('contain', 'Success');
            cy.selectTableRow(jobName, false);
            cy.clickToolbarKebabAction('delete-jobs');
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
  });

  describe('Jobs: Output and Details Screen', () => {
    let thisId: string;

    it('can launch a Management job, let it finish, and assert expected results on the output screen', () => {
      cy.navigateTo('awx', 'management-jobs');
      cy.verifyPageTitle('Management Jobs');
      cy.filterTableBySingleSelect('name', 'Cleanup Expired Sessions');
      cy.intercept('POST', awxAPI`/system_job_templates/*/launch/`).as('postLaunch');
      cy.getByDataCy('launch-management-job').click();
      cy.wait('@postLaunch')
        .then((response) => {
          expect(response?.response?.statusCode).to.eql(201);
        })
        .its('response.body.id')
        .then((jobId: string) => {
          thisId = jobId;
          cy.waitForManagementJobToProcess(thisId);
        });
      cy.verifyPageTitle('Cleanup Expired Sessions');
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes(`/jobs/management/${thisId}/output`)).to.be.true;
      });
    });

    it('can launch a Source Control Update job, let it finish, and assert expected results on the output screen', function () {
      const projectName = 'E2E Project Jobs ' + randomString(4);
      cy.navigateTo('awx', 'projects');
      cy.verifyPageTitle('Projects');
      cy.clickLink(/^Create project$/);
      cy.get('[data-cy="name"]').type(projectName);
      cy.singleSelectByDataCy('organization', `${awxOrganization.name}`);
      cy.selectDropdownOptionByResourceName('source_control_type', 'Git');
      cy.get('[data-cy="scm-url"]').type('https://github.com/ansible/ansible-ui');
      cy.intercept('POST', awxAPI`/projects/`).as('newProject');
      cy.clickButton(/^Create project$/);
      cy.wait('@newProject')
        .then((response) => {
          expect(response?.response?.statusCode).to.eql(201);
        })
        .its('response.body')
        .then((newProject: Project) => {
          thisId = newProject.summary_fields.current_update.id.toString();
          expect(newProject.status).contains('pending');
          cy.waitForProjectToFinishSyncing(newProject.id);
          cy.getByDataCy('name').should('contain', projectName);
          cy.getByDataCy('source-control-type').should('contain', 'Git');
          cy.getByDataCy('last-job-status').should('contain', 'Success');
          cy.clickLink(/^Success$/);
          cy.verifyPageTitle(projectName);
          cy.url().then((currentUrl) => {
            expect(currentUrl.includes(`/jobs/project/${thisId}/output`)).to.be.true;
          });
          cy.clickTab(/^Details$/, true);
          cy.url().then((currentUrl) => {
            expect(currentUrl.includes(`/jobs/project/${thisId}/details`)).to.be.true;
          });
          cy.getByDataCy('name').should('contain', projectName);
          cy.getByDataCy('type').should('contain', 'Source control update');
          cy.getByDataCy('status').should('contain', 'Success');
          cy.deleteAwxProject(newProject, { failOnStatusCode: false });
        });
    });
  });

  describe('Job template: Output and Details Screen', () => {
    let inventory: Inventory;
    let jobTemplate: JobTemplate;

    beforeEach(function () {
      cy.createAwxInventory(awxOrganization).then((i) => {
        inventory = i;
        cy.createAwxJobTemplate({
          organization: awxOrganization.id,
          project: project.id,
          inventory: inventory.id,
        }).then((jt) => {
          jobTemplate = jt;
        });
      });
    });

    afterEach(() => {
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    it('can launch a Playbook Run job, let it finish, and assert expected results on the output screen', () => {
      cy.navigateTo('awx', 'templates');
      cy.verifyPageTitle('Templates');
      cy.filterTableBySingleSelect('name', jobTemplate.name);
      cy.intercept('POST', awxAPI`/job_templates/${jobTemplate.id.toString()}/launch/`).as(
        'postLaunch'
      );
      cy.getByDataCy('launch-template').click();
      cy.wait('@postLaunch')
        .then((response) => {
          expect(response?.response?.statusCode).to.eql(201);
        })
        .its('response.body')
        .then((job: Job) => {
          cy.waitForTemplateStatus(job.id.toString());
          cy.verifyPageTitle(jobTemplate.name);
          cy.url().then((currentUrl) => {
            expect(currentUrl.includes(`/jobs/playbook/${job.id}/output`)).to.be.true;
          });
          cy.clickTab(/^Details$/, true);
          cy.url().then((currentUrl) => {
            expect(currentUrl.includes(`/jobs/playbook/${job.id}/details`)).to.be.true;
          });
          cy.getByDataCy('name').should('contain', jobTemplate.name);
          cy.getByDataCy('status').should('contain', 'Success');
          cy.getByDataCy('inventory').should('contain', inventory.name);
        });
    });
  });

  describe('Inventory source: Output and Details Screen', () => {
    let inventory: Inventory;
    let inventorySource: InventorySource;

    beforeEach(function () {
      cy.createAwxInventory(awxOrganization).then((i) => {
        inventory = i;
        cy.createAwxInventorySource(inventory, project).then((invSrc) => {
          inventorySource = invSrc;
        });
      });
    });

    afterEach(() => {
      cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    it('can launch an Inventory Sync job, let it finish, and assert expected results on the output screen', () => {
      cy.navigateTo('awx', 'inventories');
      cy.verifyPageTitle('Inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      cy.clickTab(/^Sources$/, true);
      cy.intercept('POST', awxAPI`/inventory_sources/${inventorySource.id.toString()}/update/`).as(
        'postLaunch'
      );
      cy.getByDataCy('launch-inventory-update').click();
      cy.wait('@postLaunch')
        .then((response) => {
          expect(response?.response?.statusCode).to.eql(202);
        })
        .its('response.body')
        .then((inv: Inventory) => {
          cy.clickTab(/^Jobs$/, true);
          cy.filterTableBySingleSelect('name', inventorySource.name);
          cy.clickTableRowLink('name', inventorySource.name, { disableFilter: true });
          cy.url().then((currentUrl) => {
            expect(currentUrl.includes(`/jobs/inventory/${inv.id}/details`)).to.be.true;
          });
        });
    });
  });

  //Workflow template: Output and Details Screen tests live in the workflowJobTemplates.cy.ts spec file
});
