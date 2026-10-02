import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { START_NODE_ID } from '../../../resources/templates/WorkflowVisualizer/constants';
import { testFixture as jobFixture } from '../jobDetails.fixture';

const mockFromModel = vi.fn();

vi.mock('../../../common/useAwxGetAllPages', () => ({
  useAwxGetAllPages: vi.fn(() => ({ results: [] })),
}));

vi.mock('@patternfly/react-topology', () => ({
  ComponentFactory: vi.fn(),
  DagreLayout: vi.fn(),
  DefaultGroup: () => null,
  EdgeModel: {},
  EdgeTerminalType: { directional: 'direction' },
  Graph: vi.fn(),
  GraphComponent: () => null,
  LabelPosition: { bottom: 'bottom' },
  Model: {},
  ModelKind: { graph: 'graph', node: 'node', edge: 'edge' },
  NodeShape: { circle: 'circle' },
  NodeStatus: { default: 'default', danger: 'danger', success: 'success', info: 'info' },
  Visualization: vi.fn().mockImplementation(function () {
    return {
      setFitToScreenOnLayout: vi.fn(),
      registerComponentFactory: vi.fn(),
      registerLayoutFactory: vi.fn(),
      fromModel: mockFromModel,
    };
  }),
  VisualizationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  withPanZoom: (c: unknown) => c,
  withSelection: (c: unknown) => c,
  action: (fn: () => void) => fn,
  createTopologyControlButtons: vi.fn(() => []),
  defaultControlButtonsOptions: {},
  TopologyView: () => null,
  TopologyControlBar: () => null,
  useVisualizationController: vi.fn(() => ({
    getGraph: () => ({ scaleBy: vi.fn(), fit: vi.fn(), reset: vi.fn(), layout: vi.fn() }),
    toModel: () => ({ nodes: [], edges: [] }),
    getNodeById: vi.fn(() => null),
  })),
  VisualizationSurface: () => null,
  observer: (component: unknown) => component,
  TopologySideBar: () => null,
}));

vi.mock('./WorkflowOutputGraph', () => ({
  WorkflowOutputGraph: (props: {
    job?: unknown;
    reloadJob: () => void;
    refreshNodeStatus: () => void;
  }) => (
    <div
      data-testid="workflow-output-graph"
      data-job-id={props.job ? String((props.job as { id: number }).id) : undefined}
      data-reload-job={typeof props.reloadJob === 'function' ? 'defined' : undefined}
      data-refresh-node-status={
        typeof props.refreshNodeStatus === 'function' ? 'defined' : undefined
      }
    />
  ),
}));

vi.mock('./WorkflowOutputNode', () => ({
  WorkflowOutputNode: () => null,
}));

import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';
import { WorkflowOutput, graphModel, greyBadgeLabel } from './WorkflowOutput';

interface TopologyNode {
  id: string;
  type: string;
  label?: string;
  status?: string;
  data?: { badge?: string; badgeColor?: string };
}

const workflowNodeFixture: WorkflowNode = {
  id: 100,
  type: 'workflow_job_node',
  url: '/api/v2/workflow_job_nodes/100/',
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
      description: '',
      elapsed: 30,
      failed: false,
      id: 1,
      name: 'Job A',
      status: 'successful',
      type: 'job',
    },
    workflow_job: { id: 126, name: 'WF', description: '' },
    workflow_job_template: { id: 63, name: 'WF Template', description: '' },
    unified_job_template: {
      id: 7,
      name: 'Demo Job',
      description: '',
      unified_job_type: 'job',
    },
    inventory: {} as WorkflowNode['summary_fields']['inventory'],
    execution_environment: {} as WorkflowNode['summary_fields']['execution_environment'],
  },
  created: '',
  modified: '',
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
  workflow_job_template: 63,
  unified_job_template: 7,
  success_nodes: [101],
  failure_nodes: [],
  always_nodes: [],
  all_parents_must_converge: false,
  identifier: 'abc-123',
};

