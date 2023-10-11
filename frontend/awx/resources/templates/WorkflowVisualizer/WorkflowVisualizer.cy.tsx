import { WorkflowJobTemplateVisualizer } from './WorkflowVisualizer';

describe('WorkflowVisualizer', () => {
  it('Should show the WorkflowVisualizer toolbar with Add and Cancel buttons', () => {
    cy.mount(<WorkflowJobTemplateVisualizer />);
    cy.contains('button:not(:disabled):not(:hidden)', 'Add node').should('be.visible');
    cy.get('button[data-cy="workflowVisualizerToolbarClose"]').should('be.visible');
  });
});
