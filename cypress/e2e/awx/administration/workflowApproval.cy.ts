import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { WorkflowApproval } from '../../../../frontend/awx/interfaces/WorkflowApproval';
import { WorkflowJob } from '../../../../frontend/awx/interfaces/WorkflowJob';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { WorkflowNode } from '../../../../frontend/awx/interfaces/WorkflowNode';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe.skip('Workflow Approvals Tests', () => {
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
  let jobName = '';

  before(function () {
    organization = this.globalOrganization as Organization;
    cy.createAwxProject(
      { organization: (this.globalOrganization as Organization).id },
      'https://github.com/ansible/test-playbooks'
    ).then((proj) => {
      project = proj;
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
          cy.createAwxJobTemplate(
            {
              organization: organization.id,
              project: project.id,
              inventory: inventory.id,
            },
            'hello world.yml'
          ).then((jt) => (jobTemplate = jt));
        });
    });
  });

  beforeEach(() => {
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

  afterEach(() => {
    cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
  });

  after(() => {
    cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
    cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxUser(userWFApprove, { failOnStatusCode: false });
    cy.deleteAwxUser(userWFCancel, { failOnStatusCode: false });
    cy.deleteAwxUser(userWFDeny, { failOnStatusCode: false });
  });

  describe.skip('Workflow Approvals - Approve, Deny, Delete', () => {
    // it('admin can approve and then delete a workflow approval from the list row item', () => {
    //   cy.intercept(
    //     'POST',
    //     awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
    //   ).as('launchWFJT');
    //   cy.visit(`/templates/workflow-job-template/${workflowJobTemplate.id.toString()}/details`);
    //   cy.verifyPageTitle(`${workflowJobTemplate.name}`);
    //   cy.getByDataCy('launch-template').click();
    //   cy.wait('@launchWFJT')
    //     .its('response.body')
    //     .then((response: WorkflowJob) => {
    //       expect(response.id).to.exist;
    //       cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(response.id).then((approval) => {
    //         actAssertAndDeleteWorkflowApproval('approve', approval.id);
    //       });
    //     });
    // });
    // it('admin can deny and then delete a workflow approval from the list row item', () => {
    //   cy.intercept(
    //     'POST',
    //     awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
    //   ).as('launchWFJT');
    //   cy.visit(`/templates/workflow-job-template/${workflowJobTemplate.id.toString()}/details`);
    //   cy.verifyPageTitle(`${workflowJobTemplate.name}`);
    //   cy.getByDataCy('launch-template').click();
    //   cy.wait('@launchWFJT')
    //     .its('response.body')
    //     .then((response: WorkflowJob) => {
    //       expect(response.id).to.exist;
    //       cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(response.id).then((approval) => {
    //         actAssertAndDeleteWorkflowApproval('deny', approval.id);
    //       });
    //     });
    // });
    // it('admin can cancel and then delete a workflow approval from the list row item', () => {
    //   cy.intercept(
    //     'POST',
    //     awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch`
    //   ).as('launchWFJT');
    //   cy.visit(`/templates/workflow-job-template/${workflowJobTemplate.id.toString()}/details`);
    //   cy.verifyPageTitle(`${workflowJobTemplate.name}`);
    //   cy.getByDataCy('launch-template').click();
    //   cy.wait('@launchWFJT')
    //     .its('response.body')
    //     .then((response: WorkflowJob) => {
    //       expect(response.id).to.exist;
    //       cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(response.id).then((approval) => {
    //         actAssertAndDeleteWorkflowApproval('cancel', approval.id);
    //       });
    //     });
  });

  //   const wfaURL = '/administration/workflow-approvals/';
  //   function actAssertAndDeleteWorkflowApproval(
  //     selectorDataCy: 'approve' | 'deny' | 'cancel',
  //     wfaID: number
  //   ) {
  //     let actionStatusCode: number;
  //     let statusText: string;
  //     let actionURL: string;

  //     cy.visit(wfaURL);

  //     switch (selectorDataCy) {
  //       case 'approve':
  //         actionURL = '**/approve';
  //         actionStatusCode = 204;
  //         statusText = 'Approved';
  //         break;
  //       case 'deny':
  //         actionURL = '**/deny';
  //         actionStatusCode = 204;
  //         statusText = 'Denied';
  //         break;
  //       case 'cancel':
  //         actionURL = '**/cancel';
  //         actionStatusCode = 202;
  //         statusText = 'Canceled';
  //         break;
  //     }
  //     cy.intercept({
  //       method: 'POST',
  //       url: `${actionURL}`,
  //     }).as('WFaction');
  //     cy.filterTableByMultiSelect('id', [wfaID.toString()]);
  //     cy.getTableRow('id', wfaID.toString(), { disableFilter: true })
  //       .within(() => {
  //         cy.getByDataCy('actions-column-cell').within(() => {
  //           cy.getByDataCy(selectorDataCy).click();
  //         });
  //       })
  //       .then(() => {
  //         if (selectorDataCy !== 'cancel') {
  //           cy.actionsWFApprovalConfirmModal(selectorDataCy);
  //         }
  //       });
  //     cy.wait('@WFaction')
  //       .its('response')
  //       .then((response) => {
  //         expect(response?.statusCode).to.eql(actionStatusCode);
  //       });
  //     cy.reload();
  //     cy.getByDataCy('status-column-cell').should('have.text', statusText);
  //     cy.intercept({
  //       method: 'DELETE',
  //       url: 'api/v2/workflow_approvals/*',
  //     }).as('deleteWFA');
  //     cy.getByDataCy('actions-column-cell').within(() => {
  //       cy.clickKebabAction('actions-dropdown', 'delete-workflow-approval');
  //     });
  //     cy.actionsWFApprovalConfirmModal('delete');
  //     cy.wait('@deleteWFA')
  //       .its('response')
  //       .then((response) => {
  //         expect(response?.statusCode).to.eql(204);
  //       });
  //   }
  // });

  /* 
  Used in the Workflow Approvals - Bulk Approve, Bulk Deny, Bulk Delete tests (below)
  **/
  function editJobTemplate() {
    cy.visit(`/templates/workflow-job-template/${workflowJobTemplate.id.toString()}/edit`);
    cy.verifyPageTitle('Edit Workflow Job Template');
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
                          cy.filterTableBySingleSelect('name', jobName);
                          cy.get('tbody').find('tr').should('have.length', 3);
                          cy.getByDataCy('select-all').click();
                          cy.getBy('[data-ouia-component-id="page-toolbar"]').within(() => {
                            cy.getByDataCy(`${selectorDataCy}`).click();
                          });
                          cy.getModal().within(() => {
                            cy.get('[data-ouia-component-id="confirm"]').click();
                            cy.get('[data-ouia-component-id="submit"]').click();
                            cy.clickButton('Close');
                          });
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
    cy.getByDataCy('select-all').click();
    cy.getBy('[data-ouia-component-id="page-toolbar"]').within(() => {
      cy.getByDataCy('actions-dropdown')
        .click()
        .then(() => {
          cy.getByDataCy('delete').click();
        });
    });
    cy.getModal().within(() => {
      cy.get('[data-ouia-component-id="confirm"]').click();
      cy.get('[data-ouia-component-id="submit"]').click();
      cy.clickButton('Close');
    });
    cy.get('h2').should('contain', 'No results found');
  }

  describe('Workflow Approvals - Bulk Approve, Bulk Deny, Bulk Delete', () => {
    it(`admin can enable concurrent jobs in a WFJT with a WF approval node, launch the job multiple times, bulk approve, and then bulk delete from the list toolbar`, () => {
      editJobTemplate();
      workflowApprovalBulkAction('approve');
      deleteApprovalFromListToolbar();
    });

    it('admin can enable concurrent jobs in a WFJT with a WF approval node, launch the job multiple times, bulk deny, and then bulk delete from the list toolbar', () => {
      cy.visit(`/templates/workflow-job-template/${workflowJobTemplate.id.toString()}/details`);
      cy.verifyPageTitle(`${workflowJobTemplate.name}`);
      workflowApprovalBulkAction('deny');
      deleteApprovalFromListToolbar();
    });
  });

  describe('Workflow Approvals - User Access', () => {
    let workflowApproval: WorkflowApproval;
    beforeEach(function () {
      cy.intercept(
        'POST',
        awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch/`
      ).as('launched');
      cy.visit(`/templates/workflow-job-template/${workflowJobTemplate.id.toString()}/details`);
      cy.verifyPageTitle(`${workflowJobTemplate.name}`);
      cy.getByDataCy('launch-template').click();
      cy.wait('@launched')
        .its('response.body')
        .then((launched: WorkflowJob) => {
          cy.pollFirstPendingWorkflowApprovalsForWorkflowJobID(launched.id).then((wfApprovalA) => {
            workflowApproval = wfApprovalA;
            cy.url().should('contain', '/output');
          });
        });
    });

    it('can assign normal user the access to approve a workflow approval from the list toolbar', () => {
      cy.visit(
        `/templates/workflow-job-template/${workflowJobTemplate.id}/user-access?page=1&perPage=100&sort=user__username`
      );
      cy.verifyPageTitle(workflowJobTemplate.name);
      cy.get('tbody tr').should('have.length', 0);
      cy.getByDataCy('add-roles').click();
      cy.verifyPageTitle('Add roles');
      cy.filterTableByTextFilter('username', userWFApprove.username, {
        disableFilterSelection: true,
      }).click();
      cy.get('tbody tr')
        .should('have.length', 1)
        .within(() => {
          cy.getByDataCy('checkbox-column-cell').click();
        });
      cy.getByDataCy('Submit').click();
      cy.selectTableRowByCheckbox('name', 'WorkflowJobTemplate Approve', { disableFilter: true });
      cy.getByDataCy('Submit').click();
      cy.getByDataCy('expandable-section-users').within(() => {
        cy.get('tbody tr').should('have.length', 1);
      });
      cy.getByDataCy('expandable-section-awxRoles').within(() => {
        cy.get('tbody tr').should('have.length', 1);
      });
      cy.getByDataCy('Submit').click();
      cy.getModal().within(() => {
        cy.clickButton('Close');
      });
      cy.get('tbody tr').should('have.length', 1);
      cy.awxLoginTestUser(`${userWFApprove.username}`, `pw`);
      cy.navigateTo('awx', 'workflow-approvals');
      cy.verifyPageTitle('Workflow Approvals');
      cy.filterTableBySingleSelect('name', workflowApproval.name);
      cy.get('tbody tr').should('have.length', 1);
      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
        cy.getByDataCy('checkbox-column-cell').click();
      });
      cy.get('[data-ouia-component-id="page-toolbar"]').within(() => {
        cy.getByDataCy('approve').click();
      });
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.get('[data-ouia-component-id="submit"]').click();
        cy.clickButton('Close');
      });
      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
        cy.getByDataCy('status-column-cell').should('contain', 'Approve');
        cy.getByDataCy('checkbox-column-cell').click();
      });
      cy.get('[data-ouia-component-id="page-toolbar"]').within(() => {
        cy.getByDataCy('actions-dropdown')
          .click()
          .then(() => {
            cy.get('[data-cy="delete"]').click();
          });
      });
      cy.getModal().within(() => {
        cy.get('[data-cy="alert-toaster"]').should(
          'contain',
          '1 of the selected workflow approvals cannot be deleted due to insufficient permissions.'
        );
        cy.clickButton('Cancel');
      });
      cy.verifyPageTitle('Workflow Approvals');
    });

    it.skip('can assign a normal user admin access to a workflow approval', () => {
      //as admin: assign normal user as wfjt admin
      //log out
      //log in as normal user
      //acccess workflow approvals list, find specific workflow approval
      //have normal user deny and then delete workflow approval to show admin rights
    });
  });

  describe.skip('Workflow Approvals - Detail Screen', () => {
    before('', () => {});
    // Workflow Approval Detail Screen (not yet implemented in the new UI):
    // User can approve a workflow approval from the details screen
    // User can deny a workflow approval from the details screen
    // User can cancel a workflow approval from the details screen
    // User can approve or deny a workflow approval from the list view and then visit the details page of the workflow approval to delete it.
  });

  describe.skip('Workflow Approvals - Job Output Screen', () => {
    before('', () => {});
    // Workflow Approval Job Output Screen (not yet implemented in the new UI):
    // User can access the output screen of a running workflow job template with a workflow approval node, access the workflow approval details page by clicking on the node in the output screen, and approve the workflow approval.
    // User can access the output screen of a running workflow job template with a workflow approval node, access the workflow approval details page by clicking on the node in the output screen, and deny the workflow approval.
    // User can deny a workflow approval, visit the output screen of the workflow approval job, click on the node of the failed job, and see that the reason for the failure is that the workflow approval was denied.
    // User can visit the workflow visualizer of a workflow job template from the workflow approval details screen.
  });

  describe.skip('Workflow Approvals - Job Details Screen', () => {
    before('', () => {});
    // Workflow Approval Job Details Screen (not yet implemented in the new UI):
    // User can relaunch the workflow from the workflow approval job details screen.
    // User can cancel the workflow from the workflow approval job details screen.
  });
});
