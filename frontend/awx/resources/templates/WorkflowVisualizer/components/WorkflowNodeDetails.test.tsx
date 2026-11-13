import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { WorkflowNodeDetails } from './WorkflowNodeDetails';
import type { GraphNode } from '../types';

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
  useGet: () => ({
    data: {
      id: 1,
      type: 'job_template',
      name: 'Demo template',
    },
  }),
}));

vi.mock('./JobTemplateDetails', () => ({
  JobTemplateDetails: () => <div data-testid="job-template-details">Job template details</div>,
}));

vi.mock('./SidebarHeader', () => ({
  SidebarHeader: () => <div data-testid="sidebar-header" />,
}));

function makeNode(): GraphNode {
  return {
    getLabel: () => 'Node 1',
    getData: () => ({
      resource: {
        summary_fields: {
          unified_job_template: {
            id: 1,
            unified_job_type: 'job',
            timeout: 30,
          },
        },
      },
    }),
  } as unknown as GraphNode;
}

describe('WorkflowNodeDetails', () => {
  it('renders job template details for job nodes', () => {
    render(
      <MemoryRouter>
        <WorkflowNodeDetails node={makeNode()} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('job-template-details')).toBeInTheDocument();
  });
});
