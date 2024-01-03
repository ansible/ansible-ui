// import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { User } from '../../../../frontend/awx/interfaces/User';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';

describe('Workflow Approvals List View', () => {
  let organization: Organization;
  let inventory: Inventory;
  let workflowJobTemplate: WorkflowJobTemplate;
  let user: User;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxOrganization().then((o) => {
      organization = o;
      cy.createAwxUser(organization).then((testUser) => {
        user = testUser;
      });
      cy.createAwxInventory({ organization: organization.id }).then((i) => {
        inventory = i;
        cy.createAwxWorkflowJobTemplate({
          organization: organization.id,
          inventory: inventory.id,
        }).then((wfjt) => {
          workflowJobTemplate = wfjt;
          //assign user access to the workflow job template
          cy.giveUserWfjtAccess(workflowJobTemplate.name, user.id, 'Approve');
        });
      });
    });
  });

  // afterEach(() => {
  //   cy.deleteAwxUser(user, { failOnStatusCode: false });
  //   cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
  //   cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  //   cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
  // });

  it.only('admin can create a WF approval and assign user with access to approve and then delete the WF from the list toolbar', () => {
    cy.visit('ui_next/templates?page=1&perPage=100&sort=name');
    cy.searchAndDisplayResource(workflowJobTemplate.name);
    cy.get('[data-cy="name-column-cell"]').should('contain', workflowJobTemplate.name).click();
    //when user access is enabled on main, change this test so that the admin assigns access to user through the UI
    cy.get('[data-cy="workflow-visualizer"]').click();
    cy.get('[data-cy="add-node-button"]').eq(0).click();
    cy.get('[data-ouia-component-id="menu-select"]')
      .find('span')
      .eq(1)
      .click({ force: true })
      .then(() => {
        cy.get('[data-cy="node-type"]').within(() => {
          cy.get('[data-cy="approval"]').click();
        });
      });
    cy.get('[data-cy="node-resource-name"]').type(workflowJobTemplate.name + ' approval');
    cy.get('[data-cy="Submit"]').click();
    cy.get('[data-cy="wizard-next"]').click();
    cy.contains('[data-type="node"]', ' approval').should('be.visible');
    cy.get('[data-cy="workflow-visualizer-toolbar-save"]').click();
    cy.wait(7000);
    //launch the job
    //log out
    //log in as other user
    // cy.visit('/ui_next/views/workflow-approvals?page=1&perPage=100&sort=name');
    //filter by the name of the node to display it in the list
    // cy.searchAndDisplayResource(approvalNode.name);
    //approve the workflow approval
    //log out
    //log in as admin
    //verify that the workflow approval was approved
  });

  it.skip('admin can create a WF approval and assign user with access to deny and then delete the WF from the list toolbar', () => {});

  it.skip('admin can create a WF approval and assign user with access to cancel and then delete the WF from the list toolbar', () => {});

  it.skip('admin can enable concurrent jobs in a WFJT with a WF approval node, launch the job multiple times, bulk approve, and then bulk delete from the list toolbar', () => {});

  it.skip('admin can enable concurrent jobs in a WFJT with a WF approval node, launch the job multiple times, bulk deny, and then bulk delete from the list toolbar', () => {});

  it.skip('admin can approve and then delete a workflow approval from the list row item', () => {});

  it.skip('admin can deny and then delete a workflow approval from the list row item', () => {});
});
