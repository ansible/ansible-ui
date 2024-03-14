import { WorkflowNodesStatusBar, HostStatusBar } from './StatusBar';
import job from '../../../../../cypress/fixtures/job.json';
import jobWorkflowNodes from '../../../../../cypress/fixtures/job_workflow_nodes.json';
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
    cy.contains('Failed 25%');
    cy.contains('Unreachable 50%');
  });
});
