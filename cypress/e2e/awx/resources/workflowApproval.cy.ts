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
          cy.giveUserWfjtAccess(workflowJobTemplate.name, user.id, 'Approve');
        });
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
  });

  it('admin can create a WF approval and assign user with access to approve and then delete the WF from the list toolbar', () => {
    //Post an approval node to the WFJT that was created in the beforeEach block
    //Post to the launch endpoint to trigger the job to launch
    cy.visit('/views/workflow-approvals?page=1&perPage=100&sort=name');
    //filter by the name of the node to display it in the list
    // cy.searchAndDisplayResource(approvalNode.name);
  });

  it.skip('admin can create a WF approval and assign user with access to deny and then delete the WF from the list toolbar', () => {});

  it.skip('admin can create a WF approval and assign user with access to cancel and then delete the WF from the list toolbar', () => {});

  it.skip('admin can enable concurrent jobs in a WFJT with a WF approval node, launch the job multiple times, bulk approve, and then bulk delete from the list toolbar', () => {});

  it.skip('admin can enable concurrent jobs in a WFJT with a WF approval node, launch the job multiple times, bulk deny, and then bulk delete from the list toolbar', () => {});

  it.skip('admin can approve and then delete a workflow approval from the list row item', () => {});

  it.skip('admin can deny and then delete a workflow approval from the list row item', () => {});
});
