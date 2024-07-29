import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { Job } from '../../../../frontend/awx/interfaces/Job';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { WorkflowNode } from '../../../../frontend/awx/interfaces/WorkflowNode';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Workflow Visualizer', () => {
  let awxOrganization: Organization;
  let project: Project;
  let inventory: Inventory;
  let inventorySource: InventorySource;
  let jobTemplate: JobTemplate;
  let workflowJobTemplate: WorkflowJobTemplate;
  let projectNode: WorkflowNode;
  let jobTemplateNode: WorkflowNode;

  before(function () {
    cy.createAwxOrganization().then((thisAwxOrg) => {
      awxOrganization = thisAwxOrg;
    });
  });

  beforeEach(function () {
    cy.createAwxInventory(awxOrganization)
      .then((i) => {
        inventory = i;
      })
      .then(() => {
        cy.createAwxProject(awxOrganization).then((proj) => {
          project = proj;

          cy.createAwxInventorySource(inventory, project).then((invSrc) => {
            inventorySource = invSrc;

            cy.createAwxJobTemplate({
              organization: awxOrganization.id,
              project: project.id,
              inventory: inventory.id,
            }).then((jt) => {
              jobTemplate = jt;

              cy.createAwxWorkflowJobTemplate({
                organization: awxOrganization.id,
                inventory: inventory.id,
              }).then((wfjt) => (workflowJobTemplate = wfjt));
            });
          });
        });
      });
  });

  afterEach(() => {
    cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
    cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
  });

  after(() => {
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  describe('Workflow Visualizer- Job Output', () => {
    beforeEach(function () {
      cy.createAwxWorkflowVisualizerProjectNode(workflowJobTemplate, project).then((projNode) => {
        projectNode = projNode;
        cy.createAwxWorkflowVisualizerJobTemplateNode(workflowJobTemplate, jobTemplate).then(
          (jtNode) => {
            jobTemplateNode = jtNode;
            cy.createWorkflowJTSuccessNodeLink(projectNode, jobTemplateNode);
          }
        );
      });
    });

    it('Should launch a workflow job template from the visualizer, and navigate to the output page.', function () {
      cy.intercept(
        'GET',
        awxAPI`/unified_job_templates/?type=job_template%2Cworkflow_job_template&order_by=name&page=1&page_size=10`
      ).as('getWorkflowJobTemplates');
      cy.navigateTo('awx', 'templates');
      cy.verifyPageTitle('Templates');
      cy.wait('@getWorkflowJobTemplates').then(() => {
        cy.filterTableBySingleSelect('name', `${workflowJobTemplate?.name}`);
        cy.clickTableRowAction('name', `${workflowJobTemplate?.name}`, 'launch-template', {
          inKebab: false,
          disableFilter: true,
        });
        cy.intercept(
          'POST',
          awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch/`
        ).as('launchWJT-WithNodes');
        cy.wait('@launchWJT-WithNodes')
          .its('response.body.id')
          .then((jobId: string) => {
            cy.url().should('contain', `/jobs/workflow/${jobId}/output`);
          });
      });
    });

    it.skip('Can configure the prompt on launch values of a node, launch the job, and view the output screen', function () {
      cy.navigateTo('awx', 'templates');
      cy.verifyPageTitle('Templates');
      cy.filterTableBySingleSelect('name', `${jobTemplate?.name}`);
      cy.clickTableRowAction('name', `${jobTemplate?.name}`, 'edit-template', {
        inKebab: false,
        disableFilter: true,
      });
      cy.verifyPageTitle('Edit Job Template');
      cy.getByDataCy('ask_variables_on_launch').click();
      cy.getByDataCy('Submit').click();
      cy.verifyPageTitle(`${jobTemplate?.name}`);
      cy.navigateTo('awx', 'templates');
      cy.verifyPageTitle('Templates');
      cy.filterTableBySingleSelect('name', `${workflowJobTemplate?.name}`);
      cy.clickTableRowAction('name', `${workflowJobTemplate?.name}`, 'view-workflow-visualizer', {
        inKebab: false,
        disableFilter: true,
      });
      cy.contains('Workflow Visualizer').should('be.visible');
      cy.get('[data-cy="wf-vzr-name"]').should('have.text', `${workflowJobTemplate?.name}`);
      cy.getBy(`g[data-id=${jobTemplateNode.id}] .pf-topology__node__action-icon`).click({
        force: true,
      });
      cy.getBy('li[data-cy="edit-node"]').click();
      cy.contains('Edit step').should('be.visible');
      cy.getByDataCy('Submit').click();
      cy.getByDataCy('wizard-nav-item-promptStep').click();
      cy.getBy('[class="view-lines monaco-mouse-cursor-text"]').type('foo: bar');
      cy.getByDataCy('Submit').click();
      cy.getBy('.scrollable-inner').scrollIntoView({ offset: { top: 150, left: 0 } });
      cy.get('[data-cy="extra-vars"]')
        .scrollIntoView({ offset: { top: 150, left: 0 } })
        .should('contain', 'foo: bar');
      cy.getByDataCy('wizard-next').click();
      cy.getByDataCy('workflow-visualizer-toolbar-save').click();
      cy.getBy('.pf-v5-c-alert__action').click();
      cy.getByDataCy('workflow-visualizer-toolbar-kebab').click();
      cy.intercept(
        'POST',
        awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch/`
      ).as('launch');
      cy.getByDataCy('workflow-visualizer-toolbar-launch').click();
      cy.wait('@launch')
        .its('response.body')
        .then((job: Job) => {
          cy.url().should('contain', `/output`);
          cy.contains('Running').should('be.visible');
          cy.waitForWorkflowJobStatus(`${job.id}`).then(() => {
            cy.getBy(`g[class*="node-label"]`).contains(jobTemplate.name).should('be.visible');
            cy.getBy(`g[class*="node-label"]`).contains(project.name).should('be.visible');
            cy.contains('Success').should('be.visible');
          });
        });
    });

    it('can view the details pages of related job on a WFJT either by clicking the job nodes or by toggling the Workflow Jobs dropdown', function () {
      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [workflowJobTemplate.name]);
      cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
      cy.get('a[href*="/visualizer"]').click();
      cy.contains('Workflow Visualizer').should('be.visible');
      cy.getBy('[data-cy="workflow-visualizer-toolbar-kebab"]').click();
      cy.intercept(
        'POST',
        awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch/`
      ).as('launchWJT-WithNodes');
      cy.clickButton('Launch');
      cy.wait('@launchWJT-WithNodes')
        .its('response.body')
        .then((job: Job) => {
          cy.intercept('GET', awxAPI`/workflow_jobs/${job.id.toString()}/`).as('firstJob');
          cy.url().should('contain', `/jobs/workflow/${job.id}/output`);
          cy.wait('@firstJob');
          cy.contains(project.name).click({ force: true });
          cy.intercept('GET', awxAPI`/workflow_jobs/${job.id.toString()}/**`).as('job');
          cy.getByDataCy(project.name).should('be.visible');
          cy.getByDataCy('Output').should('be.visible');
          cy.intercept('POST', awxAPI`/workflow_jobs/${job.id.toString()}/relaunch/`).as(
            'relaunchWJT-WithNodes'
          );
          cy.navigateTo('awx', 'jobs');
          const jobId = job.id ? job.id.toString() : '';
          const jobName = job.name ? job.name : '';
          cy.filterTableByMultiSelect('id', [jobId]);
          cy.clickTableRowPinnedAction(jobName, 'relaunch-job', false);
          cy.wait('@job', { timeout: 10000 });
          cy.wait('@relaunchWJT-WithNodes')
            .its('response.body')
            .then((relaunch: Job) => {
              cy.intercept(
                'GET',
                awxAPI`/workflow_jobs/${relaunch.id.toString()}/workflow_nodes/**`
              ).as('wfNodes');
              cy.wait('@wfNodes')
                .its('response.body.results[1]')
                .then((results: WorkflowNode) => {
                  cy.getByDataCy('page-title')
                    .should('be.visible')
                    .and('contain', `${workflowJobTemplate.name}`);
                  cy.intercept('GET', awxAPI`/workflow_jobs/${jobId}/workflow_nodes/**`).as('jobs');
                  cy.getBy('button[id="fit-to-screen"]').click();
                  cy.contains(jobTemplate.name).should('be.visible');
                  cy.getByDataCy('relaunch-job').should('be.visible');
                  cy.getBy(`g[data-id="${results.id}"]`)
                    .getBy('[data-cy="successful-icon"]')
                    .should('be.visible');
                  cy.getBy('g[data-id]')
                    .contains(project.name)
                    .within(() => {
                      cy.contains(project.name).click({ force: true });
                    });
                  cy.getByDataCy(`${project.name}`).should('be.visible');
                  cy.getByDataCy('Output').should('be.visible');
                  cy.contains('button', 'Workflow Job 1/1')
                    .click()
                    .then(() => {
                      cy.contains(project.name).click();
                    });
                  cy.wait(5000);
                  cy.getByDataCy('page-title').should('be.visible').and('contain', project.name);
                  cy.contains('button', 'Workflow Job 1/1')
                    .click()
                    .then(() => {
                      cy.contains(`${project.name}`).click();
                    });
                });
            });
        });
    });
  });
});
