import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
// import { WorkflowApproval } from '../../../../frontend/awx/interfaces/WorkflowApproval';
import { WorkflowJob } from '../../../../frontend/awx/interfaces/WorkflowJob';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { WorkflowNode } from '../../../../frontend/awx/interfaces/WorkflowNode';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Workflow Approvals Tests', () => {
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
  //   let jobName = '';

  before(function () {
    cy.awxLogin();
  });

  beforeEach(function () {
    organization = this.globalOrganization as Organization;
    cy.createAwxProject(
      { organization: (this.globalOrganization as Organization).id },
      'https://github.com/ansible/test-playbooks'
    ).then((proj) => {
      project = proj;

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
          cy.createAwxJobTemplate(
            {
              organization: organization.id,
              project: project.id,
              inventory: inventory.id,
            },
            'hello world.yml'
          ).then((jt) => {
            jobTemplate = jt;

            cy.createAwxWorkflowJobTemplate({
              organization: organization.id,
              inventory: inventory.id,
            }).then((wfjt) => {
              workflowJobTemplate = wfjt;
              cy.createAwxWorkflowVisualizerWJTNode(workflowJobTemplate).then((wfjtNode) => {
                wfjobTemplateNode = wfjtNode;
                cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((appNode) => {
                  approvalWFNode = appNode;
                  cy.createWorkflowJTAlwaysNodeLink(approvalWFNode, wfjobTemplateNode);
                });
              });
            });
          });
        });
    });
  });

  afterEach(() => {
    cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
    cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
    cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxUser(userWFApprove, { failOnStatusCode: false });
    cy.deleteAwxUser(userWFCancel, { failOnStatusCode: false });
    cy.deleteAwxUser(userWFDeny, { failOnStatusCode: false });
  });

  it('Empty test', () => {});

  it('admin can approve and then delete a workflow approval from the list row item', () => {
    cy.visit(`/templates/workflow-job-template/${workflowJobTemplate.id.toString()}/details`);
    cy.verifyPageTitle(`${workflowJobTemplate.name}`);
    cy.intercept(
      'POST',
      awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
    ).as('launchWFJT');
    cy.getByDataCy('launch-template').click();
    cy.wait('@launchWFJT')
      .its('response.body')
      .then((response: WorkflowJob) => {
        expect(response.id).to.exist;
        cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(response.id).then((approval) => {
          cy.navigateTo('awx', 'workflow-approvals');
          cy.intercept('POST', awxAPI`/workflow_approvals/${approval.id.toString()}/approve/`).as(
            'WFaction'
          );
          cy.filterTableByMultiSelect('id', [approval.id.toString()]);
          cy.getTableRow('id', approval.id.toString(), { disableFilter: true })
            .within(() => {
              cy.getByDataCy('actions-column-cell').within(() => {
                cy.getByDataCy('approve').click();
              });
            })
            .then(() => {
              cy.actionsWFApprovalConfirmModal('approve');
            });
          cy.wait('@WFaction')
            .its('response')
            .then((response) => {
              expect(response?.statusCode).to.eql(204);
            });
          cy.reload();
          cy.getByDataCy('status-column-cell').should('have.text', 'Approved');
          cy.intercept('DELETE', awxAPI`/workflow_approvals/${approval.id.toString()}/`).as(
            'deleteWFA'
          );
          cy.getByDataCy('actions-column-cell').within(() => {
            cy.clickKebabAction('actions-dropdown', 'delete-workflow-approval');
          });
          cy.actionsWFApprovalConfirmModal('delete');
          cy.wait('@deleteWFA')
            .its('response')
            .then((response) => {
              expect(response?.statusCode).to.eql(204);
            });
        });
      });
  });

  it.skip('admin can deny and then delete a workflow approval from the list row item', () => {
    cy.visit(`/templates/workflow-job-template/${workflowJobTemplate.id.toString()}/details`);
    cy.verifyPageTitle(`${workflowJobTemplate.name}`);
    cy.intercept(
      'POST',
      awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
    ).as('launchWFJT');
    cy.getByDataCy('launch-template').click();
    cy.wait('@launchWFJT')
      .its('response.body')
      .then((response: WorkflowJob) => {
        expect(response.id).to.exist;
        cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(response.id).then((approval) => {
          cy.navigateTo('awx', 'workflow-approvals');
          cy.intercept('POST', awxAPI`/workflow_approvals/${approval.id.toString()}/deny/`).as(
            'WFaction'
          );
          cy.filterTableByMultiSelect('id', [approval.id.toString()]);
          cy.getTableRow('id', approval.id.toString(), { disableFilter: true })
            .within(() => {
              cy.getByDataCy('actions-column-cell').within(() => {
                cy.getByDataCy('deny').click();
              });
            })
            .then(() => {
              cy.actionsWFApprovalConfirmModal('deny');
            });
          cy.wait('@WFaction')
            .its('response')
            .then((response) => {
              expect(response?.statusCode).to.eql(204);
            });
          cy.reload();
          cy.getByDataCy('status-column-cell').should('have.text', 'Denied');
          cy.intercept('DELETE', awxAPI`/workflow_approvals/${approval.id.toString()}/`).as(
            'deleteWFA'
          );
          cy.getByDataCy('actions-column-cell').within(() => {
            cy.clickKebabAction('actions-dropdown', 'delete-workflow-approval');
          });
          cy.actionsWFApprovalConfirmModal('delete');
          cy.wait('@deleteWFA')
            .its('response')
            .then((response) => {
              expect(response?.statusCode).to.eql(204);
            });
        });
      });
  });

  it.skip('admin can cancel and then delete a workflow approval from the list row item', () => {
    cy.visit(`/templates/workflow-job-template/${workflowJobTemplate.id.toString()}/details`);
    cy.verifyPageTitle(`${workflowJobTemplate.name}`);
    cy.intercept(
      'POST',
      awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
    ).as('launchWFJT');
    cy.getByDataCy('launch-template').click();
    cy.wait('@launchWFJT')
      .its('response.body')
      .then((response: WorkflowJob) => {
        expect(response.id).to.exist;
        cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(response.id).then((approval) => {
          cy.navigateTo('awx', 'workflow-approvals');
          cy.intercept('POST', awxAPI`/workflow_jobs/${response.id.toString()}/cancel/`).as(
            'WFaction'
          );
          cy.filterTableByMultiSelect('id', [approval.id.toString()]);
          cy.getTableRow('id', approval.id.toString(), { disableFilter: true }).within(() => {
            cy.getByDataCy('actions-column-cell').within(() => {
              cy.getByDataCy('cancel').click();
            });
          });
          cy.wait('@WFaction')
            .its('response')
            .then((response) => {
              expect(response?.statusCode).to.eql(202);
            });
          cy.reload();
          cy.getByDataCy('status-column-cell').should('have.text', 'Canceled');
          cy.intercept('DELETE', awxAPI`/workflow_approvals/${approval.id.toString()}/`).as(
            'deleteWFA'
          );
          cy.getByDataCy('actions-column-cell').within(() => {
            cy.clickKebabAction('actions-dropdown', 'delete-workflow-approval');
          });
          cy.actionsWFApprovalConfirmModal('delete');
          cy.wait('@deleteWFA')
            .its('response')
            .then((response) => {
              expect(response?.statusCode).to.eql(204);
            });
        });
      });
  });
});
