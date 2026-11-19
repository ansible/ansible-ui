import { SwrTestWrapper } from '@ansible/ansible-ui-framework/test-utils/swrTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { testFixture as jobFixture } from '../jobDetails.fixture';
import type { WebSocketMessage } from './hooks/useWorkflowOutput';
import { WorkflowOutputGraph } from './WorkflowOutputGraph';

const mockSetNodeStatus = vi.fn();
const mockSetData = vi.fn();
const mockRefreshNodeStatus = vi.fn();
const mockReloadJob = vi.fn();
const toggleLegend = vi.fn();
const graphApi = {
  scaleBy: vi.fn(),
  fit: vi.fn(),
  reset: vi.fn(),
  layout: vi.fn(),
};
let workflowMessage: WebSocketMessage | undefined;
let legendOpen = false;
let modelNodes: { id: string }[] = [{ id: '100' }];
let activeNode: typeof mockNode | undefined;
let controlOptions: {
  zoomInCallback?: () => void;
  zoomOutCallback?: () => void;
  fitToScreenCallback?: () => void;
  resetViewCallback?: () => void;
  legendCallback?: () => void;
} = {};

const mockNode = {
  setData: mockSetData,
  setNodeStatus: mockSetNodeStatus,
  getData: () => ({
    resource: {
      summary_fields: {
        job: { id: jobFixture.id, type: 'job', elapsed: 0 },
      },
    },
  }),
};
activeNode = mockNode;

vi.mock('./hooks/useWorkflowOutput', () => ({
  useWorkflowOutput: () => workflowMessage,
}));

vi.mock('../../../resources/templates/WorkflowVisualizer/ViewOptionsProvider', () => ({
  ViewOptionsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ViewOptionsContext: {
    Consumer: ({
      children,
    }: {
      children: (value: { isLegendOpen: boolean; toggleLegend: () => void }) => React.ReactNode;
    }) => children({ isLegendOpen: legendOpen, toggleLegend }),
  },
}));

vi.mock('../../../resources/templates/WorkflowVisualizer/components', () => ({
  Legend: () => <div>Workflow legend</div>,
}));

vi.mock('@patternfly/react-topology', () => ({
  observer: (component: unknown) => component,
  action: (fn: () => void) => fn,
  createTopologyControlButtons: (options: typeof controlOptions) => {
    controlOptions = options;
    return [];
  },
  defaultControlButtonsOptions: {},
  NodeStatus: { default: 'default', success: 'success' },
  TopologyView: ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
    'data-testid'?: string;
  }) => <div data-testid={props['data-testid']}>{children}</div>,
  TopologyControlBar: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="topology-control-bar">{children}</div>
  ),
  useVisualizationController: () => ({
    toModel: () => ({ nodes: modelNodes }),
    getNodeById: () => activeNode,
    getGraph: () => graphApi,
  }),
  VisualizationSurface: () => <div data-testid="visualization-surface" />,
}));

