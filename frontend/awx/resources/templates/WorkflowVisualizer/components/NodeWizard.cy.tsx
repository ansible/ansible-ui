import { NodeWizard } from './NodeWizard';
import { ControllerContext, Controller } from '@patternfly/react-topology';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';

describe('NodeWizard', () => {
  const mockContext = (resource: WorkflowNode) => {
    const context = {
      getState: () => ({
        workflowTemplate: { summary_fields: { user_capabilities: { edit: true } } },
        selectedIds: [resource.id],
      }),
      getNodeById: () => ({
        getData: () => ({
          resource,
        }),
      }),
    };
    return context as unknown as Controller;
  };

  it('Should render the correct fields for a job template node', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/job_templates/*' },
      { fixture: 'jobTemplates.json' }
    );
    cy.fixture('workflow_nodes.json').then(({ results }: { results: WorkflowNode[] }) => {
      cy.mount(
        <ControllerContext.Provider value={mockContext(results[0])}>
          <NodeWizard mode={'edit'} />
        </ControllerContext.Provider>
      );
    });
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Job Template');
    });
    cy.get('[data-cy="job-template-select-form-group"]').within(() => {
      cy.get('div.pf-v5-c-form__group-control').should('have.text', 'E2E Job Template 9Bay');
    });
    cy.get('[data-cy="convergence-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Any');
    });
    cy.get('[data-cy="alias-form-group"]').within(() => {
      cy.get('input').should('have.value', '');
    });
  });

  it('Should render the correct fields for a project sync node', () => {
    cy.intercept({ method: 'GET', url: '/api/v2/projects/*' }, { fixture: 'projects.json' });
    cy.fixture('workflow_nodes.json').then(({ results }: { results: WorkflowNode[] }) => {
      cy.mount(
        <ControllerContext.Provider value={mockContext(results[1])}>
          <NodeWizard mode={'edit'} />
        </ControllerContext.Provider>
      );
    });
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Project Sync');
    });

    cy.get('[data-cy="project-form-group"]').within(() => {
      cy.get('div.pf-v5-c-select__toggle-wrapper').should('have.text', 'Demo Project');
    });
  });

  it('Should render the correct fields for an approval node', () => {
    cy.fixture('workflow_nodes.json').then(({ results }: { results: WorkflowNode[] }) => {
      cy.mount(
        <ControllerContext.Provider value={mockContext(results[2])}>
          <NodeWizard mode={'edit'} />
        </ControllerContext.Provider>
      );
    });
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Approval');
    });
    cy.get('[data-cy="convergence-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Any');
    });
    cy.get('[data-cy="workflow-approval-name"]').should('have.value', 'app new');
    cy.get('[data-cy="workflow-approval-description"]').should('have.value', '');
    cy.get('[data-cy="workflow-approval-timeout-minutes"]').should('have.value', 10);
    cy.get('[data-cy="workflow-approval-timeout-seconds"]').should('have.value', 0);
    cy.get('[data-cy="alias"]').should('have.value', 'workflow_approval_alias');
  });

  it('Should render the correct fields for a workflow job template node', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/*' },
      { fixture: 'workflowJobTemplates.json' }
    );
    cy.fixture('workflow_nodes.json').then(({ results }: { results: WorkflowNode[] }) => {
      cy.mount(
        <ControllerContext.Provider value={mockContext(results[3])}>
          <NodeWizard mode={'edit'} />
        </ControllerContext.Provider>
      );
    });
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Workflow Job Template');
    });
    cy.get('[data-cy="job-template-select-form-group"]').within(() => {
      cy.get('div.pf-v5-c-select__toggle-wrapper').should('have.text', 'alex wfjt');
    });
  });

  it('Should render the correct fields for a system job node', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/inventory_sources/*' },
      { fixture: 'inventory_sources.json' }
    );
    cy.fixture('workflow_nodes.json').then(({ results }: { results: WorkflowNode[] }) => {
      cy.mount(
        <ControllerContext.Provider value={mockContext(results[4])}>
          <NodeWizard mode={'edit'} />
        </ControllerContext.Provider>
      );
    });
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Management Job');
    });
    cy.get('[data-cy="management-job-template-select-form-group"]').within(() => {
      cy.get('div.pf-v5-c-select__toggle-wrapper').should('have.text', 'Cleanup Activity Stream');
    });
  });

  it('Should render the correct fields for a inventory source node', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/inventory_sources/*' },
      { fixture: 'inventory_sources.json' }
    );
    cy.fixture('workflow_nodes.json').then(({ results }: { results: WorkflowNode[] }) => {
      cy.mount(
        <ControllerContext.Provider value={mockContext(results[5])}>
          <NodeWizard mode={'edit'} />
        </ControllerContext.Provider>
      );
    });
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Inventory Source Sync');
    });
    cy.get('[data-cy="inventory-source-select-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Demo Inventory Source');
    });
  });

  it('Should update fields', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/job_templates/*' },
      { fixture: 'jobTemplates.json' }
    );
    cy.fixture('workflow_nodes.json').then(({ results }: { results: WorkflowNode[] }) => {
      cy.mount(
        <ControllerContext.Provider value={mockContext(results[5])}>
          <NodeWizard mode={'edit'} />
        </ControllerContext.Provider>
      );
    });
    cy.selectDropdownOptionByResourceName('node-type', 'Job Template');
    cy.selectDropdownOptionByResourceName('convergence', 'All');
    cy.get('[data-cy="alias"]').type('Test Node');
  });
});
