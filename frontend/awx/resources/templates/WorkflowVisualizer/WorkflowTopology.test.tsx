import { render } from '@testing-library/react';
import type { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const graph = {
    fit: vi.fn(),
    getNodes: vi.fn(() => []),
    layout: vi.fn(),
    reset: vi.fn(),
    scaleBy: vi.fn(),
  };
  return {
    addEventListener: vi.fn(),
    createEdge: vi.fn((_source: string, target: string) => ({ target })),
    dedupeOldNodes: vi.fn(),
    graph,
    removeEventListener: vi.fn(),
    removeLink: vi.fn(),
    removeNodes: vi.fn(),
    visualization: {
      addEventListener: vi.fn(),
      fromModel: vi.fn(),
      getGraph: vi.fn(() => graph),
      getState: vi.fn(() => ({ selectedIds: [] })),
      registerComponentFactory: vi.fn(),
      registerLayoutFactory: vi.fn(),
      removeEventListener: vi.fn(),
      toModel: vi.fn(() => ({ graph: { visible: true } })),
    },
  };
});

vi.mock('@patternfly/react-topology', () => ({
  ComponentFactory: vi.fn(),
  DagreLayout: vi.fn(),
  DefaultGroup: () => null,
  GraphComponent: () => null,
  LabelPosition: { bottom: 'bottom' },
  ModelKind: { graph: 'graph', node: 'node', edge: 'edge' },
  NodeShape: { circle: 'circle' },
  NodeStatus: { default: 'default' },
  SELECTION_EVENT: 'selection',
  TopologyControlBar: 'div',
  TopologyView: 'div',
  Visualization: vi.fn(function MockVisualization() {
    return mocks.visualization;
  }),
  VisualizationProvider: ({ children }: { children: import('react').ReactNode }) => children,
  VisualizationSurface: 'div',
  action: (callback: () => void) => callback,
  createTopologyControlButtons: vi.fn(() => []),
  defaultControlButtonsOptions: {},
  observer: (component: unknown) => component,
  withContextMenu: () => (component: unknown) => component,
  withPanZoom: () => (component: unknown) => component,
  withSelection: () => (component: unknown) => component,
  useVisualizationController: () => mocks.visualization,
}));

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (value: string) => value }) }));

vi.mock('@ansible/ansible-ui-framework/components/EmptyStateNoData', () => ({
  EmptyStateNoData: () => null,
}));

vi.mock('../../../views/jobs/WorkflowOutput/WorkflowOutput', () => ({ greyBadgeLabel: {} }));

vi.mock('./components', () => ({
  AddNodeButton: () => null,
  CustomEdge: () => null,
  EdgeContextMenu: () => null,
  Legend: () => null,
  Sidebar: () => null,
  ToolbarHeader: () => null,
  WorkflowVisualizerToolbar: () => null,
}));

vi.mock('./hooks', () => ({
  useCreateEdge: () => mocks.createEdge,
  useDedupeOldNodes: () => mocks.dedupeOldNodes,
  useRemoveGraphElements: () => ({ removeLink: mocks.removeLink, removeNodes: mocks.removeNodes }),
}));

vi.mock('./hooks/useCreateNodeComponent', () => ({ useCreateNodeComponent: () => vi.fn() }));

import { WorkflowTopology } from './WorkflowTopology';

const template = {
  summary_fields: { user_capabilities: { edit: true, start: true } },
} as WorkflowJobTemplate;

const node = {
  id: 1,
  identifier: 'node-one',
  success_nodes: [],
  failure_nodes: [],
  always_nodes: [],
} as unknown as WorkflowNode;

describe('WorkflowTopology', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates and removes the selection listener with the current workflow nodes', () => {
    const { rerender, unmount } = render(
      <WorkflowTopology data={{ workflowNodes: [], template }} />
    );

    expect(mocks.visualization.addEventListener).toHaveBeenCalledTimes(1);
    const firstListener = mocks.visualization.addEventListener.mock.calls[0]?.[1] as
      | ((selection: unknown) => void)
      | undefined;
    expect(firstListener).toEqual(expect.any(Function));

    rerender(<WorkflowTopology data={{ workflowNodes: [node], template }} />);

    expect(mocks.visualization.removeEventListener).toHaveBeenCalledWith(
      'selection',
      firstListener
    );
    expect(mocks.visualization.addEventListener).toHaveBeenCalledTimes(2);
    const currentListener = mocks.visualization.addEventListener.mock.calls[1]?.[1] as
      | ((selection: unknown) => void)
      | undefined;

    unmount();

    expect(mocks.visualization.removeEventListener).toHaveBeenCalledWith(
      'selection',
      currentListener
    );
  });
});