const server = setupServer(
  http.get(awxAPI`/workflow_job_nodes/100/`, () =>
    HttpResponse.json({
      id: 100,
      summary_fields: { job: { elapsed: 42 } },
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  workflowMessage = undefined;
  legendOpen = false;
  modelNodes = [{ id: '100' }];
  activeNode = mockNode;
  controlOptions = {};
  vi.clearAllMocks();
});
afterAll(() => server.close());

describe('WorkflowOutputGraph', () => {
  it('should render the workflow output graph and refresh node status', async () => {
    render(
      <SwrTestWrapper>
        <WorkflowOutputGraph
          job={jobFixture}
          reloadJob={mockReloadJob}
          refreshNodeStatus={mockRefreshNodeStatus}
        />
      </SwrTestWrapper>
    );

    expect(screen.getByTestId('workflow-visualizer-output-graph')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockRefreshNodeStatus).toHaveBeenCalled();
    });
  });

  it('should update node status and fetch elapsed time when a finished message arrives', async () => {
    workflowMessage = {
      workflow_node_id: 100,
      status: 'successful',
      unified_job_id: jobFixture.id,
      finished: '2024-01-01T10:05:00Z',
      type: 'job',
    };

    render(
      <SwrTestWrapper>
        <WorkflowOutputGraph
          job={jobFixture}
          reloadJob={mockReloadJob}
          refreshNodeStatus={mockRefreshNodeStatus}
        />
      </SwrTestWrapper>
    );

    await waitFor(() => {
      expect(mockSetNodeStatus).toHaveBeenCalledWith('successful');
    });
    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalled();
    });
  });

  it('shows the legend and runs topology control callbacks', () => {
    legendOpen = true;
    render(
      <SwrTestWrapper>
        <WorkflowOutputGraph
          job={jobFixture}
          reloadJob={mockReloadJob}
          refreshNodeStatus={mockRefreshNodeStatus}
        />
      </SwrTestWrapper>
    );

    expect(screen.getByText('Workflow legend')).toBeInTheDocument();
    controlOptions.zoomInCallback?.();
    controlOptions.zoomOutCallback?.();
    controlOptions.fitToScreenCallback?.();
    controlOptions.resetViewCallback?.();
    controlOptions.legendCallback?.();

    expect(graphApi.scaleBy).toHaveBeenCalledWith(4 / 3);
    expect(graphApi.scaleBy).toHaveBeenCalledWith(0.75);
    expect(graphApi.fit).toHaveBeenCalledWith(80);
    expect(graphApi.reset).toHaveBeenCalled();
    expect(graphApi.layout).toHaveBeenCalled();
    expect(toggleLegend).toHaveBeenCalled();
  });

  it('copies the unified job onto the node when the message belongs to another job', async () => {
    workflowMessage = {
      workflow_node_id: 100,
      status: 'running',
      unified_job_id: 999,
      type: 'workflow_job',
    };

    render(
      <SwrTestWrapper>
        <WorkflowOutputGraph
          job={jobFixture}
          reloadJob={mockReloadJob}
          refreshNodeStatus={mockRefreshNodeStatus}
        />
      </SwrTestWrapper>
    );

    await waitFor(() => {
      const calls = mockSetData.mock.calls as Array<
        [
          {
            resource?: { summary_fields?: { job?: { id?: number; type?: string } } };
          },
        ]
      >;
      expect(
        calls.some(
          ([data]) =>
            data.resource?.summary_fields?.job?.id === 999 &&
            data.resource?.summary_fields?.job?.type === 'workflow_job'
        )
      ).toBe(true);
    });
    expect(mockSetNodeStatus).toHaveBeenCalledWith('running');
  });

  it('sets the elapsed-time label after the node details load', async () => {
    workflowMessage = {
      workflow_node_id: 100,
      status: 'successful',
      unified_job_id: jobFixture.id,
      finished: '2024-01-01T10:05:00Z',
      type: 'job',
    };

    render(
      <SwrTestWrapper>
        <WorkflowOutputGraph
          job={jobFixture}
          reloadJob={mockReloadJob}
          refreshNodeStatus={mockRefreshNodeStatus}
        />
      </SwrTestWrapper>
    );

    await waitFor(() => {
      const calls = mockSetData.mock.calls as Array<[{ secondaryLabel?: string }]>;
      expect(calls.some(([data]) => data.secondaryLabel?.includes('00:00:42'))).toBe(true);
    });
  });

  it('skips node updates when the graph has no nodes or the node cannot be found', async () => {
    modelNodes = [];
    activeNode = undefined;
    workflowMessage = {
      workflow_node_id: 100,
      status: 'successful',
      finished: '2024-01-01T10:05:00Z',
      type: 'job',
    };

    render(
      <SwrTestWrapper>
        <WorkflowOutputGraph reloadJob={mockReloadJob} refreshNodeStatus={mockRefreshNodeStatus} />
      </SwrTestWrapper>
    );

    await waitFor(() => {
      expect(mockRefreshNodeStatus).toHaveBeenCalled();
    });
    expect(mockSetNodeStatus).not.toHaveBeenCalled();
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it('ignores a websocket message that has no status', async () => {
    workflowMessage = {
      workflow_node_id: 100,
      type: 'job',
    };

    render(
      <SwrTestWrapper>
        <WorkflowOutputGraph
          job={jobFixture}
          reloadJob={mockReloadJob}
          refreshNodeStatus={mockRefreshNodeStatus}
        />
      </SwrTestWrapper>
    );

    await waitFor(() => {
      expect(mockRefreshNodeStatus).toHaveBeenCalled();
    });
    expect(mockSetNodeStatus).not.toHaveBeenCalled();
  });
});
