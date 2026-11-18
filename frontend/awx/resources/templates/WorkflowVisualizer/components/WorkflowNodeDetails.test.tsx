import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkflowNodeDetails } from './WorkflowNodeDetails';
import type { GraphNode } from '../types';
import { useGet } from '@ansible/common-ui/crud/useGet';

vi.mock('@patternfly/react-topology', () => ({
  useVisualizationController: () => ({
    getState: () => ({ RBAC: { edit: true } }),
  }),
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
}));

vi.mock('../ViewOptionsProvider', () => ({
  useViewOptions: () => ({ setSidebarMode: vi.fn(), removeNodes: vi.fn() }),
}));

vi.mock('../hooks', () => ({
  useCloseSidebar: () => vi.fn(),
  useGetNodeTypeDetail: () => 'Job template',
  useGetTimeoutString: () => '30 minutes',
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn(),
}));

vi.mock('./JobTemplateDetails', () => ({
  JobTemplateDetails: () => <div data-testid="job-template-details">Job template details</div>,
}));

vi.mock('./WorkflowJobTemplateDetails', () => ({
  WorkflowJobTemplateDetails: () => (
    <div data-testid="workflow-job-template-details">Workflow job template details</div>
  ),
}));

vi.mock('./SidebarHeader', () => ({
  SidebarHeader: () => <div data-testid="sidebar-header" />,
}));

function makeNode(unifiedJobType: string): GraphNode {
  return {
    getLabel: () => 'Node 1',
    getData: () => ({
      resource: {
        summary_fields: {
          unified_job_template: {
            id: 1,
            unified_job_type: unifiedJobType,
            timeout: 30,
          },
        },
      },
    }),
  } as unknown as GraphNode;
}

describe('WorkflowNodeDetails', () => {
  beforeEach(() => {
    vi.mocked(useGet).mockReturnValue({
      data: {
        id: 1,
        type: 'job_template',
        name: 'Demo template',
      },
      error: undefined,
      refresh: vi.fn(),
      isLoading: false,
    });
  });

  it('renders job template details for job nodes', () => {
    render(
      <MemoryRouter>
        <WorkflowNodeDetails node={makeNode('job')} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('job-template-details')).toBeInTheDocument();
  });

  it('renders workflow job template details for workflow job nodes', () => {
    vi.mocked(useGet).mockReturnValue({
      data: {
        id: 2,
        type: 'workflow_job_template',
        name: 'Workflow template',
      },
      error: undefined,
      refresh: vi.fn(),
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <WorkflowNodeDetails node={makeNode('workflow_job')} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('workflow-job-template-details')).toBeInTheDocument();
  });
});
