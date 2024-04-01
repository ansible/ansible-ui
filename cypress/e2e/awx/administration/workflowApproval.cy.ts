import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { User } from '../../../../frontend/awx/interfaces/User';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { WorkflowNode } from '../../../../frontend/awx/interfaces/WorkflowNode';

// describe('Workflow Approvals', () => {

// });
describe('Workflow Approvals - List View', () => {
  let organization: Organization;
  let project: Project;
  let user: User;
  let userWFApprove: User;
  let userWFDeny: User;
  let userWFCancel: User;
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

  beforeEach(() => {
    cy.intercept(
      'POST',
      `api/v2/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
    ).as('launchWFJT');

    cy.visit(`/templates/workflow_job_template/${workflowJobTemplate.id.toString()}/details`);
    cy.getByDataCy('launch-template').click();
  });

  afterEach(() => {});

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

  function refreshToDelete(wfaID: string) {
    // FIXME: the page needs to be refreshed to button be available
    cy.visit(`/administration/workflow-approvals/`);
    cy.filterTableByTextFilter('id', wfaID);
    cy.getTableRow('id', wfaID).within(() => {
      cy.getByDataCy('actions-column-cell').within(() => {
        cy.clickKebabAction('actions-dropdown', 'delete-workflow-approval');
      });
    });
    cy.actionsWFApprovalConfirmModal('delete');
  }

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
    cy.wait('@launchWFJT')
      .its('response')
      .then((response: { body: { workflow_job: number } }) => {
        cy.getAwxWFApprovalByWorkflowJobID(response.body.workflow_job).then((wfa) => {
          cy.visit(`/administration/workflow-approvals/`);
          cy.filterTableByTextFilter('id', wfa.id.toString());
          cy.getTableRow('id', wfa.id.toString()).within(() => {
            cy.getByDataCy('actions-column-cell').within(() => {
              cy.getByDataCy('approve').click();
            });
          });
          cy.actionsWFApprovalConfirmModal('approve').then(() => {
            // FIXME: the page needs to be refreshed to button be available
            refreshToDelete(wfa.id.toString());
          });
        });
      });
  });

  it('admin can deny and then delete a workflow approval from the list row item', () => {
    cy.wait('@launchWFJT')
      .its('response')
      .then((response: { body: { workflow_job: number } }) => {
        cy.getAwxWFApprovalByWorkflowJobID(response.body.workflow_job).then((wfa) => {
          cy.visit(`/administration/workflow-approvals/`);
          cy.filterTableByTextFilter('id', wfa.id.toString());
          cy.getTableRow('id', wfa.id.toString()).within(() => {
            cy.getByDataCy('actions-column-cell').within(() => {
              cy.getByDataCy('deny').click();
            });
          });
          cy.actionsWFApprovalConfirmModal('deny').then(() => {
            // FIXME: the page needs to be refreshed to button be available
            refreshToDelete(wfa.id.toString());
          });
        });
      });
  });

  it('admin can cancel and then delete a workflow approval from the list row item', () => {
    cy.wait('@launchWFJT')
      .its('response')
      .then((response: { body: { workflow_job: number } }) => {
        cy.getAwxWFApprovalByWorkflowJobID(response.body.workflow_job).then((wfa) => {
          cy.visit(`/administration/workflow-approvals/`);
          cy.filterTableByTextFilter('id', wfa.id.toString());
          cy.getTableRow('id', wfa.id.toString()).within(() => {
            cy.getByDataCy('actions-column-cell').within(() => {
              cy.getByDataCy('cancel').click();
            });
          });
          // FIXME: the page needs to be refreshed to button be available
          refreshToDelete(wfa.id.toString());
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
