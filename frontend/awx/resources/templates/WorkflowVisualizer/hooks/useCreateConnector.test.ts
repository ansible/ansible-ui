/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const mockCreateEdge = vi.fn(() => ({ id: 'src-tgt', type: 'edge' }));
const mockSetState = vi.fn();
const mockFromModel = vi.fn();
const mockLayout = vi.fn();
const mockControllerSetState = vi.fn();
const mockControllerGetState = vi.fn(() => ({ modified: false }));

vi.mock('@patternfly/react-topology', () => ({
  NodeStatus: { danger: 'danger', success: 'success', info: 'info', default: 'default' },
  isNode: vi.fn((target: unknown) => {
    const t = target as { _isNode?: boolean };
    return t?._isNode !== false;
  }),
}));

vi.mock('./useCreateEdge', () => ({
  useCreateEdge: vi.fn(() => mockCreateEdge),
}));

const { useCreateConnector } = await import('./useCreateConnector');
const { EdgeStatus } = await import('../types');

function makeSource(id: string, modelOverrides?: Record<string, unknown>) {
  return {
    getId: () => id,
    setState: mockSetState,
    getController: () => ({
      toModel: () => ({ edges: [], ...modelOverrides }),
      getState: mockControllerGetState,
      setState: mockControllerSetState,
      fromModel: mockFromModel,
      getGraph: () => ({ layout: mockLayout }),
    }),
  };
}

describe('useCreateConnector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a function', () => {
    const { result } = renderHook(() => useCreateConnector());
    expect(typeof result.current).toBe('function');
  });

  it('should return early when target is not a node', () => {
    const source = makeSource('src');
    const target = { _isNode: false };

    const { result } = renderHook(() => useCreateConnector());
    result.current(source as never, target as never);

    expect(mockCreateEdge).not.toHaveBeenCalled();
  });

  it('should create an edge between source and target', () => {
    const source = makeSource('src');
    const target = { _isNode: true, getId: () => 'tgt' };

    const { result } = renderHook(() => useCreateConnector());
    result.current(source as never, target as never);

    expect(mockCreateEdge).toHaveBeenCalledWith('src', 'tgt', EdgeStatus.info);
  });

  it('should set modified state on the source node', () => {
    const source = makeSource('src');
    const target = { _isNode: true, getId: () => 'tgt' };

    const { result } = renderHook(() => useCreateConnector());
    result.current(source as never, target as never);

    expect(mockSetState).toHaveBeenCalledWith({ modified: true });
  });

  it('should set modified state on the controller', () => {
    const source = makeSource('src');
    const target = { _isNode: true, getId: () => 'tgt' };

    const { result } = renderHook(() => useCreateConnector());
    result.current(source as never, target as never);

    expect(mockControllerSetState).toHaveBeenCalledWith(
      expect.objectContaining({ modified: true })
    );
  });

  it('should call fromModel and layout on the controller graph', () => {
    const source = makeSource('src');
    const target = { _isNode: true, getId: () => 'tgt' };

    const { result } = renderHook(() => useCreateConnector());
    result.current(source as never, target as never);

    expect(mockFromModel).toHaveBeenCalledWith(
      expect.objectContaining({
        edges: expect.arrayContaining([expect.objectContaining({ id: 'src-tgt' })]),
      }),
      true
    );
    expect(mockLayout).toHaveBeenCalled();
  });

  it('should initialize model.edges when it is undefined', () => {
    const source = {
      getId: () => 'src',
      setState: mockSetState,
      getController: () => ({
        toModel: () => ({}),
        getState: mockControllerGetState,
        setState: mockControllerSetState,
        fromModel: mockFromModel,
        getGraph: () => ({ layout: mockLayout }),
      }),
    };
    const target = { _isNode: true, getId: () => 'tgt' };

    const { result } = renderHook(() => useCreateConnector());
    result.current(source as never, target as never);

    expect(mockFromModel).toHaveBeenCalledWith(
      expect.objectContaining({
        edges: [expect.objectContaining({ id: 'src-tgt' })],
      }),
      true
    );
  });
});
