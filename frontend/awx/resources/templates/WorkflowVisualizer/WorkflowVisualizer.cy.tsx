import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { WorkflowVisualizer } from './WorkflowVisualizer';

describe('WorkflowVisualizer', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/workflow_job_templates/*/workflow_nodes/*',
      },
      { fixture: 'workflow_nodes.json' }
    ).as('getWorkflowNodes');
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/*' },
      { fixture: 'workflowJobTemplate.json' }
    );
    cy.intercept('/api/v2/job_templates/*', { fixture: 'jobTemplate.json' });
    cy.intercept('/api/v2/job_templates/*/instance_groups', { fixture: 'instance_groups.json' });
  });

  it('Should render nodes and labels', () => {
    cy.mount(<WorkflowVisualizer />);
    cy.wait('@getWorkflowNodes')
      .its('response.body.results')
      .then((nodes: WorkflowNode[]) => {
        nodes.forEach((node: WorkflowNode) => {
          cy.get(`[data-id="${node.id}"]`).should('be.visible');
          cy.get(`[data-id="${node.id}"] text`).should(
            'have.text',
            node.summary_fields.unified_job_template.name
          );
        });
      });
  });

  it('Should show topology control bar and legend', () => {
    cy.mount(<WorkflowVisualizer />);
    cy.get('.pf-topology-control-bar').within(() => {
      cy.get('button').should('have.length', 5);
      cy.get('button#reset-view').should('be.visible');
      cy.get('button#zoom-in').should('be.visible');
      cy.get('button#zoom-out').should('be.visible');
      cy.get('button#fit-to-screen').should('be.visible');
      cy.get('button#legend').should('be.visible');
      cy.get('button#legend').click();
    });
    cy.get('[data-cy="workflow-visualizer-legend"]')
      .should('exist')
      .within(() => {
        cy.get('[data-cy="legend-node-types"]').should((description) => {
          expect(description).to.contain('Node types');
          expect(description).to.contain('Job Template');
          expect(description).to.contain('Workflow Template');
          expect(description).to.contain('Project Sync');
          expect(description).to.contain('Approval Node');
          expect(description).to.contain('Inventory Update');
          expect(description).to.contain('System Job');
        });
        cy.get('[data-cy="legend-node-status-types"]').should((description) => {
          expect(description).to.contain('Node status types');
          expect(description).to.contain('Failed');
          expect(description).to.contain('Warning');
        });
        cy.get('[data-cy="legend-run-status-types"]').should((description) => {
          expect(description).to.contain('Run status types');
          expect(description).to.contain('Run on success');
          expect(description).to.contain('Run on fail');
          expect(description).to.contain('Run always');
        });
      });
  });

  it('Should show sidebar details when a node is selected', () => {
    cy.mount(<WorkflowVisualizer />);
    cy.get('[data-id="1510"]').click();
    cy.get('[data-cy="workflow-topology-sidebar"]').should('be.visible');
  });

  it('Node label kebab should open context menu dropdown', () => {
    cy.mount(<WorkflowVisualizer />);
    cy.get('[data-id="1510"] .pf-topology__node__action-icon').click();
    cy.get('li[data-cy="edit-node"]').should('be.visible');
    cy.get('li[data-cy="add-link"]').should('be.visible');
    cy.get('li[data-cy="add-node-and-link"]').should('be.visible');
    cy.get('li[data-cy="remove-node"]').should('be.visible');
  });

  it('Edge label kebab should open context menu dropdown', () => {
    cy.mount(<WorkflowVisualizer />);
    cy.get('[data-id="1356-1511"]').within(() => {
      cy.get('[data-cy="edge-context-menu_kebab"]').click({ force: true });
    });
    cy.get('li[data-cy="success"]').should('be.visible');
    cy.get('li[data-cy="always"]').should('be.visible');
    cy.get('li[data-cy="fail"]').should('be.visible');
    cy.get('li[data-cy="remove-link"]').should('be.visible');
  });

  it('Click on edge context menu option to change link type', () => {
    cy.mount(<WorkflowVisualizer />);
    cy.get('[data-id="1356-1511"]').within(() => {
      cy.get('[data-cy="edge-context-menu_kebab"]').click({ force: true });
    });
    cy.get('li[data-cy="fail"]').click();
    cy.get('[data-id="1356-1511"]').within(() => {
      cy.get('text').should('have.text', 'Run on fail');
    });
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
        { method: 'GET', url: '/api/v2/workflow_job_templates/*/workflow_nodes/*' },
        workflowNodes
      );
    });

    cy.mount(<WorkflowVisualizer />);
    cy.get('[data-cy="workflow-visualizer"]').should('be.visible');
    cy.get('[data-cy="workflow-visualizer-toolbar-total-nodes"]').should(
      'have.text',
      'Total nodes 6'
    );
  });

  it('Should show Delete all nodes button', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/*/workflow_nodes/*' },
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

describe('Empty state', () => {
  it('Should show empty state view', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/123/workflow_nodes/?*' },
      {
        statusCode: 200,
        body: {
          count: 0,
          next: null,
          previous: null,
          results: [],
        },
      }
    );
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/123' },
      { fixture: 'workflowJobTemplate.json' }
    );
    cy.mount(<WorkflowVisualizer />, {
      path: '/templates/workflow_job_template/:id/visualizer',
      initialEntries: ['/templates/workflow_job_template/123/visualizer'],
    });
    cy.get('h4.pf-v5-c-empty-state__title-text').should(
      'have.text',
      'There are currently no nodes in this workflow'
    );
    cy.get('div.pf-v5-c-empty-state__actions').within(() => {
      cy.get('[data-cy="add-node-button"]').should('be.visible');
    });
  });
});
