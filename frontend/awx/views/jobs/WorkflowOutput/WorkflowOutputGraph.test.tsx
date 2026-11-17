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
let workflowMessage: WebSocketMessage | undefined;

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
    }) => children({ isLegendOpen: false, toggleLegend: vi.fn() }),
  },
}));

vi.mock('../../../resources/templates/WorkflowVisualizer/components', () => ({
  Legend: () => null,
}));

vi.mock('@patternfly/react-topology', () => ({
  observer: (component: unknown) => component,
  action: (fn: () => void) => fn,
  createTopologyControlButtons: vi.fn(() => []),
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
    toModel: () => ({ nodes: [{ id: '100' }] }),
    getNodeById: () => mockNode,
    getGraph: () => ({
      scaleBy: vi.fn(),
      fit: vi.fn(),
      reset: vi.fn(),
      layout: vi.fn(),
    }),
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
});
