import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { WorkflowJob } from '../../../../frontend/awx/interfaces/WorkflowJob';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { WorkflowNode } from '../../../../frontend/awx/interfaces/WorkflowNode';
import { WorkflowApproval } from '../../../../frontend/awx/interfaces/WorkflowApproval';

const wFApprovURL = '/administration/workflow-approvals/';
const wFApprovName = 'E2E WFJT Approval Request ' + randomString(4); // custom name to make it easier to filter for this specific test spec
const numOfBulkActions = 5; // times to execute the jobs

describe('Workflow Approvals', () => {
  let organization: Organization;
  let project: Project;
  let user: AwxUser;
  let userWFApprove: AwxUser;
  let userWFDeny: AwxUser;
  let userWFCancel: AwxUser;
  let inventory: Inventory;
  let inventorySource: InventorySource;
  let jobTemplate: JobTemplate;
  let workflowJobTemplate: WorkflowJobTemplate;
  let wfjobTemplateNode: WorkflowNode;
  let approvalWFNode: WorkflowNode;
  const concurrentWFJTemplates: WorkflowJobTemplate[] = [];
  const concurrentWorkflowJobIDs: number[] = [];
  const workflowApprovalList: WorkflowApproval[] = [];
  // FIXME: find a way to retrieve and assert all IDs reliably
  // const workflowApprovalListIDs: number[] = [];

  before(() => {
    cy.awxLogin();

    cy.createAwxOrganization()
      .then((o) => {
        organization = o;
        cy.createAwxProject().then((p) => {
          project = p;
        });
      })
      .then(() => {
        cy.createAwxUser(organization).then((u) => {
          user = u;
        });
        cy.createAwxUser(organization).then((u) => {
          userWFApprove = u;
        });
        cy.createAwxUser(organization).then((u) => {
          userWFDeny = u;
        });
        cy.createAwxUser(organization).then((u) => {
          userWFCancel = u;
        });
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
  });

  after(() => {
    // TODO: is it needed to delete workflowJobs?
    cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
    cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
    cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxUser(userWFApprove, { failOnStatusCode: false });
    cy.deleteAwxUser(userWFCancel, { failOnStatusCode: false });
    cy.deleteAwxUser(userWFDeny, { failOnStatusCode: false });
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  describe('List View', () => {
    describe('List View - Single Job', () => {
      before(() => {
        /* Creates a workflow job template and add an approval node before it*/
        cy.createAwxWorkflowJobTemplate({
          organization: organization.id,
          inventory: inventory.id,
        }).then((wfjt) => {
          workflowJobTemplate = wfjt;
          cy.createAwxWorkflowVisualizerWJTNode(workflowJobTemplate).then((wfjtNode) => {
            wfjobTemplateNode = wfjtNode;
          });
          cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((appNode) => {
            approvalWFNode = appNode;
            cy.createWorkflowJTAlwaysNodeLink(approvalWFNode, wfjobTemplateNode);
          });
        });
      });

      beforeEach(() => {
        // FIXME: Launch template using the API
        cy.intercept(
          'POST',
          `api/v2/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
        ).as('launchWFJT');
        cy.visit(`/templates/workflow_job_template/${workflowJobTemplate.id.toString()}/details`);
        cy.getByDataCy('launch-template').click();
      });

      it.skip('admin can create a WF approval and assign user with access to approve and then delete the WF from the list toolbar', () => {
        // cy.giveUserWfjtAccess(workflowJobTemplate.name, userWFApprove.id, 'Approve');
      });

      it.skip('admin can create a WF approval and assign user with access to deny and then delete the WF from the list toolbar', () => {
        // cy.giveUserWfjtAccess(workflowJobTemplate.name, userWFDeny.id, 'Deny');
      });

      it.skip('admin can create a WF approval and assign user with access to cancel and then delete the WF from the list toolbar', () => {
        // cy.giveUserWfjtAccess(workflowJobTemplate.name, userWFCancel.id, 'Cancel');
      });

      it('admin can approve and then delete a workflow approval from the list row item', () => {
        cy.wait('@launchWFJT')
          .its('response.body')
          .then((response: WorkflowJob) => {
            expect(response.id).to.exist;
            cy.getAwxWFApprovalByWorkflowJobID(response.id).then((wFApprov) => {
              actAssertAndDeleteWorkflowApproval('approve', `${wFApprov.id}`);
            });
          });
      });

      it('admin can deny and then delete a workflow approval from the list row item', () => {
        cy.wait('@launchWFJT')
          .its('response.body')
          .then((response: WorkflowJob) => {
            expect(response.id).to.exist;
            cy.getAwxWFApprovalByWorkflowJobID(response.id).then((wFApprov) => {
              actAssertAndDeleteWorkflowApproval('deny', `${wFApprov.id}`);
            });
          });
      });

      it('admin can cancel and then delete a workflow approval from the list row item', () => {
        cy.wait('@launchWFJT')
          .its('response.body')
          .then((response: WorkflowJob) => {
            expect(response.id).to.exist;
            cy.getAwxWFApprovalByWorkflowJobID(response.id).then((wFApprov) => {
              cy.log('WFA', wFApprov);
              actAssertAndDeleteWorkflowApproval('cancel', `${wFApprov.id}`);
            });
          });
      });
    });

    describe('List View - Concurrent Jobs', () => {
      before(() => {
        /* Creates a workflow job template with concurrent jobs enabled and add an approval node before it*/
        cy.createAwxWorkflowJobTemplate({
          allow_simultaneous: true,
          organization: organization.id,
          inventory: inventory.id,
        }).then((wfjt) => {
          workflowJobTemplate = wfjt;
          cy.createAwxWorkflowVisualizerWJTNode(workflowJobTemplate).then((wfjtNode) => {
            wfjobTemplateNode = wfjtNode;
          });
          cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate, wFApprovName).then(
            (appNode) => {
              approvalWFNode = appNode;
              cy.createWorkflowJTAlwaysNodeLink(approvalWFNode, wfjobTemplateNode);
            }
          );
        });
      });

      beforeEach(() => {
        /* Executes the same job N times, assert all jobs executed successfully
        validates the data received and save it in lists to be used during test assertion */
        for (let i = 0; i < numOfBulkActions; i++) {
          cy.intercept(
            'POST',
            `api/v2/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
          ).as('launchWFJT');
          // FIXME: Launch template using the API
          cy.visit(`/templates/workflow_job_template/${workflowJobTemplate.id.toString()}/details`);
          cy.getByDataCy('launch-template').click();
          cy.wait('@launchWFJT')
            .its('response')
            .then((response) => {
              expect(response?.statusCode).to.eql(201);
              const workflowJob: WorkflowJob = response?.body as WorkflowJob;
              cy.wrap(workflowJob).then((workflowJob) => {
                expect(workflowJob.id).to.exist;
                concurrentWFJTemplates.push(workflowJobTemplate);
                concurrentWorkflowJobIDs.push(workflowJob.id);
                cy.getAwxWFApprovalByWorkflowJobID(workflowJob.id).then((wFApprov) => {
                  workflowApprovalList.push(wFApprov);
                  // FIXME: find a way to retrieve and assert all IDs reliably
                  // workflowApprovalListIDs.push(wFApprov.id);
                });
              });
            });
        }
      });

      it('admin can enable concurrent jobs in a WFJT with a WF approval node, launch the job multiple times, bulk approve, and then bulk delete from the list toolbar', () => {
        bulkActAssertAndDeleteWorkflowApproval('approve');
      });

      it('admin can enable concurrent jobs in a WFJT with a WF approval node, launch the job multiple times, bulk deny, and then bulk delete from the list toolbar', () => {
        bulkActAssertAndDeleteWorkflowApproval('deny');
      });
    });
  });

  describe('Detail Screen', () => {
    before('', () => {});
    // Workflow Approval Detail Screen (not yet implemented in the new UI):
    // User can approve a workflow approval from the details screen
    // User can deny a workflow approval from the details screen
    // User can cancel a workflow approval from the details screen
    // User can approve or deny a workflow approval from the list view and then visit the details page of the workflow approval to delete it.
  });

  describe('Job Output Screen', () => {
    before('', () => {});
    // Workflow Approval Job Output Screen (not yet implemented in the new UI):
    // User can access the output screen of a running workflow job template with a workflow approval node, access the workflow approval details page by clicking on the node in the output screen, and approve the workflow approval.
    // User can access the output screen of a running workflow job template with a workflow approval node, access the workflow approval details page by clicking on the node in the output screen, and deny the workflow approval.
    // User can deny a workflow approval, visit the output screen of the workflow approval job, click on the node of the failed job, and see that the reason for the failure is that the workflow approval was denied.
    // User can visit the workflow visualizer of a workflow job template from the workflow approval details screen.
  });

  describe('Job Details Screen', () => {
    before('', () => {});
    // Workflow Approval Job Details Screen (not yet implemented in the new UI):
    // User can relaunch the workflow from the workflow approval job details screen.
    // User can cancel the workflow from the workflow approval job details screen.
  });
});

/* Shared functions across test cases */

/* This function executes an action (approve/deny or cancel), assert the action, deletes the workflow approval
and assert it again */
function actAssertAndDeleteWorkflowApproval(
  selectorDataCy: 'approve' | 'deny' | 'cancel',
  wFApprovID: string
) {
  let actionStatusCode: number;
  let statusText: string;
  let actionURL: string;

  // FIXME: Use navigateTo after including code to launch job via API instead of UI
  cy.visit(wFApprovURL);

  // Determine which API, status code and action to be asserted
  switch (selectorDataCy) {
    case 'approve':
      actionURL = '**/approve';
      actionStatusCode = 204;
      statusText = 'Approved';
      break;
    case 'deny':
      actionURL = '**/deny';
      actionStatusCode = 204;
      statusText = 'Denied';
      break;
    case 'cancel':
      actionURL = '**/cancel';
      actionStatusCode = 202;
      statusText = 'Canceled';
      break;
  }
  cy.intercept({
    method: 'POST',
    url: `${actionURL}`,
  }).as('wFApprovAction');
  cy.getTableRow('id', wFApprovID)
    .within(() => {
      cy.getByDataCy('actions-column-cell').within(() => {
        cy.getByDataCy(selectorDataCy).click();
      });
    })
    .then(() => {
      // The cancel action doesn't open a confirmation modal
      if (selectorDataCy !== 'cancel') {
        cy.actionsWFApprovalConfirmModal(selectorDataCy);
      }
    });
  cy.wait('@wFApprovAction')
    .its('response')
    .then((response) => {
      expect(response?.statusCode).to.eql(actionStatusCode);
    });
  // needs to reload since the page takes some time to update the status
  cy.reload();
  cy.getByDataCy('status-column-cell').should('have.text', statusText);
  cy.intercept({
    method: 'DELETE',
    url: 'api/v2/workflow_approvals/*',
  }).as('deleteWFApprov');
  cy.getByDataCy('actions-column-cell').within(() => {
    cy.clickKebabAction('actions-dropdown', 'delete-workflow-approval');
  });
  cy.actionsWFApprovalConfirmModal('delete');
  cy.wait('@deleteWFApprov')
    .its('response')
    .then((response) => {
      expect(response?.statusCode).to.eql(204);
    });
}

/* This function executes an action (approve/deny or cancel) on a of list of workflow approvals,
assert the action, deletes the all the workflow approvals and assert it again */
function bulkActAssertAndDeleteWorkflowApproval(selectorDataCy: 'approve' | 'deny') {
  let actionStatusCode: number;
  let statusText: string;
  let actionURL: string;

  // FIXME: Use navigateTo after including code to launch job via API instead of UI
  cy.visit(wFApprovURL);

  // Determine which API, status code and action to be asserted
  switch (selectorDataCy) {
    case 'approve':
      actionURL = '**/approve';
      actionStatusCode = 204;
      statusText = 'Approved';
      break;
    case 'deny':
      actionURL = '**/deny';
      actionStatusCode = 204;
      statusText = 'Denied';
      break;
  }
  cy.intercept({
    method: 'POST',
    url: `${actionURL}`,
  }).as('wFApprovAction');

  cy.filterTableByTextFilter('name', wFApprovName);
  // FIXME: click is fired but the element doesn't change.
  // cy.getByDataCy('select-all').should('be.visible').click({ force: true });
  // cy.get('[data-ouia-component-id="page-toolbar"]').within(() => {
  //   // cy.get('label').invoke('attr', 'for').should('equal', 'select-all').click();
  //   cy.get('input#select-all').check().trigger('click');
  // });
  // workaround to select all workflow approvals filtered
  cy.get('table').within(() => {
    cy.getByDataCy('checkbox-column-cell').click({ multiple: true });
  });
  // makes sure at least the select all toolbar button is updated with the selection of multiple rows
  cy.get('[data-ouia-component-id="page-toolbar"]')
    .within(() => {
      cy.contains('selected');
      cy.getByDataCy(selectorDataCy).click();
    })
    .then(() => {
      cy.actionsWFApprovalConfirmModal(selectorDataCy);
    });
  cy.wait('@wFApprovAction')
    .its('response')
    .then((response) => {
      expect(response?.statusCode).to.eql(actionStatusCode);
    });
  // needs to reload since the page takes some time to update the status
  cy.reload();
  // FIXME: workaround for bulk actions, cypress finds all lines and repeats the work N times
  cy.getByDataCy('status-column-cell').should('have.text', statusText.repeat(numOfBulkActions));
  cy.intercept({
    method: 'DELETE',
    url: 'api/v2/workflow_approvals/*',
  }).as('deleteWFApprov');
  cy.get('table')
    .within(() => {
      cy.getByDataCy('checkbox-column-cell').click({ multiple: true });
    })
    .then(() => {
      // Assert the delete action was fired N times
      cy.get('[data-ouia-component-id="page-toolbar"]').within(() => {
        cy.clickKebabAction('actions-dropdown', 'delete');
      });
      cy.actionsWFApprovalConfirmModal('delete');
      cy.waitTimes('@deleteWFApprov', numOfBulkActions, 204);
    });
}
