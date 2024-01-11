import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { WorkflowNode } from '../../../../frontend/awx/interfaces/WorkflowNode';

describe('Workflow Job templates visualizer', () => {
  let organization: Organization;
  let inventory: Inventory;

  function cleanup() {
    cy.clickPageAction('delete-template');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete template/);
    cy.verifyPageTitle('Template');
  }
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

  it('should render a workflow visualizer view with multiple nodes present', () => {
    cy.createAwxWorkflowJobTemplate({
      organization: organization.id,
      inventory: inventory.id,
    }).then((workflowJobTemplate) => {
      cy.renderWorkflowVisualizerNodesFromFixtureFile(
        `${workflowJobTemplate.name}`,
        'wf_vis_testing_A.json'
      );
      cy.get('[class*="66-node-label"]')
        .should('exist')
        .should('contain', 'Cleanup Activity Stream');
      cy.get('[class*="43-node-label"]').should('exist').should('contain', 'bar');
      cy.get('[class*="42-node-label"]').should('exist').should('contain', '1');
      cy.get('[class*="41-node-label"]').should('exist').should('contain', 'Demo Project');
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate);
    });
  });

  it('Should create a workflow job template and then navigate to the visualizer, and then navigate to the details view after clicking cancel', () => {
    const jtName = 'E2E ' + randomString(4);
    // Create workflow job template
    cy.navigateTo('awx', 'templates');
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create workflow job template$/);
    cy.get('[data-cy="name"]').type(jtName);
    cy.get('[data-cy="description"]').type('this is a description');
    cy.get('[data-cy="Submit"]').click();

    cy.get('[data-cy="workflow-visualizer"]').should('be.visible');
    cy.get('h4.pf-v5-c-empty-state__title-text').should(
      'have.text',
      'There are currently no nodes in this workflow'
    );
    cy.get('div.pf-v5-c-empty-state__actions').within(() => {
      cy.get('[data-cy="add-node-button"]').should('be.visible');
    });

    cy.get('button[data-cy="workflow-visualizer-toolbar-close"]').click();

    // Clean up - delete workflow job template
    cleanup();
  });
  it('Click on edge context menu option to change link type and close visualizer to show unsaved changes modal', function () {
    let projectNode: WorkflowNode;
    let approvalNode: WorkflowNode;
    let workflowJobTemplate: WorkflowJobTemplate;
    cy.createAwxWorkflowJobTemplate({
      organization: (this.globalOrganization as Organization).id,
      inventory: inventory.id,
    })
      .then((wfjt) => {
        workflowJobTemplate = wfjt;
        cy.createAwxWorkflowVisualizerProjectNode(
          workflowJobTemplate,
          this.globalProject as Project
        ).then((projNode) => {
          projectNode = projNode;
          cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((appNode) => {
            approvalNode = appNode;
            cy.createWorkflowJTSuccessNodeLink(projectNode, appNode);
          });
        });
      })
      .then(() => {
        cy.visit(`/templates/workflow_job_template/${workflowJobTemplate?.id}/visualizer`);
        cy.contains('Workflow Visualizer').should('be.visible');
        cy.get(`g[data-id="${projectNode.id}-${approvalNode.id}"]`).should(
          'have.text',
          'Run on success'
        );
        cy.get(`g[data-id="${projectNode.id}-${approvalNode.id}"]`).within(() => {
          cy.get('[data-cy="edge-context-menu_kebab"]').click({ force: true });
        });
        cy.get('li[data-cy="fail"]').click();
        cy.get('button[data-cy="workflow-visualizer-toolbar-close"]').click();
        cy.get('div[data-cy="visualizer-unsaved-changes-modal"]').should('be.visible');
        cy.get('button[data-cy="exit-without-saving"]').click();
        cy.verifyPageTitle(`${workflowJobTemplate.name}`);
      });
    // Clean up
    cleanup();
  });
});
