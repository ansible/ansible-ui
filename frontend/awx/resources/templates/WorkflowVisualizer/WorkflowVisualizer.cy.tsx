import { WorkflowJobTemplateVisualizer } from './WorkflowVisualizer';

describe('WorkflowVisualizer', () => {
  it('Should show the WorkflowVisualizer toolbar with Add and Cancel buttons', () => {
    cy.mount(<WorkflowJobTemplateVisualizer />);
    cy.contains('button:not(:disabled):not(:hidden)', 'Save').should('be.visible');
    cy.contains('button:not(:disabled):not(:hidden)', 'Add node').should('be.visible');
    cy.get('[data-cy="workflowVisualizerToolbarNodes"]').should('have.text', 'Total nodes 0');
    cy.get('button[data-cy="workflowVisualizerToolbarExpandCollapse"]').should('be.visible');
  });
});
