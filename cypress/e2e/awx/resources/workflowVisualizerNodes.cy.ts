import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';

describe('Workflow Visualizer Nodes', function () {
  let organization: Organization;
  let project: Project;
  let inventory: Inventory;
  let inventorySource: InventorySource;

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

  it('create a project node with a success link and a workflow approval node', function () {
    cy.createAwxWorkflowJobTemplate({
      organization: (this.globalOrganization as Organization).id,
      inventory: inventory.id,
    }).then((workflowJobTemplate) => {
      cy.createAwxWorkflowVisualizerProjectNode(
        workflowJobTemplate,
        this.globalProject as Project
      ).then((projectNode) => {
        cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((approvalNode) => {
          cy.createWorkflowJTSuccessNodeLink(projectNode, approvalNode);
        });
      });
      cy.visit(`/ui_next/templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`);
      cy.contains('Workflow Visualizer').should('be.visible');
    });
  });

  it('create a project node with a success link to a job template node', function () {
    cy.createAwxJobTemplate({
      organization: (this.globalOrganization as Organization).id,
      project: (this.globalProject as Project).id,
      inventory: inventory.id,
    }).then((jobTemplate) => {
      cy.createAwxWorkflowJobTemplate({
        organization: (this.globalOrganization as Organization).id,
        inventory: inventory.id,
      }).then((workflowJobTemplate) => {
        cy.createAwxWorkflowVisualizerProjectNode(
          workflowJobTemplate,
          this.globalProject as Project
        ).then((projectNode) => {
          cy.createAwxWorkflowVisualizerJobTemplateNode(workflowJobTemplate, jobTemplate).then(
            (jobTemplateNode) => {
              cy.createAwxOrganization().then((org) => {
                organization = org;
                cy.createAwxProject({ organization: organization.id }).then((p) => {
                  project = p;
                  cy.createAwxInventorySource(inventory, project).then((invSrc) => {
                    inventorySource = invSrc;
                    cy.createAwxWorkflowVisualizerInventorySourceNode(
                      workflowJobTemplate,
                      inventorySource
                    ).then((InventorySourceNode) => {
                      cy.createAwxWorkflowVisualizerManagementNode(workflowJobTemplate, 2).then(
                        (managementNode) => {
                          cy.createWorkflowJTSuccessNodeLink(projectNode, jobTemplateNode);
                          cy.createWorkflowJTSuccessNodeLink(jobTemplateNode, InventorySourceNode);
                          cy.createWorkflowJTFailureNodeLink(InventorySourceNode, managementNode);
                        }
                      );
                    });
                  });
                });
              });
            }
          );
        });
        cy.visit(`/ui_next/templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`);
        cy.contains('Workflow Visualizer').should('be.visible');
        cy.contains(`${jobTemplate.name}`);
        cy.contains('button', 'Save').click();
        cy.navigateTo('awx', 'templates');
        cy.getTableRowByText(`${workflowJobTemplate.name}`).should('be.visible');
        cy.intercept('POST', `api/v2/workflow_job_templates/${workflowJobTemplate.id}/launch/`).as(
          'launchWJT-WithNodes'
        );
        cy.searchAndDisplayResource(`${workflowJobTemplate.name}`);
        /*
        add another test to launch from the details page and Visualizer page, once WF VZ work is done
        cy.get('[data-cy="launch-template"]').click();
        */
        cy.get('td[data-cy="actions-column-cell"] [data-cy="launch-template"]').click();
        cy.wait('@launchWJT-WithNodes')
          .its('response.body.id')
          .then((jobId: string) => {
            /*there is a known React create request error happening due the output tab work in progress */
            cy.waitForWorkflowJobStatus(jobId);
          });
        cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate);
      });
    });
  });
});
