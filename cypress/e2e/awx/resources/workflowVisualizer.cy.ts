import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { WorkflowNode } from '../../../../frontend/awx/interfaces/WorkflowNode';

describe('Workflow Job templates visualizer', () => {
  let organization: Organization;
  let inventory: Inventory;
  let project: Project;
  let inventorySource: InventorySource;

  function cleanup() {
    cy.clickPageAction('delete-template');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete template/);
    cy.verifyPageTitle('Template');
  }
  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxOrganization().then((o) => {
      organization = o;
      cy.createAwxInventory({ organization: organization.id }).then((i) => {
        inventory = i;
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('should render a workflow visualizer view with multiple nodes present', () => {
    cy.createAwxWorkflowJobTemplate({
      organization: organization.id,
      inventory: inventory.id,
    }).then((workflowJobTemplate) => {
      cy.renderWorkflowVisualizerNodesFromFixtureFile(
        `${workflowJobTemplate.name}`,
        'wf_vis_testing_A.json'
      );
      cy.get('[class*="66-node-label"]')
        .should('exist')
        .should('contain', 'Cleanup Activity Stream');
      cy.get('[class*="43-node-label"]').should('exist').should('contain', 'bar');
      cy.get('[class*="42-node-label"]').should('exist').should('contain', '1');
      cy.get('[class*="41-node-label"]').should('exist').should('contain', 'Demo Project');
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate);
    });
  });

  it('Should create a workflow job template and then navigate to the visualizer, and then navigate to the details view after clicking cancel', () => {
    const jtName = 'E2E ' + randomString(4);
    // Create workflow job template
    cy.navigateTo('awx', 'templates');
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create workflow job template$/);
    cy.get('[data-cy="name"]').type(jtName);
    cy.get('[data-cy="description"]').type('this is a description');
    cy.get('[data-cy="Submit"]').click();

    cy.get('[data-cy="workflow-visualizer"]').should('be.visible');
    cy.get('h4.pf-v5-c-empty-state__title-text').should(
      'have.text',
      'There are currently no nodes in this workflow'
    );
    cy.get('div.pf-v5-c-empty-state__actions').within(() => {
      cy.get('[data-cy="add-node-button"]').should('be.visible');
    });

    cy.get('button[data-cy="workflow-visualizer-toolbar-close"]').click();

    // Clean up - delete workflow job template
    cleanup();
  });
  it('Click on edge context menu option to change link type and close visualizer to show unsaved changes modal', function () {
    let projectNode: WorkflowNode;
    let approvalNode: WorkflowNode;
    let workflowJobTemplate: WorkflowJobTemplate;
    cy.createAwxWorkflowJobTemplate({
      organization: (this.globalOrganization as Organization).id,
      inventory: inventory.id,
    })
      .then((wfjt) => {
        workflowJobTemplate = wfjt;
        cy.createAwxWorkflowVisualizerProjectNode(
          workflowJobTemplate,
          this.globalProject as Project
        ).then((projNode) => {
          projectNode = projNode;
          cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((appNode) => {
            approvalNode = appNode;
            cy.createWorkflowJTSuccessNodeLink(projectNode, appNode);
          });
        });
      })
      .then(() => {
        cy.visit(`/templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`);
        cy.contains('Workflow Visualizer').should('be.visible');
        cy.get(`g[data-id="${projectNode.id}-${approvalNode.id}"]`).should(
          'have.text',
          'Run on success'
        );
        cy.get(`g[data-id="${projectNode.id}-${approvalNode.id}"]`).within(() => {
          cy.get('[data-cy="edge-context-menu_kebab"]').click({ force: true });
        });
        cy.get('li[data-cy="fail"]').click();
        cy.get('button[data-cy="workflow-visualizer-toolbar-close"]').click();
        cy.get('div[data-cy="visualizer-unsaved-changes-modal"]').should('be.visible');
        cy.get('button[data-cy="exit-without-saving"]').click();
        cy.verifyPageTitle(`${workflowJobTemplate.name}`);
      });
    // Clean up
    cleanup();
  });
  it('Adds a new node linked to an existing node with always status, and save the visualizer.', function () {
    let projectNode: WorkflowNode;
    let approvalNode: WorkflowNode;
    let workflowJobTemplate: WorkflowJobTemplate;
    let jobTemplate: JobTemplate;
    cy.createAwxJobTemplate({
      organization: (this.globalOrganization as Organization).id,
      project: (this.globalProject as Project).id,
      inventory: inventory.id,
    }).then((jt) => (jobTemplate = jt));
    cy.createAwxWorkflowJobTemplate({
      organization: (this.globalOrganization as Organization).id,
      inventory: inventory.id,
    })
      .then((wfjt) => {
        workflowJobTemplate = wfjt;
        cy.createAwxWorkflowVisualizerProjectNode(
          workflowJobTemplate,
          this.globalProject as Project
        ).then((projNode) => {
          projectNode = projNode;
          cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((appNode) => {
            approvalNode = appNode;
            cy.createWorkflowJTSuccessNodeLink(projectNode, appNode);
          });
        });
      })
      .then(() => {
        cy.visit(`/templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`);
        cy.contains('Workflow Visualizer').should('be.visible');
        cy.get(`g[data-id=${approvalNode.id}] .pf-topology__node__action-icon`).click({
          force: true,
        });
        cy.get('li[data-cy="add-node-and-link"]').click();

        cy.selectDropdownOptionByResourceName('node-type', 'Job Template');
        cy.selectDropdownOptionByResourceName('job-template-select', `${jobTemplate.name}`);
        cy.selectDropdownOptionByResourceName('node-status-type', 'Always');
        cy.selectDropdownOptionByResourceName('node-convergence', 'All');
        cy.get('[data-cy="node-alias"]').type('Test Node');
        cy.clickButton('Next');
        cy.clickButton('Finish');
        cy.get('g[data-id="3-unsavedNode"]').should('have.text', 'Test Node');
        cy.get(`g[data-id=${approvalNode.id}-3-unsavedNode]`).should('have.text', 'Run always');
        cy.clickButton('Save');
        cy.get('[data-cy="alert-toaster"]').should('be.visible');
        cy.get('[data-cy="wf-vzr-name"]').should('have.text', `${workflowJobTemplate.name}`);
        cy.get('button[data-cy="workflow-visualizer-toolbar-close"]').click();
        cy.verifyPageTitle(`${workflowJobTemplate.name}`);
      });
    // Clean up
    cleanup();
  });
  it('Remove all nodes using the kebab menu of the visualizer toolbar, save and delete the template', function () {
    cy.createAwxWorkflowJobTemplate({
      organization: (this.globalOrganization as Organization).id,
      inventory: inventory.id,
    }).then((workflowJobTemplate) => {
      cy.createAwxWorkflowVisualizerProjectNode(
        workflowJobTemplate,
        this.globalProject as Project
      ).then((projectNode) => {
        cy.createAwxOrganization().then((org) => {
          organization = org;
          cy.createAwxProject({ organization: organization.id }).then((p) => {
            project = p;
            cy.createAwxInventorySource(inventory, project).then((invSrc) => {
              inventorySource = invSrc;
              cy.createAwxWorkflowVisualizerInventorySourceNode(
                workflowJobTemplate,
                inventorySource
              ).then((inventorySourceNode) => {
                cy.createAwxWorkflowVisualizerManagementNode(workflowJobTemplate, 1).then(
                  (managementNode) => {
                    cy.createWorkflowJTSuccessNodeLink(projectNode, inventorySourceNode);
                    cy.createWorkflowJTAlwaysNodeLink(inventorySourceNode, managementNode);
                  }
                );
              });
            });
          });
        });
      });
      cy.visit(`/templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`);
      cy.get('[data-cy="wf-vzr-title"]')
        .should('contain', 'Workflow Visualizer')
        .should('be.visible');
      cy.get('[data-cy="wf-vzr-name"]')
        .should('contain', `${workflowJobTemplate.name}`)
        .should('be.visible');
      //remove-node, add-node-and-link, add-link, add-link, edit-node
      cy.removeAllNodesFromVisualizerToolbar();
      cy.contains('button', 'Save').click();
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate);
    });
  });
});
