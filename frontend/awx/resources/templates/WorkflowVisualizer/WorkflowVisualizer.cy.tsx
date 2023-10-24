import { WorkflowVisualizer } from './WorkflowVisualizer';

describe('WorkflowVisualizer', () => {
  before(() => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/*/workflow_nodes/' },
      { fixture: 'workflow_nodes.json' }
    );
  });

  it('Should show the WorkflowVisualizer toolbar with Add and Cancel buttons', () => {
    cy.mount(<WorkflowVisualizer />);
    cy.contains('button:not(:disabled):not(:hidden)', 'Save').should('be.visible');
    cy.contains('button:not(:disabled):not(:hidden)', 'Add node').should('be.visible');
    cy.get('button[data-cy="workflow-visualizer-toolbar-close"]').should('be.visible');
    cy.get('button[data-cy="workflow-visualizer-toolbar-expand-compress"]').should('be.visible');
    cy.get('svg[data-cy="workflow-visualizer-toolbar-compress"]').should('not.exist');
  });
  it('Should toggle the expand collapse button in the toolbar', () => {
    cy.mount(<WorkflowVisualizer />);
    cy.get('button[data-cy="workflow-visualizer-toolbar-expand-compress"]').click();
    cy.get('svg[data-cy="workflow-visualizer-toolbar-expand"]').should('not.exist');
    cy.get('[data-cy="workflow-visualizer-toolbar-compress"]').should('be.visible');
    cy.get('button[data-cy="workflow-visualizer-toolbar-expand-compress"]').click();
    cy.get('[data-cy="workflow-visualizer-toolbar-expand"]').should('be.visible');
    cy.get('[data-cy="workflow-visualizer-toolbar-compress"]').should('not.exist');
  });

  it('Should show the visualizer screen', () => {
    cy.mount(<WorkflowVisualizer />);
    cy.get('[data-cy="workflow-visualizer"]').should('be.visible');
  });
});
