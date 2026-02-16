import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { Legend } from './components/Legend';
import { RESOURCE_TYPE } from './constants';
import { getConvergenceType, getNodeLabel } from './wizard/helpers';
import { WorkflowVisualizer } from './WorkflowVisualizer';

vi.mock('./WorkflowTopology', () => ({ WorkflowTopology: vi.fn(() => null) }));

const mockWorkflowNodes: WorkflowNode[] = [{ id: 1 } as WorkflowNode];
const mockTemplate: WorkflowJobTemplate = { id: 1, name: 'Test Template' } as WorkflowJobTemplate;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: vi.fn(() => ({ id: '123' })) };
});

vi.mock('../../../common/useAwxGetAllPages', () => ({
  useAwxGetAllPages: vi.fn(),
}));

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetItem: vi.fn(),
}));

import { WorkflowTopology } from './WorkflowTopology';
import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';
import { useGetItem } from '@ansible/common-ui/crud/useGet';

describe('WorkflowVisualizer', () => {
  beforeEach(() => {
    vi.mocked(useAwxGetAllPages).mockReturnValue({
      results: mockWorkflowNodes,
      error: null,
      isLoading: false,
      refresh: vi.fn(),
    } as never);
    vi.mocked(useGetItem).mockReturnValue({
      data: mockTemplate,
      error: null,
      refresh: vi.fn(),
      isLoading: false,
    } as never);
    vi.mocked(WorkflowTopology).mockClear();
  });

  it('should render loading state when workflow nodes are loading', () => {
    vi.mocked(useAwxGetAllPages).mockReturnValue({
      results: undefined,
      error: null,
      isLoading: true,
      refresh: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <WorkflowVisualizer />
      </MemoryRouter>
    );

    expect(
      screen.getByText('Please wait until the Workflow Visualizer is populated.')
    ).toBeInTheDocument();
    expect(vi.mocked(WorkflowTopology)).not.toHaveBeenCalled();
  });

  it('should render loading state when workflow template is loading', () => {
    vi.mocked(useGetItem).mockReturnValue({
      data: undefined,
      error: null,
      refresh: vi.fn(),
      isLoading: true,
    } as never);

    render(
      <MemoryRouter>
        <WorkflowVisualizer />
      </MemoryRouter>
    );

    expect(
      screen.getByText('Please wait until the Workflow Visualizer is populated.')
    ).toBeInTheDocument();
    expect(vi.mocked(WorkflowTopology)).not.toHaveBeenCalled();
  });

  it('should render error state when workflow nodes API fails', () => {
    const error = new Error('Failed to load nodes');
    vi.mocked(useAwxGetAllPages).mockReturnValue({
      results: undefined,
      error,
      isLoading: false,
      refresh: vi.fn(),
    } as never);

    render(
      <MemoryRouter>
        <WorkflowVisualizer />
      </MemoryRouter>
    );

    expect(screen.getByText('Failed to load nodes')).toBeInTheDocument();
    expect(vi.mocked(WorkflowTopology)).not.toHaveBeenCalled();
  });

  it('should render error state when workflow template API fails', () => {
    const error = new Error('Failed to load template');
    vi.mocked(useGetItem).mockReturnValue({
      data: undefined,
      error,
      refresh: vi.fn(),
      isLoading: false,
    } as never);

    render(
      <MemoryRouter>
        <WorkflowVisualizer />
      </MemoryRouter>
    );

    expect(screen.getByText('Failed to load template')).toBeInTheDocument();
    expect(vi.mocked(WorkflowTopology)).not.toHaveBeenCalled();
  });

  it('should render WorkflowTopology with workflow nodes and template when data is loaded', () => {
    render(
      <MemoryRouter>
        <WorkflowVisualizer />
      </MemoryRouter>
    );

    expect(vi.mocked(WorkflowTopology)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(WorkflowTopology)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          workflowNodes: mockWorkflowNodes,
          template: mockTemplate,
        },
      }),
      expect.anything()
    );
  });
});

describe('constants', () => {
  it('should have RESOURCE_TYPE mapping for all UnifiedJobType values', () => {
    expect(RESOURCE_TYPE.job).toBe('job');
    expect(RESOURCE_TYPE.workflow_job).toBe('workflow_job');
    expect(RESOURCE_TYPE.project_update).toBe('project_update');
    expect(RESOURCE_TYPE.workflow_approval).toBe('workflow_approval');
    expect(RESOURCE_TYPE.inventory_update).toBe('inventory_update');
    expect(RESOURCE_TYPE.system_job).toBe('system_job');
  });
});

describe('wizard helpers', () => {
  describe('getNodeLabel', () => {
    it('should return alias when alias is not UUID and not empty', () => {
      expect(getNodeLabel('Template Name', 'My Alias')).toBe('My Alias');
    });

    it('should return name when alias is empty', () => {
      expect(getNodeLabel('Template Name', '')).toBe('Template Name');
    });

    it('should return name when alias is UUID', () => {
      expect(getNodeLabel('Template Name', '550e8400-e29b-41d4-a716-446655440000')).toBe(
        'Template Name'
      );
    });
  });

  describe('getConvergenceType', () => {
    it('should return any when convergence is undefined', () => {
      expect(getConvergenceType(undefined)).toBe('any');
    });

    it('should return any when convergence is null', () => {
      expect(getConvergenceType(null)).toBe('any');
    });

    it('should return all when convergence is true', () => {
      expect(getConvergenceType(true)).toBe('all');
    });

    it('should return any when convergence is false', () => {
      expect(getConvergenceType(false)).toBe('any');
    });
  });
});

describe('Legend', () => {
  it('should render legend with node types, node status types, and run status types', () => {
    render(
      <MemoryRouter>
        <Legend />
      </MemoryRouter>
    );

    expect(screen.getByTestId('workflow-visualizer-legend')).toBeInTheDocument();
    expect(screen.getByTestId('legend-node-types')).toBeInTheDocument();
    expect(screen.getByTestId('legend-node-status-types')).toBeInTheDocument();
    expect(screen.getByTestId('legend-run-status-types')).toBeInTheDocument();
  });

  it('should display Job Template, Workflow Template, and Approval Node in node types', () => {
    render(
      <MemoryRouter>
        <Legend />
      </MemoryRouter>
    );

    expect(screen.getByText('Job Template')).toBeInTheDocument();
    expect(screen.getByText('Workflow Template')).toBeInTheDocument();
    expect(screen.getByText('Approval Node')).toBeInTheDocument();
  });

  it('should display Run on success, Run on fail, Run always in run status types', () => {
    render(
      <MemoryRouter>
        <Legend />
      </MemoryRouter>
    );

    expect(screen.getByText('Run on success')).toBeInTheDocument();
    expect(screen.getByText('Run on fail')).toBeInTheDocument();
    expect(screen.getByText('Run always')).toBeInTheDocument();
  });
});
