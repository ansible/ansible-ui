import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { WorkflowJobNode } from '../../interfaces/WorkflowNode';
import { WorkflowOutputNavigation } from './WorkflowOutputNavigation';

vi.mock('./WorkflowOutput/WorkflowOutputNode', () => ({
  jobPaths: {
    project_update: 'project',
    inventory_update: 'inventory',
    job: 'playbook',
    ad_hoc_command: 'command',
    system_job: 'management',
    workflow_job: 'workflow',
  },
}));

const createWorkflowNode = (overrides: Partial<WorkflowJobNode> = {}): WorkflowJobNode =>
  ({
    id: 1,
    type: 'workflow_job_node',
    url: '/api/v2/workflow_job_nodes/1/',
    identifier: 'node-1',
    job: '100',
    success_nodes: [],
    failure_nodes: [],
    always_nodes: [],
    all_parents_must_converge: false,
    workflow_job_template: 1,
    unified_job_template: 1,
    created: '2024-01-01T00:00:00Z',
    modified: '2024-01-01T00:00:00Z',
    extra_data: {},
    inventory: null,
    scm_branch: null,
    job_type: null,
    job_tags: null,
    skip_tags: null,
    limit: null,
    diff_mode: null,
    verbosity: null,
    execution_environment: null,
    forks: null,
    job_slice_count: null,
    timeout: null,
    related: {
      labels: '',
      credentials: '',
      instance_groups: '',
      create_approval_template: '',
      success_nodes: '',
      failure_nodes: '',
      always_nodes: '',
      unified_job_template: '',
      workflow_job_template: '',
    },
    summary_fields: {
      job: {
        id: 100,
        name: 'Demo Job',
        type: 'job',
        status: 'successful',
        description: '',
        elapsed: 60,
        failed: false,
      },
      workflow_job: { id: 1, name: 'Workflow', description: '' },
      workflow_job_template: { id: 1, name: 'Workflow', description: '' },
      unified_job_template: {
        id: 7,
        name: 'Demo Job Template',
        description: '',
        unified_job_type: 'job',
      },
      inventory: {} as WorkflowJobNode['summary_fields']['inventory'],
      execution_environment: {} as WorkflowJobNode['summary_fields']['execution_environment'],
    },
    ...overrides,
  }) as WorkflowJobNode;

describe('WorkflowOutputNavigation', () => {
  const successfulNode = createWorkflowNode({
    id: 1,
    identifier: 'successful-node',
    job: '100',
    summary_fields: {
      ...createWorkflowNode().summary_fields,
      job: {
        id: 100,
        name: 'Successful Job',
        type: 'job',
        status: 'successful',
        description: '',
        elapsed: 60,
        failed: false,
      },
    },
  });

  const failedNode = createWorkflowNode({
    id: 2,
    identifier: 'failed-node',
    job: '101',
    summary_fields: {
      ...createWorkflowNode().summary_fields,
      job: {
        id: 101,
        name: 'Failed Job',
        type: 'job',
        status: 'failed',
        description: '',
        elapsed: 10,
        failed: true,
      },
    },
  });

  const renderWithRouter = (workflowNodes: WorkflowJobNode[]) =>
    render(
      <MemoryRouter initialEntries={['/jobs/playbook/999/output']}>
        <Routes>
          <Route
            path="/jobs/:job_type/:id/*"
            element={<WorkflowOutputNavigation workflowNodes={workflowNodes} />}
          />
        </Routes>
      </MemoryRouter>
    );

  it('should render workflow navigation with dropdown', () => {
    renderWithRouter([successfulNode]);

    expect(screen.getByText(/Workflow Job 1\/1/)).toBeInTheDocument();
  });

  it('should display workflow statuses and nodes when opened', async () => {
    const user = userEvent.setup();
    renderWithRouter([successfulNode, failedNode]);

    const toggle = screen.getByRole('button', { name: /Workflow Job 1\/2/ });
    await user.click(toggle);

    expect(screen.getByText('Workflow statuses')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Successful')).toBeInTheDocument();
    expect(screen.getByText('Workflow nodes')).toBeInTheDocument();
  });

  it('should filter nodes by failed status when Failed is selected', async () => {
    const user = userEvent.setup();
    renderWithRouter([successfulNode, failedNode]);

    await user.click(screen.getByRole('button', { name: /Workflow Job 1\/2/ }));
    await user.click(screen.getByText('Failed'));
    await user.click(document.body);
    await user.click(screen.getByRole('button', { name: /Workflow Job 1\/2/ }));

    expect(screen.getByText('failed-node')).toBeInTheDocument();
    expect(screen.queryByText('successful-node')).not.toBeInTheDocument();
  });

  it('should filter nodes by successful status when Successful is selected', async () => {
    const user = userEvent.setup();
    renderWithRouter([successfulNode, failedNode]);

    await user.click(screen.getByRole('button', { name: /Workflow Job 1\/2/ }));
    await user.click(screen.getByText('Successful'));
    await user.click(document.body);
    await user.click(screen.getByRole('button', { name: /Workflow Job 1\/2/ }));

    expect(screen.getByText('successful-node')).toBeInTheDocument();
    expect(screen.queryByText('failed-node')).not.toBeInTheDocument();
  });

  it('should show all nodes when no status filter is applied', async () => {
    const user = userEvent.setup();
    renderWithRouter([successfulNode, failedNode]);

    await user.click(screen.getByRole('button', { name: /Workflow Job 1\/2/ }));

    expect(screen.getByText('successful-node')).toBeInTheDocument();
    expect(screen.getByText('failed-node')).toBeInTheDocument();
  });

  it('should render with empty workflow nodes', () => {
    renderWithRouter([]);

    expect(screen.getByText(/Workflow Job 1\/0/)).toBeInTheDocument();
  });
});
