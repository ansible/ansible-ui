import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { START_NODE_ID } from '../constants';

const mockCreateConnectorFn = vi.fn();
const mockHandleCollectNodeProps = vi.fn();

vi.mock('@patternfly/react-topology', () => ({
  CREATE_CONNECTOR_DROP_TYPE: 'create-connector-drop-type',
  EDGE_DRAG_TYPE: 'edge-drag-type',
  NodeStatus: { danger: 'danger', success: 'success', info: 'info', default: 'default' },
  isNode: vi.fn((target: unknown) => {
    const t = target as { _isNode?: boolean };
    return t?._isNode !== false;
  }),
  nodeDragSourceSpec: vi.fn(() => ({})),
  withContextMenu: vi.fn(() => (component: unknown) => component),
  withCreateConnector: vi.fn((handler: (...args: unknown[]) => unknown) => {
    (withCreateConnector as { _handler?: (...args: unknown[]) => unknown })._handler = handler;
    return (component: unknown) => component;
  }),
  withDndDrop: vi.fn(() => (component: unknown) => component),
  withDragNode: vi.fn(() => (component: unknown) => component),
  withSelection: vi.fn(() => (component: unknown) => component),
}));

vi.mock('./useCreateConnector', () => ({
  useCreateConnector: vi.fn(() => mockCreateConnectorFn),
}));

vi.mock('./useHandleCollectNodeProps', () => ({
  useHandleCollectNodeProps: vi.fn(() => mockHandleCollectNodeProps),
}));

vi.mock('../components', () => ({
  CustomNode: () => null,
  NodeContextMenu: () => null,
}));

const { useCreateNodeComponent } = await import('./useCreateNodeComponent');
const { withCreateConnector } = await import('@patternfly/react-topology');

describe('useCreateNodeComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a factory function', () => {
    const { result } = renderHook(() => useCreateNodeComponent());
    expect(typeof result.current).toBe('function');
  });

  it('should return a component when factory is called', () => {
    const { result } = renderHook(() => useCreateNodeComponent());
    const Component = result.current();
    expect(Component).toBeDefined();
  });

  it('should pass createConnector handler to withCreateConnector', () => {
    const { result } = renderHook(() => useCreateNodeComponent());
    result.current();

    expect(withCreateConnector).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should do nothing in connector handler when target is not a node', () => {
    renderHook(() => useCreateNodeComponent());

    const handler = (
      withCreateConnector as unknown as { _handler: (...args: unknown[]) => unknown }
    )._handler;
    const source = { getId: () => 'src' };
    const target = { _isNode: false };

    handler(source, target);

    expect(mockCreateConnectorFn).not.toHaveBeenCalled();
  });

  it('should do nothing in connector handler when target status is danger', () => {
    renderHook(() => useCreateNodeComponent());

    const handler = (
      withCreateConnector as unknown as { _handler: (...args: unknown[]) => unknown }
    )._handler;
    const source = { getId: () => 'src' };
    const target = {
      _isNode: true,
      getNodeStatus: () => 'danger',
      getTargetEdges: () => [],
    };

    handler(source, target);

    expect(mockCreateConnectorFn).not.toHaveBeenCalled();
  });

  it('should call createConnector when target is valid', () => {
    renderHook(() => useCreateNodeComponent());

    const handler = (
      withCreateConnector as unknown as { _handler: (...args: unknown[]) => unknown }
    )._handler;
    const source = { getId: () => 'src' };
    const target = {
      _isNode: true,
      getNodeStatus: () => 'default',
      getTargetEdges: () => [],
    };

    handler(source, target);

    expect(mockCreateConnectorFn).toHaveBeenCalledWith(source, target);
  });

  it('should hide edge from start node when target is a root node', () => {
    renderHook(() => useCreateNodeComponent());

    const handler = (
      withCreateConnector as unknown as { _handler: (...args: unknown[]) => unknown }
    )._handler;
    const source = { getId: () => 'src' };
    const edgeSetVisible = vi.fn();
    const target = {
      _isNode: true,
      getNodeStatus: () => 'default',
      getTargetEdges: () => [
        {
          getSource: () => ({ getId: () => START_NODE_ID }),
          setVisible: edgeSetVisible,
        },
      ],
    };

    handler(source, target);

    expect(edgeSetVisible).toHaveBeenCalledWith(false);
    expect(mockCreateConnectorFn).toHaveBeenCalledWith(source, target);
  });

  it('should not hide edge when target has one edge but source is not start node', () => {
    renderHook(() => useCreateNodeComponent());

    const handler = (
      withCreateConnector as unknown as { _handler: (...args: unknown[]) => unknown }
    )._handler;
    const source = { getId: () => 'src' };
    const edgeSetVisible = vi.fn();
    const target = {
      _isNode: true,
      getNodeStatus: () => 'default',
      getTargetEdges: () => [
        {
          getSource: () => ({ getId: () => 'other-node' }),
          setVisible: edgeSetVisible,
        },
      ],
    };

    handler(source, target);

    expect(edgeSetVisible).not.toHaveBeenCalled();
    expect(mockCreateConnectorFn).toHaveBeenCalledWith(source, target);
  });

  it('should not hide edges when target has multiple parent edges', () => {
    renderHook(() => useCreateNodeComponent());

    const handler = (
      withCreateConnector as unknown as { _handler: (...args: unknown[]) => unknown }
    )._handler;
    const source = { getId: () => 'src' };
    const edge1SetVisible = vi.fn();
    const edge2SetVisible = vi.fn();
    const target = {
      _isNode: true,
      getNodeStatus: () => 'default',
      getTargetEdges: () => [
        { getSource: () => ({ getId: () => START_NODE_ID }), setVisible: edge1SetVisible },
        { getSource: () => ({ getId: () => 'other' }), setVisible: edge2SetVisible },
      ],
    };

    handler(source, target);

    expect(edge1SetVisible).not.toHaveBeenCalled();
    expect(edge2SetVisible).not.toHaveBeenCalled();
  });
});
