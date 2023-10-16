import { WorkflowVisualizer } from './WorkflowVisualizer';

describe('WorkflowVisualizer', () => {
  it('Should show the WorkflowVisualizer toolbar with Add and Cancel buttons', () => {
    cy.mount(<WorkflowVisualizer />);
    cy.contains('button:not(:disabled):not(:hidden)', 'Add node').should('be.visible');
    cy.get('button[data-cy="workflow-visualizer-toolbar-close"]').should('be.visible');
  });
});
