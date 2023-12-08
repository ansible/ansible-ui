import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { WorkflowVisualizerNodeDetails } from './WorkflowVisualizerNodeDetails';

describe('WorkflowVisualizerNodeDetails', () => {
  it('should render job template details with prompted values', () => {
    cy.fixture('jobTemplate.json').then((jobTemplate: JobTemplate) => {
      jobTemplate.ask_credential_on_launch = true;
      cy.intercept('GET', '/api/v2/job_templates/*', jobTemplate);
    });

    cy.intercept({ method: 'GET', url: '/api/v2/credentials/*/' }, { fixture: 'credential.json' });
    cy.intercept(
      { method: 'GET', url: '/api/v2/job_templates/*/instance_groups/' },
      { fixture: 'instance_groups.json' }
    );
    cy.mount(
      <WorkflowVisualizerNodeDetails
        resource={
          {
            summary_fields: {
              unified_job_template: { unified_job_type: 'job', id: 7 },
            },
          } as WorkflowNode
        }
      />
    );

    cy.get('dd[data-cy="name"]').within(() => {
      cy.get('a').should('have.text', 'JT with Default Cred');
      cy.get('a').should('have.attr', 'href');
    });
  });

  it('should render workflow job template details with prompted values', () => {
    cy.fixture('workflowJobTemplate.json').then((jobTemplate: JobTemplate) => {
      jobTemplate.ask_inventory_on_launch = true;
      cy.intercept('GET', '/api/v2/workflow_job_templates/*', jobTemplate);
    });

    cy.intercept({ method: 'GET', url: '/api/v2/inventories/*/' }, { fixture: 'inventories.json' });

    cy.mount(
      <WorkflowVisualizerNodeDetails
        resource={
          {
            summary_fields: {
              unified_job_template: { unified_job_type: 'workflow_job', id: 7 },
            },
          } as WorkflowNode
        }
      />
    );

    cy.get('dd[data-cy="name"]').within(() => {
      cy.get('a').should('have.text', 'E2E 6GDe');
      cy.get('a').should('have.attr', 'href');
    });
  });
  it('Should render project details', () => {
    cy.intercept({ method: 'GET', url: '/api/v2/projects/*/' }, { fixture: 'project.json' });
    cy.mount(
      <WorkflowVisualizerNodeDetails
        resource={
          {
            summary_fields: {
              unified_job_template: { unified_job_type: 'project_update', id: 7 },
            },
          } as WorkflowNode
        }
      />
    );
    cy.get('dd[data-cy="name"]').within(() => {
      cy.get('a').should('have.text', 'Demo Project @ 10:44:51');
      cy.get('a').should('have.attr', 'href');
    });
  });
  it('Should render inventory source details', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/inventory_sources/*/' },
      { fixture: 'inventory_source.json' }
    );
    cy.mount(
      <WorkflowVisualizerNodeDetails
        resource={
          {
            summary_fields: {
              unified_job_template: { unified_job_type: 'inventory_update', id: 7 },
            },
          } as WorkflowNode
        }
      />
    );
    cy.get('dd[data-cy="name"]').within(() => {
      cy.get('a').should('have.text', 'Demo Inventory Source');
      cy.get('a').should('have.attr', 'href');
    });
  });

  it('Should render system job details', () => {
    cy.mount(
      <WorkflowVisualizerNodeDetails
        resource={
          {
            all_parents_must_converge: false,
            summary_fields: {
              unified_job_template: {
                unified_job_type: 'system_job',
                description: 'This is a description',
                id: 7,
                name: 'System job',
              },
            },
          } as WorkflowNode
        }
      />
    );
    cy.get('dd[data-cy="name"]').should('have.text', 'System job');
  });
  it('Should render workflow approval details', () => {
    cy.mount(
      <WorkflowVisualizerNodeDetails
        resource={
          {
            all_parents_must_converge: false,
            summary_fields: {
              unified_job_template: {
                unified_job_type: 'workflow_approval',
                description: 'This is a description',
                id: 7,
                name: 'Workflow approval',
              },
            },
          } as WorkflowNode
        }
      />
    );
    cy.get('dd[data-cy="name"]').should('have.text', 'Workflow approval');
  });
});
