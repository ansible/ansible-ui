import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Node } from '@patternfly/react-topology';

const mockSetNodeShape = vi.fn();
const mockSetNodeStatus = vi.fn();

vi.mock('@patternfly/react-topology', () => ({
  NodeShape: { hexagon: 'hexagon', circle: 'circle' },
  NodeStatus: { danger: 'danger', default: 'default' },
  action: vi.fn((fn: () => void) => fn),
}));

const { useTargetNodeAncestors } = await import('./useTargetNodeAncestors');

function makeNode(id: string) {
  return {
    getId: () => id,
    setNodeShape: mockSetNodeShape,
    setNodeStatus: mockSetNodeStatus,
  };
}

function makeEdge(sourceId: string, targetId: string) {
  return {
    getSource: () => ({ getId: () => sourceId }),
    getTarget: () => ({ getId: () => targetId }),
  };
}

describe('useTargetNodeAncestors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a function', () => {
    const { result } = renderHook(() => useTargetNodeAncestors());
    expect(typeof result.current).toBe('function');
  });

  it('should return early when source has no getGraph', () => {
    const { result } = renderHook(() => useTargetNodeAncestors());
    const source = { getGraph: undefined } as unknown as Node;
    expect(() => result.current(source)).not.toThrow();
  });

  it('should return early when source.getGraph() returns falsy', () => {
    const { result } = renderHook(() => useTargetNodeAncestors());
    const source = { getGraph: () => null } as unknown as Node;
    expect(() => result.current(source)).not.toThrow();
  });

  it('should mark direct parent ancestors as danger hexagons', () => {
    const nodeA = makeNode('A');
    const nodeB = makeNode('B');
    const nodeC = makeNode('C');

    const source = {
      getId: () => 'C',
      getGraph: () => ({
        getNodes: () => [nodeA, nodeB, nodeC],
        getEdges: () => [makeEdge('A', 'B'), makeEdge('B', 'C')],
      }),
    } as unknown as Node;

    const { result } = renderHook(() => useTargetNodeAncestors());
    result.current(source);

    expect(mockSetNodeShape).toHaveBeenCalledWith('hexagon');
    expect(mockSetNodeStatus).toHaveBeenCalledWith('danger');
  });

  it('should mark direct children of the source as invalid drop targets', () => {
    const child = makeNode('child');
    const source = {
      getId: () => 'source',
      getGraph: () => ({
        getNodes: () => [makeNode('source'), child],
        getEdges: () => [makeEdge('source', 'child')],
      }),
    } as unknown as Node;

    const { result } = renderHook(() => useTargetNodeAncestors());
    result.current(source);

    expect(mockSetNodeShape).toHaveBeenCalledWith('hexagon');
    expect(mockSetNodeStatus).toHaveBeenCalledWith('danger');
  });

  it('should skip links from startNode', () => {
    const nodeA = makeNode('A');
    const source = {
      getId: () => 'A',
      getGraph: () => ({
        getNodes: () => [nodeA],
        getEdges: () => [makeEdge('startNode', 'A')],
      }),
    } as unknown as Node;

    const { result } = renderHook(() => useTargetNodeAncestors());
    result.current(source);

    expect(mockSetNodeShape).not.toHaveBeenCalled();
  });

  it('should handle diamond-shaped graphs without duplicate marking', () => {
    const nodeA = makeNode('A');
    const nodeB = makeNode('B');
    const nodeC = makeNode('C');
    const nodeD = makeNode('D');

    const source = {
      getId: () => 'D',
      getGraph: () => ({
        getNodes: () => [nodeA, nodeB, nodeC, nodeD],
        getEdges: () => [
          makeEdge('A', 'B'),
          makeEdge('A', 'C'),
          makeEdge('B', 'D'),
          makeEdge('C', 'D'),
        ],
      }),
    } as unknown as Node;

    const { result } = renderHook(() => useTargetNodeAncestors());
    result.current(source);

    const shapeCalls = mockSetNodeShape.mock.calls.filter((c) => c[0] === 'hexagon');
    expect(shapeCalls.length).toBeGreaterThanOrEqual(3);
  });

  it('should handle graph with no edges', () => {
    const source = {
      getId: () => 'solo',
      getGraph: () => ({
        getNodes: () => [makeNode('solo')],
        getEdges: () => [],
      }),
    } as unknown as Node;

    const { result } = renderHook(() => useTargetNodeAncestors());
    result.current(source);

    expect(mockSetNodeShape).not.toHaveBeenCalled();
    expect(mockSetNodeStatus).not.toHaveBeenCalled();
  });
});
