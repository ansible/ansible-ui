import { NodeFormInputs } from './NodeFormInputs';
import nodes from '../../../../../../cypress/fixtures/workflow_nodes.json';
import { WorkflowNode } from '../../../../interfaces/WorkflowNode';

describe('NodeFormInputs', () => {
  it('Should render the correct fields for a job template node', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/job_templates/*' },
      { fixture: 'jobTemplates.json' }
    );
    cy.mount(<NodeFormInputs setSelectedNode={() => {}} node={nodes.results[0] as WorkflowNode} />);
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Job Template');
    });
    cy.get('[data-cy="node-status-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Always run');
    });
    cy.get('[data-cy="job-template-select-form-group"]').within(() => {
      cy.get('div.pf-v5-c-form__group-control').should('have.text', 'E2E Job Template 9Bay');
    });
    cy.get('[data-cy="all-parents-must-converge-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Any');
    });
    cy.get('[data-cy="identifier-form-group"]').within(() => {
      cy.get('input').should('have.value', '');
    });
  });
  it('Should render the correct fields for a proect sync node', () => {
    cy.intercept({ method: 'GET', url: '/api/v2/projects/*' }, { fixture: 'projects.json' });
    cy.mount(<NodeFormInputs setSelectedNode={() => {}} node={nodes.results[1] as WorkflowNode} />);
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Project Sync');
    });

    cy.get('[data-cy="project-form-group"]').within(() => {
      cy.get('div.pf-v5-c-select__toggle-wrapper').should('have.text', 'Demo Project');
    });
  });

  it('Should render the correct fields for a workflow approval node', () => {
    cy.intercept({ method: 'GET', url: '/api/v2/system_jobs/*' }, { fixture: 'system_jobs.json' });
    cy.mount(<NodeFormInputs setSelectedNode={() => {}} node={nodes.results[2] as WorkflowNode} />);
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Approval');
    });

    cy.get('[data-cy="node-resource-name"]').should('have.value', 'app new');
  });
  it('Should render the correct fields for a workflow job template node', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/workflow_job_templates/*' },
      { fixture: 'workflowJobTemplates.json' }
    );
    cy.mount(<NodeFormInputs setSelectedNode={() => {}} node={nodes.results[3] as WorkflowNode} />);
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Workflow Job Template');
    });

    cy.get('[data-cy="job-template-select-form-group"]').within(() => {
      cy.get('div.pf-v5-c-select__toggle-wrapper').should('have.text', 'alex wfjt');
    });
  });
  it('Should render the correct fields for a management job node', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/inventory_sources/*' },
      { fixture: 'inventory_sources.json' }
    );
    cy.mount(<NodeFormInputs setSelectedNode={() => {}} node={nodes.results[4] as WorkflowNode} />);
    cy.get('[data-cy="node-type-form-group"]').within(() => {
      cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Management Job');
    });

    cy.get('[data-cy="management-job-template-select-form-group"]').within(() => {
      cy.get('div.pf-v5-c-select__toggle-wrapper').should('have.text', 'Cleanup Activity Stream');
    });
  });

  it('Should render the correct fields for a workflow approval node', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/inventory_sources/*' },
      { fixture: 'inventory_sources.json' }
    );
    cy.mount(<NodeFormInputs setSelectedNode={() => {}} node={nodes.results[5] as WorkflowNode} />);
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
    cy.mount(<NodeFormInputs setSelectedNode={() => {}} node={nodes.results[5] as WorkflowNode} />);
    cy.selectDropdownOptionByResourceName('node-type', 'Job Template');
    cy.selectDropdownOptionByResourceName('node-status-type', 'failure');
    cy.selectDropdownOptionByResourceName('all-parents-must-converge', 'All');
    cy.get('[data-cy="identifier"]').type('Test Node');
  });
});
