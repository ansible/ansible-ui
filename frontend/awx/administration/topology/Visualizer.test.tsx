import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MeshVisualizer } from '../../interfaces/MeshVisualizer';
import { getEdgeStatus, getEdgeStyle } from './edgeUtils';
import { TopologyViewLayer } from './Visualizer';

const mockPostMessage = vi.fn();
const mockTerminate = vi.fn();

vi.mock('@patternfly/react-topology', () => ({
  observer: (C: unknown) => C,
  ComponentFactory: vi.fn(),
  DefaultGroup: () => null,
  DefaultNode: () => null,
  DefaultEdge: () => null,
  EdgeModel: {},
  EdgeStyle: { default: 'default', dashed: 'dashed' },
  GraphComponent: () => null,
  Model: {},
  ModelKind: { graph: 'graph', node: 'node', edge: 'edge' },
  NodeModel: {},
  NodeShape: { rect: 'rect' },
  NodeStatus: { default: 'default', success: 'success', danger: 'danger' },
  TopologyView: () => null,
  SELECTION_EVENT: 'selection',
  SELECTION_STATE: {},
  TopologyControlBar: () => null,
  TopologySideBar: () => null,
  useVisualizationController: () => ({}),
  useSize: () => [0, 0],
  WithContextMenuProps: {},
  WithSelectionProps: {},
  Edge: () => null,
  Point: {},
  GraphElement: () => null,
  Graph: () => null,
  GraphModel: {},
  Node: () => null,
  isNode: () => false,
  Controller: () => null,
  EdgeTerminalType: {},
  getDefaultShapeDecoratorCenter: () => ({ x: 0, y: 0 }),
  TopologyQuadrant: { upperLeft: 'upperLeft' },
  DEFAULT_DECORATOR_RADIUS: 6,
  Decorator: () => null,
  Visualization: vi.fn().mockImplementation(() => ({
    registerComponentFactory: vi.fn(),
    addEventListener: vi.fn(),
    fromModel: vi.fn(),
    getGraph: vi.fn().mockReturnValue({
      fit: vi.fn(),
      scaleBy: vi.fn(),
      reset: vi.fn(),
      layout: vi.fn(),
    }),
  })),
  VisualizationProvider: (props: { children?: unknown }) => props.children,
  VisualizationSurface: () => null,
  action: (fn: () => void) => fn,
  createTopologyControlButtons: vi.fn(() => []),
  defaultControlButtonsOptions: {},
  withPanZoom: () => (C: unknown) => C,
  withSelection: () => (C: unknown) => C,
}));
vi.mock('d3', () => ({
  select: vi.fn(() => ({ node: () => null })),
}));
vi.mock('./worker.ts?worker', () => ({
  default: function MockWorker() {
    const instance = {
      postMessage: mockPostMessage,
      terminate: mockTerminate,
      onmessage: null as ((e: { data: unknown }) => void) | null,
    };
    setTimeout(() => {
      if (instance.onmessage) {
        instance.onmessage({
          data: { type: 'end', nodes: [], links: [], progress: 1 },
        });
      }
    }, 0);
    return instance;
  },
}));

const emptyMesh: MeshVisualizer = { nodes: [], links: [] };

const meshWithData: MeshVisualizer = {
  nodes: [
    {
      id: 1,
      hostname: 'node-1',
      node_type: 'control',
      node_state: 'ready',
      enabled: true,
    },
    {
      id: 2,
      hostname: 'node-2',
      node_type: 'execution',
      node_state: 'installed',
      enabled: true,
    },
  ],
  links: [{ source: 'node-1', target: 'node-2', link_state: 'established' }],
};

describe('edgeUtils', () => {
  describe('getEdgeStyle', () => {
    it('should return default for established', () => {
      expect(getEdgeStyle('established')).toBe('default');
    });

    it('should return dashed for adding', () => {
      expect(getEdgeStyle('adding')).toBe('dashed');
    });

    it('should return dashed for removing', () => {
      expect(getEdgeStyle('removing')).toBe('dashed');
    });

    it('should return default for unknown state', () => {
      expect(getEdgeStyle('unknown')).toBe('default');
    });
  });

  describe('getEdgeStatus', () => {
    it('should return default for established', () => {
      expect(getEdgeStatus('established')).toBe('default');
    });

    it('should return success for adding', () => {
      expect(getEdgeStatus('adding')).toBe('success');
    });

    it('should return danger for removing', () => {
      expect(getEdgeStatus('removing')).toBe('danger');
    });

    it('should return default for unknown state', () => {
      expect(getEdgeStatus('unknown')).toBe('default');
    });
  });
});

describe('TopologyViewLayer', () => {
  beforeEach(() => {
    vi.stubGlobal('Worker', vi.fn());
    mockPostMessage.mockClear();
    mockTerminate.mockClear();
  });

  it('should pass mesh data to worker via postMessage', async () => {
    render(<TopologyViewLayer mesh={meshWithData} />);

    await waitFor(() => {
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          nodes: meshWithData.nodes,
          links: meshWithData.links,
          width: 1200,
          height: 800,
        })
      );
    });
  });

  it('should pass empty mesh to worker when mesh has no data', async () => {
    render(<TopologyViewLayer mesh={emptyMesh} />);

    await waitFor(() => {
      expect(mockPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          nodes: [],
          links: [],
        })
      );
    });
  });

  it('should accept MeshVisualizer prop with required shape', () => {
    const mesh: MeshVisualizer = {
      nodes: [{ id: 1, hostname: 'a', node_type: 'control', node_state: 'ready', enabled: true }],
      links: [{ source: 'a', target: 'b', link_state: 'adding' }],
    };
    expect(() => render(<TopologyViewLayer mesh={mesh} />)).not.toThrow();
  });

  it('should terminate worker on unmount', async () => {
    const { unmount } = render(<TopologyViewLayer mesh={emptyMesh} />);

    await waitFor(() => {
      expect(mockPostMessage).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(mockTerminate).toHaveBeenCalled();
    });
  });
});
