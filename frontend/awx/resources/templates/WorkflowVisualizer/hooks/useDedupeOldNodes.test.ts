import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@patternfly/react-topology', () => ({
  action: vi.fn((fn: () => void) => fn),
}));

const { useDedupeOldNodes } = await import('./useDedupeOldNodes');

describe('useDedupeOldNodes', () => {
  it('should return a function', () => {
    const { result } = renderHook(() => useDedupeOldNodes());
    expect(typeof result.current).toBe('function');
  });

  it('should remove elements with keys ending in -unsavedNode', () => {
    const mockSetId = vi.fn();
    const mockRemoveElement = vi.fn();
    const staleElement = { setId: mockSetId };

    const controller = {
      elements: {
        '42-unsavedNode': staleElement,
        normalNode: {},
      },
      getElementById: vi.fn((key: string) => (key === '42-unsavedNode' ? staleElement : null)),
      removeElement: mockRemoveElement,
    };

    const { result } = renderHook(() => useDedupeOldNodes());
    result.current(controller as never);

    expect(controller.getElementById).toHaveBeenCalledWith('42-unsavedNode');
    expect(mockSetId).toHaveBeenCalledWith('42-unsavedNode');
    expect(mockRemoveElement).toHaveBeenCalledWith(staleElement);
  });

  it('should skip keys that do not end in -unsavedNode', () => {
    const controller = {
      elements: {
        'node-1': {},
        startNode: {},
      },
      getElementById: vi.fn(),
      removeElement: vi.fn(),
    };

    const { result } = renderHook(() => useDedupeOldNodes());
    result.current(controller as never);

    expect(controller.getElementById).not.toHaveBeenCalled();
    expect(controller.removeElement).not.toHaveBeenCalled();
  });

  it('should handle case where getElementById returns null for a stale key', () => {
    const controller = {
      elements: {
        'ghost-unsavedNode': {},
      },
      getElementById: vi.fn(() => null),
      removeElement: vi.fn(),
    };

    const { result } = renderHook(() => useDedupeOldNodes());
    result.current(controller as never);

    expect(controller.getElementById).toHaveBeenCalledWith('ghost-unsavedNode');
    expect(controller.removeElement).not.toHaveBeenCalled();
  });

  it('should remove multiple stale nodes', () => {
    const stale1 = { setId: vi.fn() };
    const stale2 = { setId: vi.fn() };
    const mockRemoveElement = vi.fn();

    const controller = {
      elements: {
        'a-unsavedNode': stale1,
        'b-unsavedNode': stale2,
        keepMe: {},
      },
      getElementById: vi.fn((key: string) => {
        if (key === 'a-unsavedNode') return stale1;
        if (key === 'b-unsavedNode') return stale2;
        return null;
      }),
      removeElement: mockRemoveElement,
    };

    const { result } = renderHook(() => useDedupeOldNodes());
    result.current(controller as never);

    expect(mockRemoveElement).toHaveBeenCalledTimes(2);
    expect(mockRemoveElement).toHaveBeenCalledWith(stale1);
    expect(mockRemoveElement).toHaveBeenCalledWith(stale2);
  });
});
