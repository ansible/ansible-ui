import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';

describe('Workflow Job templates visualizer', function () {
  let organization: Organization;
  let project: Project;
  let inventory: Inventory;
  let inventorySource: InventorySource;

  before(function () {
    cy.awxLogin();
    cy.createAwxInventory({ organization: (this.globalProjectOrg as Organization).id }).then(
      (i) => {
        inventory = i;
      }
    );
  });
  afterEach(() => {
    // cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    // cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('create a project node with a success link and a workflow approval node', function () {
    const globalOrganization = this.globalProjectOrg as Organization;
    const globalProject = this.globalProject as Project;

    cy.createAwxWorkflowJobTemplate({
      organization: globalOrganization.id,
      inventory: inventory.id,
    }).then((workflowJobTemplate) => {
      cy.createAwxWorkflowVisualizerProjectNode(workflowJobTemplate, globalProject).then(
        (projectNode) => {
          cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((approvalNode) => {
            cy.createWorkflowJTFailureNodeLink(projectNode, approvalNode);
          });
        }
      );
      cy.visit(
        `/ui_next/resources/templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`
      );
      cy.contains('Workflow Visualizer').should('be.visible');
    });
  });

  it('create a project node with a success link to a job template node', function () {
    const globalOrganization = this.globalProjectOrg as Organization;
    const globalProject = this.globalProject as Project;
    cy.createAwxJobTemplate({
      organization: globalOrganization.id,
      project: globalProject.id,
      inventory: inventory.id,
    }).then((jobTemplate) => {
      cy.createAwxWorkflowJobTemplate({
        organization: globalOrganization.id,
        inventory: inventory.id,
      }).then((workflowJobTemplate) => {
        cy.createAwxWorkflowVisualizerProjectNode(workflowJobTemplate, globalProject).then(
          (projectNode) => {
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
                        cy.createAwxWorkflowVisualizerManagementNode(workflowJobTemplate, 1).then(
                          (managementNode) => {
                            cy.createWorkflowJTSuccessNodeLink(projectNode, jobTemplateNode);
                            cy.createWorkflowJTSuccessNodeLink(
                              jobTemplateNode,
                              InventorySourceNode
                            );
                            cy.createWorkflowJTFailureNodeLink(InventorySourceNode, managementNode);
                          }
                        );
                      });
                    });
                  });
                });
              }
            );
          }
        );
        cy.visit(
          `/ui_next/resources/templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`
        );
        cy.contains('Workflow Visualizer').should('be.visible');
        cy.contains(`${jobTemplate.name}`);
        cy.contains('button', 'Save').click();
        cy.navigateTo('awx', 'templates');
        cy.filterTableByText(`${workflowJobTemplate.name}`);
        cy.intercept('POST', `/api/v2/workflow_job_templates/${workflowJobTemplate.id}/launch/`).as(
          'launchWJT-WithNodes'
        );
        cy.get('td[data-cy="actions-column-cell"] [data-cy="launch-template"]').click();
        cy.wait('@launchWJT-WithNodes').then((resp) => {
          expect(resp.response.statusCode).to.equal(201);
        });
      });
    });
  });
});
