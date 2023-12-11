import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowNode, UnifiedJobType } from '../../../interfaces/WorkflowNode';
import { WorkflowVisualizerNodeDetails } from './WorkflowVisualizerNodeDetails';
import { ControllerContext, Controller } from '@patternfly/react-topology';
import { SummaryFieldUnifiedJobTemplate } from '../../../interfaces/summary-fields/summary-fields';

describe('WorkflowVisualizerNodeDetails', () => {
  const mockNode = (unifiedJobTemplate?: Partial<SummaryFieldUnifiedJobTemplate>) =>
    ({
      summary_fields: {
        unified_job_template: {
          id: 7,
          unified_job_type: undefined,
          ...unifiedJobTemplate,
        },
      },
    }) as WorkflowNode;
  const mockContext = {
    getState: () => ({
      workflowTemplate: { summary_fields: { user_capabilities: { edit: true } } },
    }),
  } as Controller;

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
      <ControllerContext.Provider value={mockContext}>
        <WorkflowVisualizerNodeDetails
          resource={mockNode({ unified_job_type: UnifiedJobType.job })}
        />
      </ControllerContext.Provider>
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
      <ControllerContext.Provider value={mockContext}>
        <WorkflowVisualizerNodeDetails
          resource={mockNode({ unified_job_type: UnifiedJobType.workflow_job })}
        />
      </ControllerContext.Provider>
    );

    cy.get('dd[data-cy="name"]').within(() => {
      cy.get('a').should('have.text', 'E2E 6GDe');
      cy.get('a').should('have.attr', 'href');
    });
  });
  it('Should render project details', () => {
    cy.intercept({ method: 'GET', url: '/api/v2/projects/*/' }, { fixture: 'project.json' });
    cy.mount(
      <ControllerContext.Provider value={mockContext}>
        <WorkflowVisualizerNodeDetails
          resource={mockNode({ unified_job_type: UnifiedJobType.project_update })}
        />
      </ControllerContext.Provider>
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
      <ControllerContext.Provider value={mockContext}>
        <WorkflowVisualizerNodeDetails
          resource={mockNode({ unified_job_type: UnifiedJobType.inventory_update })}
        />
      </ControllerContext.Provider>
    );
    cy.get('dd[data-cy="name"]').within(() => {
      cy.get('a').should('have.text', 'Demo Inventory Source');
      cy.get('a').should('have.attr', 'href');
    });
  });

  it('Should render system job details', () => {
    cy.mount(
      <ControllerContext.Provider value={mockContext}>
        <WorkflowVisualizerNodeDetails
          resource={mockNode({ unified_job_type: UnifiedJobType.system_job, name: 'System job' })}
        />
      </ControllerContext.Provider>
    );
    cy.get('dd[data-cy="name"]').should('have.text', 'System job');
  });
  it('Should render workflow approval details', () => {
    cy.mount(
      <ControllerContext.Provider value={mockContext}>
        <WorkflowVisualizerNodeDetails
          resource={mockNode({
            unified_job_type: UnifiedJobType.workflow_approval,
            name: 'Workflow approval',
          })}
        />
      </ControllerContext.Provider>
    );
    cy.get('dd[data-cy="name"]').should('have.text', 'Workflow approval');
  });

  it('Should show action buttons when user can edit workflow', () => {
    const readOnlyContext = {
      getState: () => ({
        workflowTemplate: { summary_fields: { user_capabilities: { edit: true } } },
      }),
    } as Controller;

    cy.mount(
      <ControllerContext.Provider value={readOnlyContext}>
        <WorkflowVisualizerNodeDetails resource={mockNode()} />
      </ControllerContext.Provider>
    );
    cy.get('button[data-cy="edit-node"]').should('be.visible');
    cy.get('button[data-cy="remove-node"]').should('be.visible');
  });

  it('Should hide action buttons when user cannot edit workflow', () => {
    const readOnlyContext = {
      getState: () => ({
        workflowTemplate: { summary_fields: { user_capabilities: { edit: false } } },
      }),
    } as Controller;

    cy.mount(
      <ControllerContext.Provider value={readOnlyContext}>
        <WorkflowVisualizerNodeDetails resource={mockNode()} />
      </ControllerContext.Provider>
    );
    cy.get('button[data-cy="edit-node"]').should('not.exist');
    cy.get('button[data-cy="remove-node"]').should('not.exist');
  });
});
