import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import { VisualizationProvider } from '@patternfly/react-topology';
import { NodeAddWizard } from './NodeAddWizard';

describe('NodeAddWizard', () => {
  const mockResults = {
    count: 2,
    results: [
      { id: 1, name: 'One' },
      { id: 2, name: 'Two' },
    ],
  };

  beforeEach(() => {
    cy.intercept({ method: 'GET', url: awxAPI`/job_templates/*` }, mockResults);
  });

  it('Should render the correct defaults', () => {
    cy.mount(
      <VisualizationProvider>
        <NodeAddWizard />
      </VisualizationProvider>
    );
    cy.get('[data-cy="node-type-form-group"] button').click();
    cy.contains('Job Template').click();
    cy.get('[data-cy="job-template-select-form-group"] button').click();
    cy.contains('Select job template');
    cy.contains('One').click();
    cy.get('[data-cy="node-convergence-form-group"] button').last().click();
    cy.contains('Any').click();
    cy.get('[data-cy="node-alias"]').should('have.value', '');
  });

  it('Should render the correct fields for a job template node', () => {
    cy.mount(
      <VisualizationProvider>
        <NodeAddWizard />
      </VisualizationProvider>
    );
    cy.get('[data-cy="node-type-form-group"] button').click();
    cy.contains('Job Template').click();
    cy.get('[data-cy="job-template-select-form-group"] button').click();
    cy.contains('Select job template');
    cy.contains('One').click();
    cy.get('[data-cy="node-convergence-form-group"] button').last().click();
    cy.contains('Any').click();
    cy.get('[data-cy="node-alias"]').should('have.value', '');
  });

  it('Should render the correct fields for a workflow job template node', () => {
    cy.intercept(
      { method: 'GET', url: awxAPI`/workflow_job_templates/*` },
      { fixture: 'workflowJobTemplates.json' }
    );
    cy.mount(
      <VisualizationProvider>
        <NodeAddWizard />
      </VisualizationProvider>
    );
    cy.selectDropdownOptionByResourceName('node-type', 'Workflow Job Template');
    cy.get('[data-cy="node-type-form-group"] button').click();
    cy.contains('Workflow Job Template').click();
    cy.get('[data-cy="job-template-select-form-group"] button').click();
    cy.contains('Select a workflow job template');
  });

  it('Should render the correct fields for a workflow approval node', () => {
    cy.mount(
      <VisualizationProvider>
        <NodeAddWizard />
      </VisualizationProvider>
    );
    cy.selectDropdownOptionByResourceName('node-type', 'Approval');
    cy.get('[data-cy="approval_name"]').should('have.value', '');
    cy.get('[data-cy="approval_description"]').should('have.value', '');
    cy.get('[data-cy="approval_timeout_minutes"]').should('have.value', 0);
    cy.get('[data-cy="approval_timeout_seconds"]').should('have.value', 0);
  });

  it('Should render the correct fields for a project sync node', () => {
    cy.intercept({ method: 'GET', url: awxAPI`/projects/*` }, { fixture: 'projects.json' });
    cy.mount(
      <VisualizationProvider>
        <NodeAddWizard />
      </VisualizationProvider>
    );
    cy.selectDropdownOptionByResourceName('node-type', 'Project Sync');
    cy.get('[data-cy="node-type-form-group"] button').click();
    cy.contains('Project Sync').click();
    cy.selectAsyncSingleSelectOption('project-select', 'Demo Project');
  });

  it('Should render the correct fields for an inventory source node', () => {
    cy.intercept({ method: 'GET', url: awxAPI`/inventory_sources/*` }, mockResults);
    cy.mount(
      <VisualizationProvider>
        <NodeAddWizard />
      </VisualizationProvider>
    );
    cy.selectDropdownOptionByResourceName('node-type', 'Inventory Source Sync');
    cy.get('[data-cy="node-type-form-group"] button').click();
    cy.contains('Inventory Source Sync').click();
    cy.get('[data-cy="inventory-source-select-form-group"] button').click();
    cy.contains('Select inventory source');
  });

  it('Should render the correct fields for a management job node', () => {
    cy.intercept({ method: 'GET', url: awxAPI`/system_job_templates/` }, mockResults);
    cy.mount(
      <VisualizationProvider>
        <NodeAddWizard />
      </VisualizationProvider>
    );
    cy.selectDropdownOptionByResourceName('node-type', 'Management Job');
    cy.get('[data-cy="node-type-form-group"] button').click();
    cy.contains('Management Job').click();
    cy.get('[data-cy="management-job-template-select-form-group"] button').click();
    cy.contains('Select management job template');
  });
});
