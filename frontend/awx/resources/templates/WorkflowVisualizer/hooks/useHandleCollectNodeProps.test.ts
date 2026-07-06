import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockTargetNodeAncestors = vi.fn();
const mockSetNodeShape = vi.fn();
const mockSetNodeStatus = vi.fn();

vi.mock('@patternfly/react-topology', () => ({
  NodeShape: { circle: 'circle' },
  NodeStatus: { default: 'default', danger: 'danger' },
  action: vi.fn((fn: () => void) => fn),
}));

vi.mock('./useTargetNodeAncestors', () => ({
  useTargetNodeAncestors: vi.fn(() => mockTargetNodeAncestors),
}));

const { useHandleCollectNodeProps } = await import('./useHandleCollectNodeProps');

describe('useHandleCollectNodeProps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a callback function', () => {
    const { result } = renderHook(() => useHandleCollectNodeProps());
    expect(typeof result.current).toBe('function');
  });

  it('should reset node shape and status when not dragging', () => {
    const monitor = {
      isDragging: () => false,
      getDropResult: () => null,
      getItem: () => null,
    };
    const iteratedNode = {
      setNodeShape: mockSetNodeShape,
      setNodeStatus: mockSetNodeStatus,
    };
    const props = { element: iteratedNode, someExtraProp: true };

    const { result } = renderHook(() => useHandleCollectNodeProps());
    const collected = result.current(monitor as never, props as never);

    expect(mockSetNodeShape).toHaveBeenCalledWith('circle');
    expect(mockSetNodeStatus).toHaveBeenCalledWith('default');
    expect(collected.edgeDragging).toBe(false);
  });

  it('should set canDrop to true when target status is not danger', () => {
    const monitor = {
      isDragging: () => false,
      getDropResult: () => ({ getNodeStatus: () => 'default' }),
      getItem: () => null,
    };
    const props = {
      element: { setNodeShape: mockSetNodeShape, setNodeStatus: mockSetNodeStatus },
    };

    const { result } = renderHook(() => useHandleCollectNodeProps());
    const collected = result.current(monitor as never, props as never);

    expect(collected.canDrop).toBe(true);
  });

  it('should set canDrop to false when target status is danger', () => {
    const monitor = {
      isDragging: () => false,
      getDropResult: () => ({ getNodeStatus: () => 'danger' }),
      getItem: () => null,
    };
    const props = {
      element: { setNodeShape: mockSetNodeShape, setNodeStatus: mockSetNodeStatus },
    };

    const { result } = renderHook(() => useHandleCollectNodeProps());
    const collected = result.current(monitor as never, props as never);

    expect(collected.canDrop).toBe(false);
  });

  it('should call targetNodeAncestors when isDragging', () => {
    const sourceNode = { getId: () => 'src-1' };
    const monitor = {
      isDragging: () => true,
      getDropResult: () => null,
      getItem: () => sourceNode,
    };
    const props = { element: {} };

    const { result } = renderHook(() => useHandleCollectNodeProps());
    result.current(monitor as never, props as never);

    expect(mockTargetNodeAncestors).toHaveBeenCalledWith(sourceNode);
  });

  it('should use default status when getDropResult returns null', () => {
    const monitor = {
      isDragging: () => true,
      getDropResult: () => null,
      getItem: () => ({}),
    };
    const props = { element: {} };

    const { result } = renderHook(() => useHandleCollectNodeProps());
    const collected = result.current(monitor as never, props as never);

    expect(collected.canDrop).toBe(true);
    expect(collected.edgeDragging).toBe(true);
  });
});
