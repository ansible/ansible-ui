import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mockGetNodeById = vi.fn();
let mockState: { selectedIds?: string[] } = {};

vi.mock('@patternfly/react-topology', () => ({
  SELECTION_STATE: 'selectedIds',
  useVisualizationController: vi.fn(() => ({
    getState: () => mockState,
    getNodeById: mockGetNodeById,
  })),
}));

const { useSelectedNode } = await import('./useSelectedNode');

describe('useSelectedNode', () => {
  it('should return undefined when no selectedIds exist', () => {
    mockState = {};
    const { result } = renderHook(() => useSelectedNode());
    expect(result.current).toBeUndefined();
  });

  it('should return undefined when selectedIds is empty', () => {
    mockState = { selectedIds: [] };
    const { result } = renderHook(() => useSelectedNode());
    expect(result.current).toBeUndefined();
  });

  it('should return the node when a selectedId is present', () => {
    const fakeNode = { getId: () => 'node-42', getData: () => ({}) };
    mockGetNodeById.mockReturnValue(fakeNode);
    mockState = { selectedIds: ['node-42'] };

    const { result } = renderHook(() => useSelectedNode());

    expect(mockGetNodeById).toHaveBeenCalledWith('node-42');
    expect(result.current).toBe(fakeNode);
  });
});
