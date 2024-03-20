import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { WorkflowNode } from '../../../../frontend/awx/interfaces/WorkflowNode';

describe('Workflow Visualizer', () => {
  let organization: Organization;
  let project: Project;
  let inventory: Inventory;
  let inventorySource: InventorySource;
  let jobTemplate: JobTemplate;
  let workflowJobTemplate: WorkflowJobTemplate;
  let projectNode: WorkflowNode;
  let jobTemplateNode: WorkflowNode;

  before(function () {
    organization = this.globalOrganization as Organization;
    project = this.globalProject as Project;
    cy.awxLogin();

    cy.createAwxInventory({ organization: organization.id })
      .then((i) => {
        inventory = i;
      })
      .then(() => {
        cy.createAwxInventorySource(inventory, project).then((invSrc) => {
          inventorySource = invSrc;
        });
        cy.createAwxJobTemplate({
          organization: organization.id,
          project: project.id,
          inventory: inventory.id,
        }).then((jt) => (jobTemplate = jt));
      });
  });

  beforeEach(function () {
    cy.createAwxWorkflowJobTemplate({
      organization: organization.id,
      inventory: inventory.id,
    }).then((wfjt) => (workflowJobTemplate = wfjt));
  });

  afterEach(() => {
    cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
  });

  after(function () {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
    cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
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
      cy.visit(`/templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`);
      cy.contains('Workflow Visualizer').should('be.visible');
      cy.get('[data-cy="workflow-visualizer-toolbar-kebab"]').click();
      cy.intercept('POST', `api/v2/workflow_job_templates/${workflowJobTemplate.id}/launch/`).as(
        'launchWJT-WithNodes'
      );
      cy.clickButton('Launch');
      cy.wait('@launchWJT-WithNodes')
        .its('response.body.id')
        .then((jobId: string) => {
          cy.url().should('contain', `/jobs/workflow/${jobId}/output`);
        });
    });

    it('Can configure the prompt on launch values of a node, launch the job, and view the output screen', function () {
      cy.visit(`/templates/job_template/${jobTemplate?.id}/details`);
      cy.getByDataCy('edit-template').click();
      cy.contains('Edit Job Template').should('be.visible');
      cy.getByDataCy('ask_variables_on_launch').click();
      cy.getByDataCy('Submit').click();
      cy.visit(`/templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`);
      cy.contains('Workflow Visualizer').should('be.visible');
      cy.get(`g[data-id=${jobTemplateNode.id}] .pf-topology__node__action-icon`).click({
        force: true,
      });
      cy.get('li[data-cy="edit-node"]').click();
      cy.contains('Edit step').should('be.visible');
      cy.getByDataCy('Submit').click();
      cy.getByDataCy('wizard-nav-item-nodePromptsStep').click();
      cy.get('[class="view-lines monaco-mouse-cursor-text"]').type('foo: bar');
      cy.getByDataCy('Submit').click();
      cy.get('.scrollable-inner').scrollIntoView({ offset: { top: 150, left: 0 } });
      cy.getByDataCy('extra-vars').should('contain', 'foo: bar');
      cy.getByDataCy('wizard-next').click();
      cy.getByDataCy('workflow-visualizer-toolbar-save').click();
      cy.get('[data-cy="alert-toaster"]').should(
        'have.text',
        'Success alert:Successfully saved workflow visualizer'
      );
      cy.get('[data-cy="alert-toaster"]').within(() => {
        cy.get('[class="pf-v5-c-alert__action"]').click();
      });
      cy.getByDataCy('workflow-visualizer-toolbar-kebab').click();
      cy.getByDataCy('workflow-visualizer-toolbar-launch').click();
      cy.contains('Output').should('be.visible');
      cy.contains('Running').should('be.visible');
      cy.contains('Unreachable').should('be.visible');
      cy.get(`g[class*="node-label"]`).contains(jobTemplate.name).should('be.visible');
      cy.get(`g[class*="node-label"]`).contains(project.name).should('be.visible');
      cy.contains('Success').should('be.visible');
    });
  });
});
