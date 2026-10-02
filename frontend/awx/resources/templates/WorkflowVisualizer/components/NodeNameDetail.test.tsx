import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@patternfly/react-topology', () => ({
  observer: (component: unknown) => component,
  useVisualizationController: vi.fn(),
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn(() => ({ data: undefined })),
  useGetItem: vi.fn(() => ({ data: undefined })),
}));

import { useGet } from '@ansible/common-ui/crud/useGet';
import type { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { NodeNameDetail } from './NodeNameDetail';

function makeNode(overrides: Record<string, unknown> = {}): WorkflowNode {
  return {
    id: 1,
    summary_fields: {
      unified_job_template: {
        id: 10,
        name: 'My Template',
        unified_job_type: 'job',
        ...overrides,
      },
    },
  } as unknown as WorkflowNode;
}

function renderComponent(node: WorkflowNode) {
  return render(
    <MemoryRouter>
      <NodeNameDetail nodeData={node} />
    </MemoryRouter>
  );
}

describe('NodeNameDetail', () => {
  it('should render the name label', () => {
    renderComponent(makeNode());
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should render a link for job type nodes', () => {
    renderComponent(makeNode({ unified_job_type: 'job' }));
    expect(screen.getByRole('link', { name: 'My Template' })).toBeInTheDocument();
  });

  it('should render a link for project_update type nodes', () => {
    renderComponent(makeNode({ unified_job_type: 'project_update', name: 'My Project' }));
    expect(screen.getByRole('link', { name: 'My Project' })).toBeInTheDocument();
  });

  it('should render a link for workflow_job type nodes', () => {
    renderComponent(makeNode({ unified_job_type: 'workflow_job', name: 'My WF' }));
    expect(screen.getByRole('link', { name: 'My WF' })).toBeInTheDocument();
  });

  it('should render plain text for workflow_approval nodes', () => {
    renderComponent(makeNode({ unified_job_type: 'workflow_approval', name: 'Approve Me' }));
    expect(screen.getByText('Approve Me')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Approve Me' })).not.toBeInTheDocument();
  });

  it('should render plain text for system_job nodes', () => {
    renderComponent(makeNode({ unified_job_type: 'system_job', name: 'Cleanup' }));
    expect(screen.getByText('Cleanup')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Cleanup' })).not.toBeInTheDocument();
  });

  it('should render inventory source link with fetched data', () => {
    vi.mocked(useGet).mockReturnValue({
      data: {
        id: 5,
        inventory: 3,
        summary_fields: { inventory: { kind: 'smart' } },
      },
      error: undefined,
      refresh: vi.fn(),
      isLoading: false,
    });

    renderComponent(makeNode({ unified_job_type: 'inventory_update', name: 'Inv Source' }));
    expect(screen.getByRole('link', { name: 'Inv Source' })).toBeInTheDocument();
  });

  it('should render inventory source link with default inventory type when kind is missing', () => {
    vi.mocked(useGet).mockReturnValue({
      data: {
        id: 5,
        inventory: 3,
        summary_fields: { inventory: {} },
      },
      error: undefined,
      refresh: vi.fn(),
      isLoading: false,
    });

    renderComponent(makeNode({ unified_job_type: 'inventory_update', name: 'Source' }));
    expect(screen.getByRole('link', { name: 'Source' })).toBeInTheDocument();
  });
});
