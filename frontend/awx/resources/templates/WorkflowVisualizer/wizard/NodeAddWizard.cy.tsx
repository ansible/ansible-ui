import { NodeAddWizard } from './NodeAddWizard';
import { awxAPI } from '../../../../common/api/awx-utils';
import { VisualizationProvider } from '@patternfly/react-topology';

describe('NodeAddWizard', () => {
  const mockResults = {
    count: 2,
    results: [
      {
        id: 1,
        name: 'One',
      },
      {
        id: 2,
        name: 'Two',
      },
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
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Job Template');
    });
    cy.get('[data-cy="job-template-select-form-group"]').within(() => {
      cy.get('div.pf-v5-c-form__group-control').should('have.text', 'Select job template');
    });
    cy.get('[data-cy="node-convergence-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Any');
    });
    cy.get('[data-cy="node-alias-form-group"]').within(() => {
      cy.get('input').should('have.value', '');
    });
  });

  it('Should render the correct fields for a job template node', () => {
    cy.mount(
      <VisualizationProvider>
        <NodeAddWizard />
      </VisualizationProvider>
    );
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Job Template');
    });
    cy.get('[data-cy="job-template-select-form-group"]').within(() => {
      cy.get('div.pf-v5-c-form__group-control').should('have.text', 'Select job template');
    });
    cy.get('[data-cy="node-convergence-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Any');
    });
    cy.get('[data-cy="node-alias-form-group"]').within(() => {
      cy.get('input').should('have.value', '');
    });
  });

  it('Should render the correct fields for a workflow job template node', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/*' },
      { fixture: 'workflowJobTemplates.json' }
    );
    cy.mount(
      <VisualizationProvider>
        <NodeAddWizard />
      </VisualizationProvider>
    );
    cy.selectDropdownOptionByResourceName('node-type', 'Workflow Job Template');
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Workflow Job Template');
    });
    cy.get('[data-cy="job-template-select-form-group"]').within(() => {
      cy.get('div.pf-v5-c-select__toggle-wrapper').should(
        'have.text',
        'Select a workflow job template'
      );
    });
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
    cy.intercept({ method: 'GET', url: '/api/v2/projects/*' }, { fixture: 'projects.json' });
    cy.mount(
      <VisualizationProvider>
        <NodeAddWizard />
      </VisualizationProvider>
    );
    cy.selectDropdownOptionByResourceName('node-type', 'Project Sync');
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Project Sync');
    });
    cy.get('[data-cy="project-form-group"]').within(() => {
      cy.get('div.pf-v5-c-select__toggle-wrapper').should('have.text', 'Select project');
    });
  });

  it('Should render the correct fields for an inventory source node', () => {
    cy.intercept({ method: 'GET', url: '/api/v2/inventory_sources/*' }, mockResults);
    cy.mount(
      <VisualizationProvider>
        <NodeAddWizard />
      </VisualizationProvider>
    );
    cy.selectDropdownOptionByResourceName('node-type', 'Inventory Source Sync');
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Inventory Source Sync');
    });
    cy.get('[data-cy="inventory-source-select-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Select inventory source');
    });
  });

  it('Should render the correct fields for a management job node', () => {
    cy.intercept({ method: 'GET', url: '/api/v2/system_job_templates/' }, mockResults);
    cy.mount(
      <VisualizationProvider>
        <NodeAddWizard />
      </VisualizationProvider>
    );
    cy.selectDropdownOptionByResourceName('node-type', 'Management Job');
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Management Job');
    });
    cy.get('[data-cy="management-job-template-select-form-group"]').within(() => {
      cy.get('div.pf-v5-c-select__toggle-wrapper').should(
        'have.text',
        'Select a management job template'
      );
    });
  });
});
