import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { Inventory } from '@ansible/awx-ui/interfaces/Inventory';
import { InventorySource } from '@ansible/awx-ui/interfaces/InventorySource';
import { JobTemplate } from '@ansible/awx-ui/interfaces/JobTemplate';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { Project } from '@ansible/awx-ui/interfaces/Project';
import { WorkflowJobTemplate } from '@ansible/awx-ui/interfaces/WorkflowJobTemplate';
import { WorkflowNode } from '@ansible/awx-ui/interfaces/WorkflowNode';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Workflow Visualizer', () => {
  let awxOrganization: Organization;
  let project: Project;
  let inventory: Inventory;
  let inventorySource: InventorySource;
  let jobTemplate: JobTemplate;
  let workflowJobTemplate: WorkflowJobTemplate;
  let projectNode: WorkflowNode;
  let approvalNode: WorkflowNode;
  let workflowJtNode: WorkflowNode;

  before(function () {
    cy.createAwxOrganization().then((thisAwxOrg) => {
      awxOrganization = thisAwxOrg;
      cy.createAwxProject(awxOrganization).then((proj) => {
        project = proj;
      });
    });
  });

  beforeEach(function () {
    cy.createAwxInventory(awxOrganization)
      .then((i) => {
        inventory = i;
      })
      .then(() => {
        cy.createAwxInventorySource(inventory, project).then((invSrc) => {
          inventorySource = invSrc;
        });
        cy.createAwxJobTemplate({
          organization: awxOrganization.id,
          project: project.id,
          inventory: inventory.id,
        }).then((jt) => {
          jobTemplate = jt;
          cy.createAwxWorkflowJobTemplate({
            organization: awxOrganization.id,
            inventory: inventory.id,
          }).then((wfjt) => {
            workflowJobTemplate = wfjt;
          });
        });
      });
  });

  afterEach(() => {
    cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
    cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
  });

  after(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  describe('Workflow Visualizer: Add Nodes', () => {
    it('should render a workflow visualizer view with multiple nodes present', () => {
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
    });

    it('Should create a workflow job template and then navigate to the visualizer, and then navigate to the details view after clicking cancel', () => {
      const jtName = 'E2E ' + randomString(4);
      cy.navigateTo('awx', 'templates');
      cy.setTableView('table');
      cy.clickButton(/^Create template$/);
      cy.clickLink(/^Create workflow job template$/);
      cy.get('[data-cy="name"]').type(jtName);
      cy.get('[data-cy="description"]').type('this is a description');
      cy.intercept('POST', awxAPI`/workflow_job_templates/`).as('newWfjt');
      cy.get('[data-cy="Submit"]').click();
      cy.wait('@newWfjt')
        .its('response.body')
        .then((wfjt: WorkflowJobTemplate) => {
          expect(wfjt.description).to.eql('this is a description');
          cy.get('[data-cy="workflow-visualizer"]').should('be.visible');
          cy.get('h4.pf-v5-c-empty-state__title-text').should(
            'have.text',
            'There are currently no nodes in this workflow'
          );
          cy.get('div.pf-v5-c-empty-state__actions').within(() => {
            cy.get('[data-cy="add-node-button"]').should('be.visible');
          });
          cy.get('button[data-cy="workflow-visualizer-toolbar-close"]').click();
          cy.getByDataCy('description').should('contain', wfjt.description);
          cy.verifyPageTitle(`${jtName}`);
          cy.deleteAwxWorkflowJobTemplate(wfjt, { failOnStatusCode: false });
        });
    });
  });

  describe('Workflow Visualizer: Add Node to Existing Visualizer', () => {
    it('Adds a new node linked to an existing node with always status, and save the visualizer.', function () {
      cy.createAwxWorkflowVisualizerProjectNode(workflowJobTemplate, project).then((projNode) => {
        projectNode = projNode;
        cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((appNode) => {
          approvalNode = appNode;
          cy.createWorkflowJTSuccessNodeLink(projectNode, appNode);
          cy.navigateTo('awx', 'templates');
          cy.setTableView('table');
          cy.filterTableBySearch(workflowJobTemplate.name);
          cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
          cy.get('a[href*="/visualizer"]').click();
          cy.contains('Workflow Visualizer').should('be.visible');
          cy.getBy('button[id="fit-to-screen"]').click();
          cy.get(`g[data-id=${approvalNode.id}] .pf-topology__node__action-icon`).click({
            force: true,
          });
          cy.getByDataCy('add-node-and-link').click();
          cy.selectDropdownOptionByResourceName('node-type', 'Job Template');
          cy.selectAsyncSingleSelectOption('job-template-select', `${jobTemplate.name}`);
          cy.selectDropdownOptionByResourceName('node-status-type', 'Always');
          cy.selectDropdownOptionByResourceName('node-convergence', 'All');
          cy.getByDataCy('node-alias').type('Test Node');
          cy.clickButton('Next');
          cy.clickButton('Finish');
          cy.intercept(
            'POST',
            awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/workflow_nodes/`
          ).as('saved');
          cy.clickButton('Save');
          cy.wait('@saved');
          cy.getByDataCy('alert-toaster').should('be.visible');
          cy.get(`g[data-id="${projectNode.id}-${approvalNode.id}"]`).should(
            'have.text',
            'Run on success'
          );
          cy.get('g[data-id="3-unsavedNode"]').should('have.text', 'ALLTest Node');
          cy.get(`g[data-id=${approvalNode.id}-3-unsavedNode]`).should('have.text', 'Run always');
          cy.reload();
          cy.getBy('button[id="fit-to-screen"]').click();
          cy.getByDataCy('workflow-visualizer-toolbar-close').click();
          cy.verifyPageTitle(`${workflowJobTemplate.name}`);
        });
      });
    });
  });

  describe('Workflow Visualizer: Edit', () => {
    it('Can edit a node resource on a workflow visualizer already containing existing nodes', function () {
      cy.createAwxWorkflowVisualizerProjectNode(workflowJobTemplate, project).then(
        (projectNode) => {
          cy.createAwxWorkflowVisualizerInventorySourceNode(
            workflowJobTemplate,
            inventorySource
          ).then((inventorySourceNode) => {
            cy.createAwxWorkflowVisualizerManagementNode(workflowJobTemplate, 1)
              .then((managementNode) => {
                cy.createWorkflowJTSuccessNodeLink(projectNode, inventorySourceNode);
                cy.createWorkflowJTAlwaysNodeLink(inventorySourceNode, managementNode);
              })
              .then(() => {
                cy.navigateTo('awx', 'templates');
                cy.setTableView('table');
                cy.filterTableBySearch(workflowJobTemplate.name);
                cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
                cy.get('a[href*="/visualizer"]').click();
                cy.get(`g[data-id=${projectNode.id}] .pf-topology__node__action-icon`).click({
                  force: true,
                });
                cy.getByDataCy('edit-node').click();
                cy.get('button[data-cy="node-type-form-group"]').should(
                  'have.text',
                  'Project Sync'
                );
                cy.selectDropdownOptionByResourceName('node-type', 'Inventory Source Sync');
                cy.get('[id="inventory-source-select"]').click();
                cy.get('li').contains(`${inventorySource.name}`).click();
                cy.selectDropdownOptionByResourceName('node-convergence', 'All');
                cy.getByDataCy('node-alias').type('Inventory Source Node');
                cy.clickButton('Next');
                cy.clickButton('Finish');
                cy.get(`g[data-id=${projectNode.id}]`).should('have.text', 'Inventory Source Node');
              });
          });
          cy.clickButton('Save');
          cy.getByDataCy('alert-toaster').should(
            'have.text',
            'Success alert:Successfully saved workflow visualizer'
          );
          cy.getByDataCy('workflow-visualizer-toolbar-close').click();
          cy.getByDataCy('page-title').should('have.text', `${workflowJobTemplate.name}`);
        }
      );
    });

    it('Click on edge context menu option to change link type and close visualizer to show unsaved changes modal', function () {
      cy.createAwxWorkflowVisualizerProjectNode(workflowJobTemplate, project)
        .then((projNode) => {
          projectNode = projNode;
          cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((appNode) => {
            approvalNode = appNode;
            cy.createWorkflowJTSuccessNodeLink(projectNode, appNode);
          });
        })
        .then(() => {
          cy.navigateTo('awx', 'templates');
          cy.setTableView('table');
          cy.filterTableBySearch(workflowJobTemplate.name);
          cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
          cy.get('a[href*="/visualizer"]').click();
          cy.contains('Workflow Visualizer').should('be.visible');
          cy.get(`g[data-id="${projectNode.id}-${approvalNode.id}"]`).should(
            'have.text',
            'Run on success'
          );
          cy.get(`g[data-id="${projectNode.id}-${approvalNode.id}"]`).within(() => {
            cy.getByDataCy('edge-context-menu_kebab').click({ force: true });
          });
          cy.getByDataCy('fail').click();
          cy.getByDataCy('workflow-visualizer-toolbar-close').click();
          cy.getByDataCy('visualizer-unsaved-changes-modal').click();
          cy.getByDataCy('exit-without-saving').click();
          cy.verifyPageTitle(`${workflowJobTemplate.name}`);
        });
    });

    it('Create a job template node using a JT with multiple dependencies and then edit the node to use a different resource', function () {
      cy.navigateTo('awx', 'templates');
      cy.setTableView('table');
      cy.filterTableBySearch(workflowJobTemplate.name);
      cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
      cy.get('a[href*="/visualizer"]').click();
      cy.contains('Workflow Visualizer').should('be.visible');
      cy.clickButton('Add step');
      cy.selectDropdownOptionByResourceName('node-type', 'Job Template');
      cy.selectAsyncSingleSelectOption('job-template-select', `${jobTemplate.name}`);
      cy.selectDropdownOptionByResourceName('node-convergence', 'All');
      cy.getByDataCy('node-alias').type('Test Node');
      cy.clickButton('Next');
      cy.clickButton('Finish');
      cy.get('g[data-id="1-unsavedNode"]').should('have.text', 'ALLTest Node');
      cy.get(`g[data-id="1-unsavedNode"] .pf-topology__node__action-icon`).click({
        force: true,
      });
      cy.getByDataCy('edit-node').click();
      cy.selectDropdownOptionByResourceName('node-type', 'Project Sync');
      cy.selectAsyncSingleSelectOption('project-select', project.name);
      cy.selectDropdownOptionByResourceName('node-convergence', 'All');
      cy.getByDataCy('node-alias').type(`Project Node`);
      cy.clickButton('Next');
      cy.clickButton('Finish');
      cy.get('g[data-id="1-unsavedNode"]').should('have.text', 'ALLTest NodeProject Node');
      cy.clickButton('Save');
      cy.getByDataCy('alert-toaster').should('be.visible');
      cy.getByDataCy('workflow-visualizer-toolbar-close').click();
      cy.getByDataCy('page-title').should('have.text', `${workflowJobTemplate.name}`);
    });
  });

  describe('Workflow Visualizer: Remove and Add Nodes', () => {
    it('Can manually delete all nodes, save the visualizer, then add new nodes, and successfully save again.', function () {
      cy.createAwxWorkflowVisualizerProjectNode(workflowJobTemplate, project)
        .then((projNode) => {
          projectNode = projNode;
          cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then((appNode) => {
            approvalNode = appNode;
            cy.createWorkflowJTSuccessNodeLink(projectNode, appNode);
          });
        })
        .then(() => {
          cy.navigateTo('awx', 'templates');
          cy.setTableView('table');
          cy.filterTableBySearch(workflowJobTemplate.name);
          cy.filterTableBySingleSelect('name', workflowJobTemplate.name);
          cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
          cy.get('a[href*="/visualizer"]').click();
          cy.contains('Workflow Visualizer').should('be.visible');
          cy.get(`g[data-id=${projectNode.id}] .pf-topology__node__action-icon`).click({
            force: true,
          });
          cy.getByDataCy('remove-node').click();
          cy.clickModalConfirmCheckbox();
          cy.clickModalButton('Remove');
          cy.get(`g[data-id=${approvalNode.id}] .pf-topology__node__action-icon`).click({
            force: true,
          });
          cy.getByDataCy('remove-node').click();
          cy.clickModalConfirmCheckbox();
          cy.clickModalButton('Remove');
          cy.clickButton('Save');
          cy.getByDataCy('alert-toaster').should('be.visible');
          cy.clickButton('Add step');
          cy.selectDropdownOptionByResourceName('node-type', 'Job Template');
          cy.selectAsyncSingleSelectOption('job-template-select', jobTemplate.name);
          cy.selectDropdownOptionByResourceName('node-convergence', 'All');
          cy.getByDataCy('node-alias').type('Test Node');
          cy.clickButton('Next');
          cy.clickButton('Finish');
          cy.get(`g[class*="unsavedNode-node-label"] .pf-topology__node__action-icon`).click({
            force: true,
          });
          cy.getByDataCy('add-node-and-link').click();
          cy.selectDropdownOptionByResourceName('node-type', 'Project Sync');
          cy.selectAsyncSingleSelectOption('project-select', project.name);
          cy.selectDropdownOptionByResourceName('node-convergence', 'All');
          cy.getByDataCy('node-alias').type('Project Node');
          cy.clickButton('Next');
          cy.clickButton('Finish');
          cy.clickButton('Save');
          cy.getByDataCy('alert-toaster').should(
            'have.text',
            'Success alert:Successfully saved workflow visualizer'
          );
          cy.getBy('button[id="fit-to-screen"]').click();
        });
    });

    it('Can remove all existing nodes on a visualizer using the button in the toolbar kebab, save the visualizer, then add 2 new nodes and save the visualizer again', function () {
      cy.createAwxWorkflowVisualizerProjectNode(workflowJobTemplate, project).then(
        (projectNode) => {
          cy.createAwxWorkflowVisualizerInventorySourceNode(
            workflowJobTemplate,
            inventorySource
          ).then((inventorySourceNode) => {
            cy.createAwxWorkflowVisualizerManagementNode(workflowJobTemplate, 1)
              .then((managementNode) => {
                cy.createWorkflowJTSuccessNodeLink(projectNode, inventorySourceNode);
                cy.createWorkflowJTAlwaysNodeLink(inventorySourceNode, managementNode);
              })
              .then(() => {
                cy.navigateTo('awx', 'templates');
                cy.setTableView('table');
                cy.filterTableBySearch(workflowJobTemplate.name);
                cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
                cy.get('a[href*="/visualizer"]').click();
                cy.get('[data-cy="wf-vzr-name"]')
                  .should('contain', `${workflowJobTemplate.name}`)
                  .should('be.visible');
                cy.removeAllNodesFromVisualizerToolbar();
                cy.contains('button', 'Save').should('be.visible').click();
                cy.clickButton('Add step');
                cy.selectDropdownOptionByResourceName('node-type', 'Job Template');
                cy.selectAsyncSingleSelectOption('job-template-select', `${jobTemplate.name}`);
                cy.selectDropdownOptionByResourceName('node-convergence', 'All');
                cy.getByDataCy('node-alias').type('Test Node');
                cy.clickButton('Next');
                cy.clickButton('Finish');
                cy.clickButton('Add step');
                cy.selectDropdownOptionByResourceName('node-type', 'Project Sync');

                cy.selectAsyncSingleSelectOption('project-select', project.name);

                cy.selectDropdownOptionByResourceName('node-convergence', 'All');
                cy.clickButton('Next');
                cy.clickButton('Finish');
                cy.get('g[data-kind="node"]').should('have.length', 3);
                cy.clickButton('Save');
                cy.getByDataCy('alert-toaster').should(
                  'have.text',
                  'Success alert:Successfully saved workflow visualizer'
                );
                cy.getBy('button[id="fit-to-screen"]').click();
              });
          });
        }
      );
    });
  });

  describe('Workflow Visualizer: Delete Nodes or Links', () => {
    it('Can delete one single node and save the visualizer', function () {
      cy.createAwxWorkflowVisualizerProjectNode(workflowJobTemplate, project).then((projNode) => {
        projectNode = projNode;
        cy.createAwxWorkflowVisualizerApprovalNode(workflowJobTemplate).then(() => {
          cy.navigateTo('awx', 'templates');
          cy.setTableView('table');
          cy.filterTableBySearch(workflowJobTemplate.name);
          cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
          cy.get('a[href*="/visualizer"]').click();
          cy.contains('Workflow Visualizer').should('be.visible');
          cy.get('[data-kind="node"]').should('have.length', 3);
          cy.get(`g[data-id=${projectNode.id}] .pf-topology__node__action-icon`).click({
            force: true,
          });
          cy.getByDataCy('add-node-and-link').click();
          cy.selectDropdownOptionByResourceName('node-type', 'Job Template');
          cy.selectAsyncSingleSelectOption('job-template-select', `${jobTemplate.name}`);
          cy.selectDropdownOptionByResourceName('node-status-type', 'Always');
          cy.selectDropdownOptionByResourceName('node-convergence', 'All');
          cy.getByDataCy('node-alias').type('Test Node');
          cy.clickButton('Next');
          cy.clickButton('Finish');
          cy.get('g[data-id="3-unsavedNode"]').should('have.text', 'ALLTest Node');
          cy.get(`g[data-id=${projectNode.id}-3-unsavedNode]`).should('have.text', 'Run always');
          cy.get(`g[data-id=${projectNode.id}] .pf-topology__node__action-icon`).click({
            force: true,
          });
          cy.getByDataCy('remove-node').click();
          cy.clickModalConfirmCheckbox();
          cy.clickModalButton('Remove');
          cy.clickButton('Save');
          cy.getByDataCy('alert-toaster').should(
            'have.text',
            'Success alert:Successfully saved workflow visualizer'
          );
          cy.getByDataCy('workflow-visualizer-toolbar-close').click();
          cy.getByDataCy('page-title').should('have.text', `${workflowJobTemplate.name}`);
        });
      });
    });

    it('Can access an existing workflow visualizer and delete the link between two nodes', function () {
      cy.createAwxWorkflowVisualizerProjectNode(workflowJobTemplate, project)
        .then((projNode) => {
          projectNode = projNode;
          cy.createAwxWorkflowVisualizerWJTNode(workflowJobTemplate).then((wfjtNode) => {
            workflowJtNode = wfjtNode;
            cy.createWorkflowJTFailureNodeLink(projectNode, workflowJtNode);
          });
        })
        .then(() => {
          cy.navigateTo('awx', 'templates');
          cy.setTableView('table');
          cy.filterTableBySearch(workflowJobTemplate.name);
          cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
          cy.get('a[href*="/visualizer"]').click();
          cy.contains('Workflow Visualizer').should('be.visible');
          cy.contains('Run on fail').should('be.visible');
          cy.get(`g[data-id="${projectNode.id}-${workflowJtNode.id}"]`).within(() => {
            cy.getByDataCy('edge-context-menu_kebab').click({ force: true });
          });
          cy.getByDataCy('remove-link').click();
          cy.getModal().within(() => {
            cy.get('[data-ouia-component-id="confirm"]').click();
            cy.get('[data-ouia-component-id="submit"]').click();
          });
          cy.getByDataCy('workflow-visualizer-toolbar-save').click();
          cy.getByDataCy('alert-toaster').should(
            'have.text',
            'Success alert:Successfully saved workflow visualizer'
          );
          cy.reload();
          cy.contains('Workflow Visualizer').should('be.visible');
          cy.contains('Run on fail').should('not.exist');
        });
    });
  });
});

describe('Workflow Visualizer Prompt Step', () => {
  let organization: Organization;
  let project: Project;
  let inventory: Inventory;
  let jobTemplate: JobTemplate;
  let workflowJobTemplate: WorkflowJobTemplate;

  before(function () {
    cy.createAwxOrganization().then((thisAwxOrg) => {
      organization = thisAwxOrg;

      cy.createAwxProject(organization).then((proj) => {
        project = proj;
      });
    });
  });

  beforeEach(function () {
    cy.createAwxInventory(organization)
      .then((i) => {
        inventory = i;
      })
      .then(() => {
        cy.createAwxJobTemplate({
          organization: organization.id,
          project: project.id,
          inventory: inventory.id,
          ask_skip_tags_on_launch: true,
          skip_tags: 'aap-ui',
        }).then((jt) => {
          jobTemplate = jt;

          cy.createAwxWorkflowJobTemplate({
            organization: organization.id,
            inventory: inventory.id,
          }).then((wfjt) => {
            workflowJobTemplate = wfjt;
          });
        });
      });
  });

  afterEach(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
    cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
  });

  after(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });
  it('Should update skip tags', () => {
    cy.navigateTo('awx', 'templates');
    cy.setTableView('table');
    cy.filterTableBySingleSelect('name', workflowJobTemplate.name);
    cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
    cy.get('a[href*="/visualizer"]').click();
    cy.contains('Workflow Visualizer').should('be.visible');
    cy.clickButton('Add step');
    cy.selectDropdownOptionByResourceName('node-type', 'Job Template');
    cy.selectAsyncSingleSelectOption('job-template-select', `${jobTemplate.name}`);
    cy.selectDropdownOptionByResourceName('node-convergence', 'All');
    cy.getByDataCy('node-alias').type('Test Node');
    cy.clickButton('Next');
    // Prompt steps don't show up right away in Cypress - assert that the "Prompt" step in the wizard nav is visible, as well as the form label name ("Skip tags")
    cy.get('[data-cy="wizard-nav-item-nodePromptsStep"]').contains('Prompts').click();
    cy.get('[data-cy="prompt.skip_tags-form-group"]').contains('Skip tags');

    cy.getByDataCy('prompt.skip_tags-typeahead-input').within(() => {
      cy.get('span.pf-v5-c-chip__content').should('have.text', 'aap-ui');
      cy.get('input').type('new skip tag');
    });
    cy.getByDataCy('prompt.skip_tags-typeahead-select').within(() => {
      cy.get('button').should('have.text', 'Create "new skip tag"').click({ force: true });
    });
    cy.get('[data-cy="prompt.skip_tags-typeahead-input"]').contains('new skip tag');
    cy.clickButton('Next');
    cy.clickButton('Finish');
    cy.clickButton('Save');
    cy.get('g[data-type="node"]').within(() => {
      cy.get('ellipse').click({ force: true });
    });
    const skipTagLabels = ['aap-ui', 'new skip tag'];
    cy.get('span.pf-v5-c-label__text').each(($el, index) => {
      cy.wrap($el).should('have.text', `${skipTagLabels[index]}`);
    });
  });
});
