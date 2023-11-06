import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { WorkflowVisualizer } from './WorkflowVisualizer';

describe('WorkflowVisualizer', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/*/workflow_nodes/' },
      { fixture: 'workflow_nodes.json' }
    );
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/*' },
      { fixture: 'workflowJobTemplate.json' }
    );
  });

  it('Should show the WorkflowVisualizer toolbar with Add and Cancel buttons', () => {
    cy.mount(<WorkflowVisualizer />);
    cy.contains('button:not(:disabled):not(:hidden)', 'Save').should('be.visible');
    cy.contains('button:not(:disabled):not(:hidden)', 'Add node').should('be.visible');
    cy.get('button[data-cy="workflow-visualizer-toolbar-close"]').should('be.visible');
    cy.get('button[data-cy="workflow-visualizer-toolbar-expand-collapse"]').should('be.visible');
    cy.get('svg[data-cy="workflow-visualizer-toolbar-collapse"]').should('not.exist');
  });
  it('Should toggle the expand collapse button in the toolbar', () => {
    cy.mount(<WorkflowVisualizer />);
    cy.get('button[data-cy="workflow-visualizer-toolbar-expand-collapse"]').click();
    cy.get('svg[data-cy="workflow-visualizer-toolbar-expand"]').should('not.exist');
    cy.get('[data-cy="workflow-visualizer-toolbar-collapse"]').should('be.visible');
    cy.get('button[data-cy="workflow-visualizer-toolbar-expand-collapse"]').click();
    cy.get('[data-cy="workflow-visualizer-toolbar-expand"]').should('be.visible');
    cy.get('[data-cy="workflow-visualizer-toolbar-collapse"]').should('not.exist');
  });

  it('Should show the visualizer screen', () => {
    cy.fixture('workflow_nodes.json').then((workflowNodes: AwxItemsResponse<WorkflowNode>) => {
      workflowNodes.count = 3;
      cy.intercept(
        { method: 'GET', url: '/api/v2/workflow_job_templates/*/workflow_nodes/' },
        workflowNodes
      );
    });

    cy.mount(<WorkflowVisualizer />);
    cy.get('[data-cy="workflow-visualizer"]').should('be.visible');
    cy.get('[data-cy="workflow-visualizer-toolbar-total-nodes"]').should(
      'have.text',
      'Total nodes 3'
    );
  });

  it('Should show Delete all nodes button', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/*/workflow_nodes/' },
      { fixture: 'workflow_nodes.json' }
    );

    cy.mount(<WorkflowVisualizer />);
    cy.get('.toggle-kebab')
      .click()
      .get('.pf-v5-c-menu__item-text')
      .contains('Remove all nodes')
      .should('be.visible');
    cy.get('.toggle-kebab').click();
    cy.get('.toggle-kebab')
      .click()
      .get('[data-cy="workflow-documentation"]')
      .contains('Documentation')
      .should('have.attr', 'href')
      .should('include', 'html/userguide/workflow_templates.html#ug-wf-editor');
    cy.get('.toggle-kebab').click();
    cy.get('.toggle-kebab')
      .click()
      .get('.pf-v5-c-menu__item-text')
      .contains('Launch workflow')
      .should('be.visible');
  });
});

describe('Workflow visuazlier empty state', () => {
  it('Should mount with empty state', () => {
    cy.fixture('workflow_nodes.json').then((workflow_nodes: AwxItemsResponse<WorkflowNode>) => {
      workflow_nodes.count = 0;
      workflow_nodes.results = [];
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/workflow_job_templates/*/workflow_nodes/',
          hostname: 'localhost',
        },
        { workflow_nodes }
      );
    });
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/*' },
      { fixture: 'workflowJobTemplate.json' }
    );
    cy.mount(<WorkflowVisualizer />);
    cy.get('h4.pf-v5-c-empty-state__title-text').should(
      'have.text',
      'There are currently no nodes in this workflow'
    );
    cy.get('div.pf-v5-c-empty-state__actions').within(() => {
      cy.get('[data-cy="add-node-button"]').should('be.visible');
    });
  });
});