describe('WorkflowOutput', () => {
  beforeEach(() => {
    vi.mocked(useAwxGetAllPages).mockReturnValue({
      results: [],
      error: undefined,
      isLoading: false,
      refresh: vi.fn(),
    });
    mockFromModel.mockClear();
  });

  it('should render workflow output with topology graph placeholder', () => {
    render(
      <MemoryRouter>
        <WorkflowOutput job={jobFixture} reloadJob={vi.fn()} refreshNodeStatus={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('workflow-output-graph')).toBeInTheDocument();
  });

  it('should pass job, reloadJob, and refreshNodeStatus to WorkflowOutputGraph', () => {
    const reloadJob = vi.fn();
    const refreshNodeStatus = vi.fn();

    render(
      <MemoryRouter>
        <WorkflowOutput
          job={jobFixture}
          reloadJob={reloadJob}
          refreshNodeStatus={refreshNodeStatus}
        />
      </MemoryRouter>
    );

    const graph = screen.getByTestId('workflow-output-graph');
    expect(graph).toHaveAttribute('data-job-id', String(jobFixture.id));
    expect(graph).toHaveAttribute('data-reload-job', 'defined');
    expect(graph).toHaveAttribute('data-refresh-node-status', 'defined');
  });

  it('should call fromModel with graphModel when workflow nodes are empty', () => {
    render(
      <MemoryRouter>
        <WorkflowOutput job={jobFixture} reloadJob={vi.fn()} refreshNodeStatus={vi.fn()} />
      </MemoryRouter>
    );

    expect(mockFromModel).toHaveBeenCalledWith(graphModel, false);
  });

  it('should call fromModel with nodes and edges when workflow nodes exist', () => {
    vi.mocked(useAwxGetAllPages).mockReturnValue({
      results: [workflowNodeFixture],
      error: undefined,
      isLoading: false,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <WorkflowOutput job={jobFixture} reloadJob={vi.fn()} refreshNodeStatus={vi.fn()} />
      </MemoryRouter>
    );

    expect(mockFromModel).toHaveBeenCalledTimes(2);
    const modelCall = mockFromModel.mock.calls[1][0] as {
      nodes: TopologyNode[];
      edges: unknown[];
      graph?: { visible?: boolean };
    };
    expect(modelCall.nodes).toBeDefined();
    expect(modelCall.edges).toBeDefined();
    expect(modelCall.graph).toBeDefined();
    expect(modelCall.graph?.visible).toBe(true);

    const startNode = modelCall.nodes.find((n) => n.id === START_NODE_ID);
    expect(startNode).toBeDefined();
    expect(startNode?.type).toBe(START_NODE_ID);

    const workflowNode = modelCall.nodes.find((n) => n.id === '100');
    expect(workflowNode).toBeDefined();
    expect(workflowNode?.type).toBe('successful-node');
    expect(workflowNode?.label).toBe('abc-123');
    expect(workflowNode?.status).toBe('successful');
  });

  it('should apply greyBadgeLabel when all_parents_must_converge is true', () => {
    const convergeNode: WorkflowNode = {
      ...workflowNodeFixture,
      id: 102,
      all_parents_must_converge: true,
    };
    vi.mocked(useAwxGetAllPages).mockReturnValue({
      results: [convergeNode],
      error: undefined,
      isLoading: false,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <WorkflowOutput job={jobFixture} reloadJob={vi.fn()} refreshNodeStatus={vi.fn()} />
      </MemoryRouter>
    );

    const modelCall = mockFromModel.mock.calls[1][0] as { nodes: TopologyNode[] };
    const convergeNodeModel = modelCall.nodes.find((n) => n.id === '102');
    expect(convergeNodeModel?.data?.badge).toBe('ALL');
    expect(convergeNodeModel?.data?.badgeColor).toBe(greyBadgeLabel.badgeColor);
  });

  it('should map node status to node type for failed nodes', () => {
    const job = workflowNodeFixture.summary_fields?.job ?? {
      description: '',
      elapsed: 0,
      failed: false,
      id: 0,
      name: '',
      status: 'successful',
      type: 'job',
    };
    const failedNode: WorkflowNode = {
      ...workflowNodeFixture,
      id: 103,
      summary_fields: {
        ...workflowNodeFixture.summary_fields,
        job: { ...job, status: 'failed', failed: true },
      },
    };
    vi.mocked(useAwxGetAllPages).mockReturnValue({
      results: [failedNode],
      error: undefined,
      isLoading: false,
      refresh: vi.fn(),
    });

    render(
      <MemoryRouter>
        <WorkflowOutput job={jobFixture} reloadJob={vi.fn()} refreshNodeStatus={vi.fn()} />
      </MemoryRouter>
    );

    const modelCall = mockFromModel.mock.calls[1][0] as { nodes: TopologyNode[] };
    const failedNodeModel = modelCall.nodes.find((n) => n.id === '103');
    expect(failedNodeModel?.type).toBe('failed-node');
    expect(failedNodeModel?.status).toBe('failed');
  });
});
