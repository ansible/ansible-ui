import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { Inventory } from '@ansible/awx-ui/interfaces/Inventory';
import { JobTemplate } from '@ansible/awx-ui/interfaces/JobTemplate';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { Project } from '@ansible/awx-ui/interfaces/Project';
import { AwxUser } from '@ansible/awx-ui/interfaces/User';
import { WorkflowApproval } from '@ansible/awx-ui/interfaces/WorkflowApproval';
import { WorkflowJob } from '@ansible/awx-ui/interfaces/WorkflowJob';
import { WorkflowJobTemplate } from '@ansible/awx-ui/interfaces/WorkflowJobTemplate';
import { WorkflowNode } from '@ansible/awx-ui/interfaces/WorkflowNode';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../support/utils';

describe('Workflow Approvals Tests', () => {
  let organization: Organization;
  let project: Project;
  let userWFApprove: AwxUser;
  let inventory: Inventory;
  let jobTemplate: JobTemplate;
  let workflowJobTemplate: WorkflowJobTemplate;
  let jobTemplateNode: WorkflowNode;
  let approvalWFNode: WorkflowNode;
  let jobName = '';

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxProject(
        organization,
        { name: randomE2Ename() },
        'https://github.com/ansible/test-playbooks'
      ).then((proj) => {
        project = proj;
        cy.createAwxUser({ organization: organization.id }).then((u) => {
          userWFApprove = u;
        });
        cy.createAwxInventory(organization)
          .then((i) => {
            inventory = i;
          })
          .then(() => {
            cy.createAwxJobTemplate(
              {
                organization: organization.id,
                project: project.id,
                inventory: inventory.id,
              },
              'hello world.yml'
            ).then((jt) => {
              jobTemplate = jt;
            });
          });
      });
    });
  });

  after(() => {
    cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxUser(userWFApprove, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  describe('Workflow Approvals - Approve, Deny, Delete', () => {
    it('admin can approve and then delete a workflow approval from the list row item', () => {
      cy.createAwxWorkflowJobTemplate({
        name: 'E2E Workflow Approval-APPROVE-' + randomString(4),
      }).then((wfjt) => {
        workflowJobTemplate = wfjt;
        cy.createAwxWorkflowVisualizerJobTemplateNode(workflowJobTemplate, jobTemplate).then(
          (jtNode) => {
            jobTemplateNode = jtNode;
            cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((appNode) => {
              approvalWFNode = appNode;
              cy.createWorkflowJTAlwaysNodeLink(approvalWFNode, jobTemplateNode);
              cy.intercept(
                'GET',
                awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/`
              ).as('thisWfjt');
              cy.navigateTo('awx', 'templates');
              cy.filterTableBySearch(workflowJobTemplate.name);
              cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
              cy.verifyPageTitle(workflowJobTemplate.name);
              cy.wait('@thisWfjt');
              cy.verifyPageTitle(`${workflowJobTemplate.name}`);
              cy.intercept(
                'POST',
                awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
              ).as('launchWFJT');
              cy.getByDataCy('launch-template').click();
              cy.wait('@launchWFJT')
                .its('response.body')
                .then((response: WorkflowJob) => {
                  cy.intercept(
                    'GET',
                    awxAPI`/workflow_jobs/${response.id.toString()}/workflow_nodes/*`
                  ).as('wfjtNodes');
                  expect(response.id).to.exist;
                  cy.wait('@wfjtNodes').then(() => {
                    cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(response.id).then(
                      (approval) => {
                        cy.navigateTo('awx', 'workflow-approvals');
                        cy.intercept(
                          'POST',
                          awxAPI`/workflow_approvals/${approval.id.toString()}/approve/`
                        ).as('WFaction');
                        cy.intercept(
                          'GET',
                          awxAPI`/workflow_approvals/?page_size=20&order_by=id&id__icontains=${approval.id.toString()}`
                        ).as('searchId');
                        cy.filterTableById(approval.id.toString());
                        cy.wait('@searchId');
                        cy.getByDataCy('actions-column-cell').within(() => {
                          cy.getByDataCy('approve').click();
                        });
                        cy.actionsWFApprovalConfirmModal('approve');
                        cy.wait('@WFaction')
                          .its('response')
                          .then((response) => {
                            expect(response?.statusCode).to.eql(204);
                          });
                        cy.getByDataCy('status-column-cell').should('have.text', 'Approved');
                        cy.intercept(
                          'DELETE',
                          awxAPI`/workflow_approvals/${approval.id.toString()}/`
                        ).as('deleteWFA');
                        cy.waitForWorkflowJobStatus(response.id.toString());
                        cy.getByDataCy('actions-column-cell').within(() => {
                          cy.getBy(`[data-cy="actions-dropdown"]`).click();
                        });
                        cy.getBy('[data-cy="delete-workflow-approval"]').click();
                        cy.actionsWFApprovalConfirmModal('delete');
                        cy.wait('@deleteWFA')
                          .its('response')
                          .then((response) => {
                            expect(response?.statusCode).to.eql(204);
                          });
                      }
                    );
                  });
                });
            });
          }
        );
        cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      });
    });

    it('admin can deny and then delete a workflow approval from the list row item', () => {
      cy.createAwxWorkflowJobTemplate({
        name: 'E2E Workflow Approval-DENY-' + randomString(4),
      }).then((wfjt) => {
        workflowJobTemplate = wfjt;
        cy.createAwxWorkflowVisualizerJobTemplateNode(workflowJobTemplate, jobTemplate).then(
          (jtNode) => {
            jobTemplateNode = jtNode;
            cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((appNode) => {
              approvalWFNode = appNode;
              cy.createWorkflowJTAlwaysNodeLink(approvalWFNode, jobTemplateNode);
              cy.navigateTo('awx', 'templates');
              cy.filterTableBySearch(workflowJobTemplate.name);
              cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
              cy.verifyPageTitle(workflowJobTemplate.name);
              cy.intercept(
                'POST',
                awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
              ).as('launchWFJT');
              cy.getByDataCy('launch-template').click();
              cy.wait('@launchWFJT')
                .its('response.body')
                .then((response: WorkflowJob) => {
                  expect(response.id).to.exist;
                  cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(response.id).then(
                    (approval) => {
                      cy.navigateTo('awx', 'workflow-approvals');
                      cy.intercept(
                        'POST',
                        awxAPI`/workflow_approvals/${approval.id.toString()}/deny/`
                      ).as('WFaction');
                      cy.filterTableById(approval.id.toString());
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
                      cy.getByDataCy('status-column-cell').should('have.text', 'Denied');
                      cy.intercept(
                        'DELETE',
                        awxAPI`/workflow_approvals/${approval.id.toString()}/`
                      ).as('deleteWFA');
                      cy.waitForWorkflowJobStatus(response.id.toString());
                      cy.getByDataCy('actions-column-cell').within(() => {
                        cy.getBy(`[data-cy="actions-dropdown"]`).click();
                      });
                      cy.getBy('[data-cy="delete-workflow-approval"]').click();
                      cy.actionsWFApprovalConfirmModal('delete');
                      cy.wait('@deleteWFA')
                        .its('response')
                        .then((response) => {
                          expect(response?.statusCode).to.eql(204);
                        });
                    }
                  );
                });
            });
          }
        );
        cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      });
    });

    it('admin can cancel and then delete a workflow approval from the list row item', () => {
      cy.createAwxWorkflowJobTemplate({
        name: 'E2E Workflow Approval-CANCEL-' + randomString(4),
      }).then((wfjt) => {
        workflowJobTemplate = wfjt;
        cy.createAwxWorkflowVisualizerJobTemplateNode(workflowJobTemplate, jobTemplate).then(
          (jtNode) => {
            jobTemplateNode = jtNode;
            cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((appNode) => {
              approvalWFNode = appNode;
              cy.createWorkflowJTAlwaysNodeLink(approvalWFNode, jobTemplateNode);
              cy.navigateTo('awx', 'templates');
              cy.filterTableBySearch(workflowJobTemplate.name);
              cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
              cy.verifyPageTitle(workflowJobTemplate.name);
              cy.intercept(
                'POST',
                awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
              ).as('launchWFJT');
              cy.getByDataCy('launch-template').click();
              cy.wait('@launchWFJT')
                .its('response.body')
                .then((response: WorkflowJob) => {
                  expect(response.id).to.exist;
                  cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(response.id).then(
                    (approval) => {
                      cy.navigateTo('awx', 'workflow-approvals');
                      cy.intercept(
                        'POST',
                        awxAPI`/workflow_jobs/${response.id.toString()}/cancel/`
                      ).as('WFaction');
                      cy.filterTableById(approval.id.toString());
                      cy.getTableRow('id', approval.id.toString(), { disableFilter: true }).within(
                        () => {
                          cy.getByDataCy('actions-column-cell').within(() => {
                            cy.getByDataCy('cancel').click();
                          });
                        }
                      );
                      cy.wait('@WFaction')
                        .its('response')
                        .then((response) => {
                          expect(response?.statusCode).to.eql(202);
                        });
                      cy.getByDataCy('status-column-cell').should('have.text', 'Canceled');
                      cy.intercept(
                        'DELETE',
                        awxAPI`/workflow_approvals/${approval.id.toString()}/`
                      ).as('deleteWFA');
                      cy.waitForWorkflowJobStatus(response.id.toString());
                      cy.getByDataCy('actions-column-cell').within(() => {
                        cy.getBy(`[data-cy="actions-dropdown"]`).click();
                      });
                      cy.getBy('[data-cy="delete-workflow-approval"]').click();
                      cy.actionsWFApprovalConfirmModal('delete');
                      cy.wait('@deleteWFA')
                        .its('response')
                        .then((response) => {
                          expect(response?.statusCode).to.eql(204);
                        });
                    }
                  );
                });
            });
          }
        );
        cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      });
    });
  });

  describe('Workflow Approvals - Bulk Approve, Bulk Deny, Bulk Delete', () => {
    it('can enable concurrent jobs in a WFJT with a WF approval node, launch multiple jobs, bulk approve, then bulk delete from list toolbar', () => {
      cy.createAwxWorkflowJobTemplate({
        name: 'E2E Workflow Approval-BULK APPROVE-' + randomString(4),
      }).then((wfjt) => {
        workflowJobTemplate = wfjt;
        cy.createAwxWorkflowVisualizerJobTemplateNode(workflowJobTemplate, jobTemplate).then(
          (jtNode) => {
            jobTemplateNode = jtNode;
            cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((appNode) => {
              approvalWFNode = appNode;
              cy.createWorkflowJTAlwaysNodeLink(approvalWFNode, jobTemplateNode);
              editWorkflowJobTemplate();
              workflowApprovalBulkAction('approve');
              deleteApprovalFromListToolbar();
            });
          }
        );
        cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      });
    });

    it('can enable concurrent jobs in a WFJT with a WF approval node, launch multiple jobs, bulk deny, then bulk delete from list toolbar', () => {
      cy.createAwxWorkflowJobTemplate({
        name: 'E2E Workflow Approval-BULK DENY-' + randomString(4),
      }).then((wfjt) => {
        workflowJobTemplate = wfjt;
        cy.createAwxWorkflowVisualizerJobTemplateNode(workflowJobTemplate, jobTemplate).then(
          (jtNode) => {
            jobTemplateNode = jtNode;
            cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((appNode) => {
              approvalWFNode = appNode;
              cy.createWorkflowJTAlwaysNodeLink(approvalWFNode, jobTemplateNode);
              editWorkflowJobTemplate();
              workflowApprovalBulkAction('deny');
              deleteApprovalFromListToolbar();
            });
          }
        );
        cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      });
    });
  });

  /*
  Used in the Workflow Approvals - Bulk Approve, Bulk Deny, Bulk Delete tests (below)
  **/
  function editWorkflowJobTemplate() {
    cy.navigateTo('awx', 'templates');
    cy.filterTableBySearch(workflowJobTemplate.name);
    cy.getTableRow('name', workflowJobTemplate.name, { disableFilter: true }).should('be.visible');
    cy.selectTableRow(workflowJobTemplate.name);
    cy.getBy('[data-cy="edit-template"]').click();
    cy.verifyPageTitle(`Edit ${workflowJobTemplate.name}`);
    cy.getByDataCy('allow_simultaneous').click();
    cy.intercept('PATCH', awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/`).as(
      'edited'
    );
    cy.getByDataCy('Submit').click();
    cy.wait('@edited')
      .its('response.body')
      .then((response: WorkflowJobTemplate) => {
        expect(response.allow_simultaneous).to.eql(true);
        cy.getByDataCy('enabled-options').should('contain', 'Concurrent jobs');
      });
  }

  /*
  Used in the Workflow Approvals - Bulk Approve, Bulk Deny, Bulk Delete tests (below)
  **/
  function workflowApprovalBulkAction(selectorDataCy: 'approve' | 'deny') {
    cy.intercept(
      'POST',
      awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch/`
    ).as('launched');
    cy.verifyPageTitle(workflowJobTemplate.name);
    cy.getByDataCy('launch-template').click();
    cy.wait('@launched')
      .its('response.body')
      .then((launched: WorkflowJob) => {
        cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(launched.id).then((wfApprovalA) => {
          cy.url().should('contain', '/output');
          cy.intercept('POST', awxAPI`/workflow_jobs/${launched.id.toString()}/relaunch/`).as(
            'relaunched'
          );
          cy.getByDataCy('relaunch-job').click();
          cy.wait('@relaunched')
            .its('response.body')
            .then((relaunched: WorkflowJob) => {
              cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(relaunched.id).then(
                (wfApprovalB) => {
                  cy.url().should('contain', '/output');
                  cy.intercept(
                    'POST',
                    awxAPI`/workflow_jobs/${relaunched.id.toString()}/relaunch/`
                  ).as('relaunchedAgain');
                  cy.getByDataCy('relaunch-job').click();
                  cy.wait('@relaunchedAgain')
                    .its('response.body')
                    .then((relaunchedAgain: WorkflowJob) => {
                      cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(relaunchedAgain.id).then(
                        (wfApprovalC) => {
                          expect(wfApprovalA.name).to.eql(wfApprovalB.name);
                          expect(wfApprovalB.name).to.eql(wfApprovalC.name);
                          cy.url().should('contain', '/output');
                          cy.get('[data-cy="relaunch-job"]').should('be.visible');
                          cy.intercept('OPTIONS', awxAPI`/workflow_approvals/`).as('options');
                          cy.navigateTo('awx', 'workflow-approvals');
                          cy.wait('@options');
                          jobName = wfApprovalC.name.split(' ').slice(-1).toString();
                          cy.filterTableBySearch(jobName);
                          cy.get('tbody').find('tr').should('have.length', 3);
                          cy.get('input[name="check-all"]').check();
                          cy.getBy('[data-ouia-component-id="page-toolbar"]').within(() => {
                            cy.getByDataCy(`${selectorDataCy}`).click();
                          });
                          cy.getModal().within(() => {
                            cy.get('[data-ouia-component-id="confirm"]').click();
                            cy.get('[data-ouia-component-id="submit"]').click();
                          });
                          cy.waitForWorkflowJobStatus(launched.id.toString());
                          cy.waitForWorkflowJobStatus(relaunched.id.toString());
                          cy.waitForWorkflowJobStatus(relaunchedAgain.id.toString());
                        }
                      );
                    });
                }
              );
            });
        });
      });
  }

  /*
  Used in the Workflow Approvals - Bulk Approve, Bulk Deny, Bulk Delete tests (below)
  **/
  function deleteApprovalFromListToolbar() {
    cy.get('tbody').find('tr').should('have.length', 3);
    cy.get('input[name="check-all"]').check();
    // cy.getBy('[data-ouia-component-id="page-toolbar"]').within(() => {
    //   cy.getBy(`[data-cy="actions-dropdown"]`).click();
    // });
    // cy.getBy('[data-cy="delete-workflow-approvals"]').click();
    cy.clickToolbarKebabAction('delete-workflow-approvals');
    cy.getModal().within(() => {
      cy.get('[data-ouia-component-id="confirm"]').click();
      cy.get('[data-ouia-component-id="submit"]').click();
    });
    cy.contains('No results found');
  }

  describe('Workflow Approvals - User Access', () => {
    let workflowApproval: WorkflowApproval;

    it('can assign normal user the access to approve a workflow approval from the list toolbar', () => {
      cy.createAwxWorkflowJobTemplate({
        name: 'E2E Workflow Approval-USER APPROVE-' + randomString(4),
      }).then((wfjt) => {
        workflowJobTemplate = wfjt;
        cy.createAwxWorkflowVisualizerJobTemplateNode(workflowJobTemplate, jobTemplate).then(
          (jtNode) => {
            jobTemplateNode = jtNode;
            cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((appNode) => {
              approvalWFNode = appNode;
              cy.createWorkflowJTAlwaysNodeLink(approvalWFNode, jobTemplateNode);
              cy.intercept(
                'POST',
                awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch/`
              ).as('launched');
              cy.navigateTo('awx', 'templates');
              cy.filterTableBySearch(workflowJobTemplate.name);
              cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
              cy.verifyPageTitle(workflowJobTemplate.name);
              cy.getByDataCy('launch-template').click();
              cy.wait('@launched')
                .its('response.body')
                .then((launched: WorkflowJob) => {
                  cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(launched.id).then(
                    (wfApprovalA) => {
                      workflowApproval = wfApprovalA;
                      cy.url().should('contain', '/output');
                      cy.navigateTo('awx', 'templates');
                      cy.filterTableBySearch(workflowJobTemplate.name);
                      cy.clickTableRowLink('name', workflowJobTemplate.name, {
                        disableFilter: true,
                      });
                      cy.get('a[href*="user-access"]').click();
                      cy.verifyPageTitle(workflowJobTemplate.name);
                      cy.get('tbody tr').should('have.length', 0);
                      cy.getByDataCy('assign-users').click();
                      cy.verifyPageTitle('Assign users');
                      cy.filterTableBySearch(userWFApprove.username);
                      cy.get(`[data-cy="row-id-${userWFApprove.id}"] input`).click();
                      cy.getByDataCy('Submit').click();
                      cy.selectTableRowByCheckbox('name', 'WorkflowJobTemplate Approve', {
                        disableFilter: true,
                      });
                      cy.getByDataCy('Submit').click();
                      cy.getByDataCy('expandable-section-users').within(() => {
                        cy.get('tbody tr').should('have.length', 1);
                      });
                      cy.getByDataCy('expandable-section-awxRoles').within(() => {
                        cy.get('tbody tr').should('have.length', 1);
                      });
                      cy.getByDataCy('Submit').click();
                      cy.get('tbody tr').should('have.length', 1);
                      cy.awxLoginTestUser(`${userWFApprove.username}`, `pw`);
                      cy.navigateTo('awx', 'workflow-approvals');
                      cy.verifyPageTitle('Workflow Approvals');
                      cy.filterTableBySearch(workflowApproval.name);
                      cy.get('tbody tr').should('have.length', 1);
                      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
                        cy.get('[data-cy="checkbox-column-cell"] input').click();
                      });
                      cy.get('[data-ouia-component-id="page-toolbar"]').within(() => {
                        cy.getByDataCy('approve').click();
                      });
                      cy.getModal().within(() => {
                        cy.get('#confirm').click();
                        cy.get('[data-ouia-component-id="submit"]').click();
                      });
                      cy.waitForWorkflowJobStatus(launched.id.toString());
                      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
                        cy.getByDataCy('status-column-cell').should('contain', 'Approve');
                        cy.get('[data-cy="checkbox-column-cell"] input').click();
                      });
                      cy.clickToolbarKebabAction('delete-workflow-approvals');
                      cy.getModal().within(() => {
                        cy.get('[data-cy="alert-toaster"]').should(
                          'contain',
                          '1 of the selected workflow approvals cannot be deleted due to insufficient permissions.'
                        );
                        cy.clickButton('Cancel');
                      });
                      cy.verifyPageTitle('Workflow Approvals');
                    }
                  );
                });
            });
          }
        );
        if (workflowJobTemplate) {
          cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
        }
      });
    });

    it.skip('can assign a normal user admin access to a workflow approval', () => {
      //This test needs to be written
    });
  });
});
