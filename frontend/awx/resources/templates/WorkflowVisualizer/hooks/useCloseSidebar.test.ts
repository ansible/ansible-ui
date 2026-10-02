import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mockSetState = vi.fn();
const mockGetState = vi.fn(() => ({ selectedIds: ['node-1'], sourceNode: { id: 'node-1' } }));
const mockSetSidebarMode = vi.fn();

vi.mock('@patternfly/react-topology', () => ({
  useVisualizationController: vi.fn(() => ({
    getState: mockGetState,
    setState: mockSetState,
  })),
}));

vi.mock('../ViewOptionsProvider', () => ({
  useViewOptions: vi.fn(() => ({
    setSidebarMode: mockSetSidebarMode,
  })),
}));

const { useCloseSidebar } = await import('./useCloseSidebar');

describe('useCloseSidebar', () => {
  it('should return a function', () => {
    const { result } = renderHook(() => useCloseSidebar());
    expect(typeof result.current).toBe('function');
  });

  it('should clear selectedIds and sourceNode from controller state', () => {
    const { result } = renderHook(() => useCloseSidebar());

    act(() => {
      result.current();
    });

    expect(mockSetState).toHaveBeenCalledWith({
      selectedIds: [],
      sourceNode: undefined,
    });
  });

  it('should set sidebar mode to undefined', () => {
    const { result } = renderHook(() => useCloseSidebar());

    act(() => {
      result.current();
    });

    expect(mockSetSidebarMode).toHaveBeenCalledWith(undefined);
  });
});
