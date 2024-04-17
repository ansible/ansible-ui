import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { WorkflowJob } from '../../../../frontend/awx/interfaces/WorkflowJob';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { WorkflowNode } from '../../../../frontend/awx/interfaces/WorkflowNode';
import { awxAPI } from '../../../support/formatApiPathForAwx';

/* Shared functions across test cases */
const wfaURL = '/administration/workflow-approvals/';
function actAssertAndDeleteWorkflowApproval(
  selectorDataCy: 'approve' | 'deny' | 'cancel',
  wfaID: number
) {
  let actionStatusCode: number;
  let statusText: string;
  let actionURL: string;

  cy.visit(wfaURL);

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
  }).as('WFaction');
  cy.filterTableByMultiSelect('id', [wfaID.toString()]);
  cy.getTableRow('id', wfaID.toString(), { disableFilter: true })
    .within(() => {
      cy.getByDataCy('actions-column-cell').within(() => {
        cy.getByDataCy(selectorDataCy).click();
      });
    })
    .then(() => {
      if (selectorDataCy !== 'cancel') {
        cy.actionsWFApprovalConfirmModal(selectorDataCy);
      }
    });
  cy.wait('@WFaction')
    .its('response')
    .then((response) => {
      expect(response?.statusCode).to.eql(actionStatusCode);
    });
  cy.reload();
  cy.getByDataCy('status-column-cell').should('have.text', statusText);
  cy.intercept({
    method: 'DELETE',
    url: 'api/v2/workflow_approvals/*',
  }).as('deleteWFA');
  cy.getByDataCy('actions-column-cell').within(() => {
    cy.clickKebabAction('actions-dropdown', 'delete-workflow-approval');
  });
  cy.actionsWFApprovalConfirmModal('delete');
  cy.wait('@deleteWFA')
    .its('response')
    .then((response) => {
      expect(response?.statusCode).to.eql(204);
    });
}

// describe('Workflow Approvals', () => {

// });
describe('Workflow Approvals - List View', () => {
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

  before(function () {
    organization = this.globalOrganization as Organization;
    project = this.globalProject as Project;
    cy.awxLogin();

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
  });

  // beforeEach(() => {
  // TODO: Launch template using the API
  // cy.intercept(
  //   'POST',
  //   awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
  // ).as('launchWFJT');
  // cy.visit(`/templates/workflow_job_template/${workflowJobTemplate.id.toString()}/details`);
  // cy.getByDataCy('launch-template').click();
  // });

  after(() => {
    cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
    cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
    cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxUser(userWFApprove, { failOnStatusCode: false });
    cy.deleteAwxUser(userWFCancel, { failOnStatusCode: false });
    cy.deleteAwxUser(userWFDeny, { failOnStatusCode: false });
  });

  it.skip('admin can create a WF approval and assign user with access to approve and then delete the WF from the list toolbar', () => {
    cy.giveUserWfjtAccess(workflowJobTemplate.name, userWFApprove.id, 'Approve');
  });

  it.skip('admin can create a WF approval and assign user with access to deny and then delete the WF from the list toolbar', () => {
    cy.giveUserWfjtAccess(workflowJobTemplate.name, userWFDeny.id, 'Approve');
  });

  it.skip('admin can create a WF approval and assign user with access to cancel and then delete the WF from the list toolbar', () => {
    cy.giveUserWfjtAccess(workflowJobTemplate.name, userWFCancel.id, 'Approve');
  });

  it.skip('admin can enable concurrent jobs in a WFJT with a WF approval node, launch the job multiple times, bulk approve, and then bulk delete from the list toolbar', () => {});

  it.skip('admin can enable concurrent jobs in a WFJT with a WF approval node, launch the job multiple times, bulk deny, and then bulk delete from the list toolbar', () => {});

  it('admin can approve and then delete a workflow approval from the list row item', () => {
    cy.intercept(
      'POST',
      awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
    ).as('launchWFJT');
    cy.visit(`/templates/workflow_job_template/${workflowJobTemplate.id.toString()}/details`);
    cy.getByDataCy('launch-template').click();
    cy.wait('@launchWFJT')
      .its('response.body')
      .then((response: WorkflowJob) => {
        expect(response.id).to.exist;
        cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(response.id).then((approval) => {
          actAssertAndDeleteWorkflowApproval('approve', approval.id);
        });
      });
  });

  it('admin can deny and then delete a workflow approval from the list row item', () => {
    cy.intercept(
      'POST',
      awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
    ).as('launchWFJT');
    cy.visit(`/templates/workflow_job_template/${workflowJobTemplate.id.toString()}/details`);
    cy.getByDataCy('launch-template').click();
    cy.wait('@launchWFJT')
      .its('response.body')
      .then((response: WorkflowJob) => {
        expect(response.id).to.exist;
        cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(response.id).then((approval) => {
          actAssertAndDeleteWorkflowApproval('deny', approval.id);
        });
      });
  });

  it('admin can cancel and then delete a workflow approval from the list row item', () => {
    cy.intercept(
      'POST',
      awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
    ).as('launchWFJT');
    cy.visit(`/templates/workflow_job_template/${workflowJobTemplate.id.toString()}/details`);
    cy.getByDataCy('launch-template').click();
    cy.wait('@launchWFJT')
      .its('response.body')
      .then((response: WorkflowJob) => {
        expect(response.id).to.exist;
        cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(response.id).then((approval) => {
          actAssertAndDeleteWorkflowApproval('cancel', approval.id);
        });
      });
  });
});

describe('Workflow Approvals - Detail Screen', () => {
  before('', () => {});
  // Workflow Approval Detail Screen (not yet implemented in the new UI):
  // User can approve a workflow approval from the details screen
  // User can deny a workflow approval from the details screen
  // User can cancel a workflow approval from the details screen
  // User can approve or deny a workflow approval from the list view and then visit the details page of the workflow approval to delete it.
});

describe('Workflow Approvals - Job Output Screen', () => {
  before('', () => {});
  // Workflow Approval Job Output Screen (not yet implemented in the new UI):
  // User can access the output screen of a running workflow job template with a workflow approval node, access the workflow approval details page by clicking on the node in the output screen, and approve the workflow approval.
  // User can access the output screen of a running workflow job template with a workflow approval node, access the workflow approval details page by clicking on the node in the output screen, and deny the workflow approval.
  // User can deny a workflow approval, visit the output screen of the workflow approval job, click on the node of the failed job, and see that the reason for the failure is that the workflow approval was denied.
  // User can visit the workflow visualizer of a workflow job template from the workflow approval details screen.
});

describe('Workflow Approvals - Job Details Screen', () => {
  before('', () => {});
  // Workflow Approval Job Details Screen (not yet implemented in the new UI):
  // User can relaunch the workflow from the workflow approval job details screen.
  // User can cancel the workflow from the workflow approval job details screen.
});
