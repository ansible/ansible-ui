import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import job from '@ansible/cypress/fixtures/job.json';
import jobWorkflowNodes from '@ansible/cypress/fixtures/job_workflow_nodes.json';
import workflowNodes from '@ansible/cypress/fixtures/workflow_nodes.json';
import type { Job } from '../../../interfaces/Job';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { HostStatusBar, WorkflowNodesStatusBar } from './StatusBar';

describe('HostStatusBar and WorkflowNodesStatusBar (StatusBar)', () => {
  before(() => {
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/workflow_jobs/126/*`,
        hostname: 'localhost',
      },
      {
        fixture: 'workflow_job.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/workflow_jobs/*/workflow_nodes/*`,
        hostname: 'localhost',
      },
      {
        fixture: 'job_workflow_nodes.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/workflow_jobs/*/workflow_nodes/*`,
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
    cy.contains('Success 25%');
    cy.contains('Canceled 25%');
    cy.contains('Error 50%');

    cy.mount(<WorkflowNodesStatusBar nodes={workflowNodes.results as unknown as WorkflowNode[]} />);

    cy.contains('Failed 20%');
    cy.contains('Success 80%');
  });
});
