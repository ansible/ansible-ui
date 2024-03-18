import { WorkflowNodesStatusBar, HostStatusBar } from './StatusBar';
import job from '../../../../../cypress/fixtures/job.json';
import jobWorkflowNodes from '../../../../../cypress/fixtures/job_workflow_nodes.json';
import workflowNodes from '../../../../../cypress/fixtures/workflow_nodes.json';
import type { Job } from '../../../interfaces/Job';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';

describe('HostStatusBar and WorkflowNodesStatusBar (StatusBar)', () => {
  before(() => {
    cy.intercept(
      {
        method: 'GET',
        url: `/api/v2/workflow_jobs/126/*`,
        hostname: 'localhost',
      },
      {
        fixture: 'workflow_job.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: `/api/v2/workflow_jobs/*/workflow_nodes/*`,
        hostname: 'localhost',
      },
      {
        fixture: 'job_workflow_nodes.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: `/api/v2/workflow_jobs/*/workflow_nodes/*`,
        hostname: 'localhost',
      },
      {
        fixture: 'workflow_nodes.json',
      }
    );
  });
  it('HostStatusBar should display host status', () => {
    cy.mount(<HostStatusBar counts={(job as unknown as Job).host_status_counts} />);
    cy.contains('Success 100%');
  });
  it('WorkflowNodesStatusBar should display status segments', () => {
    cy.mount(
      <WorkflowNodesStatusBar nodes={jobWorkflowNodes.results as unknown as WorkflowNode[]} />
    );
    cy.contains('Success 13%');
    cy.contains('Canceled 13%');
    cy.contains('Error 25%');
    cy.contains('Unreachable 50%');

    cy.mount(<WorkflowNodesStatusBar nodes={workflowNodes.results as unknown as WorkflowNode[]} />);

    cy.contains('Failed 17%');
    cy.contains('Unreachable 17%');
    cy.contains('Success 67%');
  });
  it('WorkflowNodesStatusBar should NOT fail on unexpected value', () => {
    const wfNode = workflowNodes.results[0];
    const updatedWFNode = {
      ...wfNode,
      summary_fields: {
        ...wfNode.summary_fields,
        job: {
          ...wfNode.summary_fields.job,
          status: 'unexpected_status',
        },
      },
    };

    cy.mount(<WorkflowNodesStatusBar nodes={[updatedWFNode] as unknown as WorkflowNode[]} />);

    cy.contains('Unreachable 100%');
  });
});
