/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { START_NODE_ID } from '../constants';

const mockCreateEdge = vi.fn((source: string, target: string, _status: string) => ({
  id: `${source}-${target}`,
  type: 'edge',
}));

vi.mock('@patternfly/react-topology', () => ({
  NodeStatus: { danger: 'danger', success: 'success', info: 'info', default: 'default' },
}));

vi.mock('./useCreateEdge', () => ({
  useCreateEdge: vi.fn(() => mockCreateEdge),
}));

const { useRemoveNode } = await import('./useRemoveNode');
const { EdgeStatus } = await import('../types');

function makeEdge(sourceId: string, targetId: string, tagStatus: string = EdgeStatus.success) {
  return {
    setVisible: vi.fn(),
    getSource: () => ({ getId: () => sourceId, setState: vi.fn() }),
    getTarget: () => ({ getId: () => targetId }),
    getData: () => ({ tagStatus }),
  };
}

function makeElement(
  overrides: {
    targetEdges?: ReturnType<typeof makeEdge>[];
    sourceEdges?: ReturnType<typeof makeEdge>[];
    existingEdge?: { setVisible: ReturnType<typeof vi.fn> } | null;
    modelEdges?: unknown[];
    nullModelEdges?: boolean;
  } = {}
) {
  const {
    targetEdges = [],
    sourceEdges = [],
    existingEdge = null,
    modelEdges = [],
    nullModelEdges = false,
  } = overrides;

  const mockFromModel = vi.fn();
  const mockToModel = vi.fn(() => (nullModelEdges ? {} : { edges: [...modelEdges] }));

  return {
    setVisible: vi.fn(),
    getTargetEdges: () => targetEdges,
    getSourceEdges: () => sourceEdges,
    getController: () => ({
      toModel: mockToModel,
      fromModel: mockFromModel,
      getEdgeById: vi.fn(() => existingEdge),
    }),
    _mockFromModel: mockFromModel,
    _mockToModel: mockToModel,
  };
}

describe('useRemoveNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a function', () => {
    const { result } = renderHook(() => useRemoveNode());
    expect(typeof result.current).toBe('function');
  });

  it('should set the element to invisible', () => {
    const element = makeElement();

    const { result } = renderHook(() => useRemoveNode());
    result.current(element as never);

    expect(element.setVisible).toHaveBeenCalledWith(false);
  });

  it('should hide all edges to parents', () => {
    const parentEdge = makeEdge('parent', 'node');
    const element = makeElement({ targetEdges: [parentEdge] });

    const { result } = renderHook(() => useRemoveNode());
    result.current(element as never);

    expect(parentEdge.setVisible).toHaveBeenCalledWith(false);
  });

  it('should hide all edges to children', () => {
    const childEdge = makeEdge('node', 'child');
    const element = makeElement({ sourceEdges: [childEdge] });

    const { result } = renderHook(() => useRemoveNode());
    result.current(element as never);

    expect(childEdge.setVisible).toHaveBeenCalledWith(false);
  });

  it('should create new edges from parents to children when removed', () => {
    const parentEdge = makeEdge('parent', 'node');
    const childEdge = makeEdge('node', 'child', EdgeStatus.success);
    const element = makeElement({
      targetEdges: [parentEdge],
      sourceEdges: [childEdge],
    });

    const { result } = renderHook(() => useRemoveNode());
    result.current(element as never);

    expect(mockCreateEdge).toHaveBeenCalledWith('parent', 'child', EdgeStatus.success);
    expect(element._mockFromModel).toHaveBeenCalledWith(
      expect.objectContaining({
        edges: expect.arrayContaining([expect.objectContaining({ id: 'parent-child' })]),
      })
    );
  });

  it('should mark parent nodes as modified', () => {
    const parentSetState = vi.fn();
    const parentEdge = {
      setVisible: vi.fn(),
      getSource: () => ({ getId: () => 'parent', setState: parentSetState }),
      getTarget: () => ({ getId: () => 'node' }),
      getData: () => ({ tagStatus: EdgeStatus.success }),
    };
    const childEdge = makeEdge('node', 'child');
    const element = makeElement({
      targetEdges: [parentEdge],
      sourceEdges: [childEdge],
    });

    const { result } = renderHook(() => useRemoveNode());
    result.current(element as never);

    expect(parentSetState).toHaveBeenCalledWith({ modified: true });
  });

  it('should use EdgeStatus.info when parent is the start node', () => {
    const parentEdge = makeEdge(START_NODE_ID, 'node');
    const childEdge = makeEdge('node', 'child', EdgeStatus.danger);
    const element = makeElement({
      targetEdges: [parentEdge],
      sourceEdges: [childEdge],
    });

    const { result } = renderHook(() => useRemoveNode());
    result.current(element as never);

    expect(mockCreateEdge).toHaveBeenCalledWith(START_NODE_ID, 'child', EdgeStatus.info);
  });

  it('should reuse an existing edge instead of creating a new one', () => {
    const existingEdge = { setVisible: vi.fn() };
    const parentEdge = makeEdge('parent', 'node');
    const childEdge = makeEdge('node', 'child');
    const element = makeElement({
      targetEdges: [parentEdge],
      sourceEdges: [childEdge],
      existingEdge,
    });

    const { result } = renderHook(() => useRemoveNode());
    result.current(element as never);

    expect(existingEdge.setVisible).toHaveBeenCalledWith(true);
    expect(mockCreateEdge).not.toHaveBeenCalled();
  });

  it('should handle node with no children (leaf node)', () => {
    const parentEdge = makeEdge('parent', 'node');
    const element = makeElement({
      targetEdges: [parentEdge],
      sourceEdges: [],
    });

    const { result } = renderHook(() => useRemoveNode());
    result.current(element as never);

    expect(mockCreateEdge).not.toHaveBeenCalled();
    expect(element._mockFromModel).toHaveBeenCalled();
  });

  it('should handle node with no parents (root node)', () => {
    const childEdge = makeEdge('node', 'child');
    const element = makeElement({
      targetEdges: [],
      sourceEdges: [childEdge],
    });

    const { result } = renderHook(() => useRemoveNode());
    result.current(element as never);

    expect(mockCreateEdge).not.toHaveBeenCalled();
  });

  it('should initialize model.edges when toModel returns no edges', () => {
    const parentEdge = makeEdge('parent', 'node');
    const childEdge = makeEdge('node', 'child');
    const element = makeElement({
      targetEdges: [parentEdge],
      sourceEdges: [childEdge],
      nullModelEdges: true,
    });

    const { result } = renderHook(() => useRemoveNode());
    result.current(element as never);

    expect(element._mockFromModel).toHaveBeenCalledWith(
      expect.objectContaining({ edges: expect.any(Array) })
    );
  });
});
