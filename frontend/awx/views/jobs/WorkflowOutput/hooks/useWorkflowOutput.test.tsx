import { useWSThrottle } from '@ansible/awx-ui/common/useWSThrottle';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WebSocketMessage } from './useWorkflowOutput';

describe('useWSThrottle hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle undefined value', () => {
    const { result } = renderHook(() => useWSThrottle({ value: undefined, limit: 500 }));
    expect(result.current).toBeUndefined();
  });

  it('should return the initial value', () => {
    const initial: WebSocketMessage = { workflow_node_id: 1 };
    const { result } = renderHook(() => useWSThrottle({ value: initial, limit: 500 }));
    expect(result.current).toEqual(initial);
  });

  it('should not throttle when value is same as initial value', () => {
    const initial: WebSocketMessage = { workflow_node_id: 1 };
    const { result, rerender } = renderHook(
      ({ val }) => useWSThrottle({ value: val, limit: 500 }),
      {
        initialProps: { val: initial },
      }
    );
    expect(result.current).toEqual(initial);

    // rerender with the same val - no updates
    rerender({ val: initial });
    // result should still be the same
    expect(result.current).toEqual(initial);
  });

  it('should returned first value after undefined initial value', () => {
    const undefinedVal = undefined as WebSocketMessage | undefined;
    const { result, rerender } = renderHook(
      ({ val }) => useWSThrottle({ value: val, limit: 500 }),
      {
        initialProps: { val: undefinedVal },
      }
    );
    expect(result.current).toBeUndefined();

    const firstDefined: WebSocketMessage = { workflow_node_id: 2 };
    act(() => rerender({ val: firstDefined }));
    expect(result.current).toEqual(firstDefined);
  });

  it('should throttle updates to the latest value', () => {
    let val: WebSocketMessage | undefined = { workflow_node_id: 1 };
    const { result, rerender } = renderHook(
      ({ val }) => useWSThrottle({ value: val, limit: 500 }),
      {
        initialProps: { val },
      }
    );

    // send a new value
    act(() => {
      val = { workflow_node_id: 2 };
      rerender({ val });
    });
    expect(result.current).toEqual({ workflow_node_id: 1 });

    // after limit has passed, should return the new value
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toEqual({ workflow_node_id: 2 });
  });

  it('should throttle to the latest value after multiple rapid updates', async () => {
    let val: WebSocketMessage | undefined = { workflow_node_id: 1 };
    const { result, rerender } = renderHook(
      ({ val }) => useWSThrottle({ value: val, limit: 500 }),
      {
        initialProps: { val },
      }
    );

    // send different values in quick succession
    act(() => {
      val = { workflow_node_id: 2 };
      rerender({ val });

      val = { workflow_node_id: 3 };
      rerender({ val });

      val = { workflow_node_id: 4 };
      rerender({ val });
    });

    // still throttled, hook returns the initial value
    expect(result.current).toEqual({ workflow_node_id: 1 });

    // after limit has passed, hook should return the last value
    await act(() => vi.advanceTimersByTime(500));
    expect(result.current).toEqual({ workflow_node_id: 4 });
  });
});
