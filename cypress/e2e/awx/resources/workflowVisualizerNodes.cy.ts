import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { randomString } from '../../../../framework/utils/random-string';

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
      cy.visit(`/templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`);
      cy.get('[data-cy="wf-vzr-title"]')
        .should('contain', 'Workflow Visualizer')
        .should('be.visible');
      cy.get('[data-cy="wf-vzr-name"]')
        .should('contain', `${workflowJobTemplate.name}`)
        .should('be.visible');
      cy.contains('button', 'Save').click();
      //uncomment when workflow approvals is working along with quick starts
      /*
      cy.navigateTo('awx', 'templates');
      cy.intercept('POST', `api/v2/workflow_job_templates/${workflowJobTemplate.id}/launch/`).as(
        'launchWJT-WithNodes'
      );
      cy.searchAndDisplayResource(`${workflowJobTemplate.name}`);
      cy.get('td[data-cy="actions-column-cell"] [data-cy="launch-template"]').click();
      cy.wait('@launchWJT-WithNodes')
        .its('response.body.id')
        .then((jobId: string) => {
          //there is a known React create request error happening due the output tab work in progress
          cy.waitForWorkflowJobStatus(jobId);
        });
        */
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate);
    });
  });

  it('create multiple nodes in the workflow job template, save and launch the template from list page', function () {
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
                    ).then((inventorySourceNode) => {
                      cy.createAwxWorkflowVisualizerManagementNode(workflowJobTemplate, 2).then(
                        (managementNode) => {
                          cy.createWorkflowJTSuccessNodeLink(projectNode, jobTemplateNode);
                          cy.createWorkflowJTSuccessNodeLink(jobTemplateNode, inventorySourceNode);
                          cy.createWorkflowJTFailureNodeLink(inventorySourceNode, managementNode);
                        }
                      );
                    });
                  });
                });
              });
            }
          );
        });
        cy.visit(`/templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`);
        cy.get('[data-cy="wf-vzr-title"]')
          .should('contain', 'Workflow Visualizer')
          .should('be.visible');
        cy.get('[data-cy="wf-vzr-name"]')
          .should('contain', `${workflowJobTemplate.name}`)
          .should('be.visible');
        cy.contains('button', 'Save').click();
        cy.navigateTo('awx', 'templates');
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
            /*there is a known React error, `create request error` happening due the output tab work in progress,but the test executes fine since there is no ui interaction here*/
            cy.waitForWorkflowJobStatus(jobId);
          });
        cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate);
      });
    });
  });

  it('create nodes in the workflow job template, save and launch the template from details page', function () {
    cy.createAwxWorkflowJobTemplate({
      organization: (this.globalOrganization as Organization).id,
      inventory: inventory.id,
    }).then((workflowJobTemplate) => {
      cy.createAwxWorkflowVisualizerProjectNode(
        workflowJobTemplate,
        this.globalProject as Project
      ).then((projectNode) => {
        cy.createAwxWorkflowVisualizerManagementNode(workflowJobTemplate, 2).then(
          (managementNode) => {
            cy.createWorkflowJTSuccessNodeLink(projectNode, managementNode);
          }
        );
      });
      cy.visit(`/templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`);
      cy.get('[data-cy="wf-vzr-title"]')
        .should('contain', 'Workflow Visualizer')
        .should('be.visible');
      cy.get('[data-cy="wf-vzr-name"]')
        .should('contain', `${workflowJobTemplate.name}`)
        .should('be.visible');
      cy.contains('button', 'Save').click();
      cy.get('[data-cy="workflow-visualizer-toolbar-close"]').click();
      cy.intercept('POST', `api/v2/workflow_job_templates/${workflowJobTemplate.id}/launch/`).as(
        'launchWJT-WithNodes'
      );
      cy.get('[data-cy="launch-template"]').click();
      cy.wait('@launchWJT-WithNodes')
        .its('response.body.id')
        .then((jobId: string) => {
          //there is a known React create request error happening due the output tab work in progress
          cy.waitForWorkflowJobStatus(jobId);
        });
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate);
    });
  });

  it('edit a node and links using the kebab menu of the visualizer in the workflow job template, save and launch the template', function () {
    const approvalNodeName = 'E2E-Approval-Node ' + randomString(4);
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
        // });
        cy.visit(`templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`);
        cy.get('[data-cy="wf-vzr-title"]')
          .should('contain', 'Workflow Visualizer')
          .should('be.visible');
        cy.get('[data-cy="wf-vzr-name"]')
          .should('contain', `${workflowJobTemplate.name}`)
          .should('be.visible');
        cy.contains('button', 'Save').click();
        cy.intercept('GET', 'api/v2/projects/?page_size=200').as('getProjects');
        cy.editNodeInVisualizer(
          `${(this.globalProject as Project).name}`,
          'Approval',
          approvalNodeName
        );
        cy.wait('@getProjects');
        cy.clickButton(/^Next/);
        cy.clickButton(/^Finish/);
        cy.contains(`${approvalNodeName}`).should('be.visible');
        //cy.intercept('PATCH', `api/v2/workflow_job_template_nodes/${workflowJobTemplate.id}/`).as('saveEditedNode');
        cy.get('[data-cy="workflow-visualizer-toolbar-save"]').click();
        // cy.wait('@saveEditedNode');
        //cy.contains(`${(this.globalProject as Project).name}`).should('not.exist');
      });
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate);
    });
  });

  it('remove a node and links using the kebab menu of the node in the visualizer', function () {
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
        // });
        cy.visit(`/templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`);
        cy.get('[data-cy="wf-vzr-title"]')
          .should('contain', 'Workflow Visualizer')
          .should('be.visible');
        cy.get('[data-cy="wf-vzr-name"]')
          .should('contain', `${workflowJobTemplate.name}`)
          .should('be.visible');
        cy.contains('button', 'Save').click();
        cy.removeNodeInVisualizer(`${(this.globalProject as Project).name}`);
        cy.contains(`${(this.globalProject as Project).name}`).should('not.exist');
      });
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate);
    });
  });
  it('remove all nodes using the kebab menu of the visualizer toolbar, save and delete the template', function () {
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
      cy.contains('button', 'Save').click();
      //remove-node, add-node-and-link, add-link, add-link, edit-node
      cy.removeAllNodesFromVisualizerToolbar();
      // cy.get('[data-cy="workflow-visualizer-toolbar-close"]').click();
      // cy.intercept('POST', `api/v2/workflow_job_templates/${workflowJobTemplate.id}/launch/`).as(
      //   'launchWJT-WithNodes'
      // );
      // cy.get('[data-cy="launch-template"]').click();
      // cy.wait('@launchWJT-WithNodes')
      //   .its('response.body.id')
      //   .then((jobId: string) => {
      //     cy.waitForWorkflowJobStatus(jobId);
      //   });
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate);
    });
  });
});
