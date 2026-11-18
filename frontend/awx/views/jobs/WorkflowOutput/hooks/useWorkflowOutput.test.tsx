import { useWSThrottle } from '@ansible/awx-ui/common/useWSThrottle';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Job } from '../../../../interfaces/Job';
import { useWorkflowOutput, WebSocketMessage } from './useWorkflowOutput';

let websocketHandler: ((message?: WebSocketMessage) => void) | undefined;

vi.mock('../../../../common/useAwxWebSocket', () => ({
  useAwxWebSocketSubscription: (
    _groups: unknown,
    handler: (message?: WebSocketMessage) => void
  ) => {
    websocketHandler = handler;
  },
}));

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

    rerender({ val: initial });
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

    act(() => {
      val = { workflow_node_id: 2 };
      rerender({ val });
    });
    expect(result.current).toEqual({ workflow_node_id: 1 });

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

    act(() => {
      val = { workflow_node_id: 2 };
      rerender({ val });

      val = { workflow_node_id: 3 };
      rerender({ val });

      val = { workflow_node_id: 4 };
      rerender({ val });
    });

    expect(result.current).toEqual({ workflow_node_id: 1 });

    await act(() => vi.advanceTimersByTime(500));
    expect(result.current).toEqual({ workflow_node_id: 4 });
  });
});

describe('useWorkflowOutput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    websocketHandler = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reloads the job when throttled websocket messages report a status change', () => {
    const reloadJob = vi.fn();
    const job = { id: 12, type: 'workflow_job', status: 'running' } as Job;

    renderHook(() => useWorkflowOutput(reloadJob, job));

    act(() => {
      websocketHandler?.({
        group_name: 'jobs',
        unified_job_id: 12,
        status: 'successful',
      });
      vi.advanceTimersByTime(500);
    });

    expect(reloadJob).toHaveBeenCalledTimes(1);
  });
});
