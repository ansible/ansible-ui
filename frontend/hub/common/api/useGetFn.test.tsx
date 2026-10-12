import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGetFn } from './useGetFn';

describe('useGetFn', () => {
  it('loads data with SWR and exposes refresh', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useGetFn('test-key', fetcher));

    await waitFor(() => {
      expect(result.current.data).toEqual({ ok: true });
    });
    expect(fetcher).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);

    result.current.refresh();
    await waitFor(() => {
      expect(fetcher.mock.calls.length).toBeGreaterThan(1);
    });
  });

  it('normalizes non-Error throw values', async () => {
    const fetcher = vi.fn().mockRejectedValue('string failure');

    const { result } = renderHook(() => useGetFn('error-key', fetcher));

    await waitFor(() => {
      expect(result.current.error?.message).toBe('Unknown error');
    });
  });
});
