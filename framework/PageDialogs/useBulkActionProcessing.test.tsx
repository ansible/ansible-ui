import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useBulkActionProcessing } from './useBulkActionProcessing';

describe('useBulkActionProcessing', () => {
  it('updates status and progress for successful and failed items', async () => {
    const setStatuses = vi.fn((update: (value: undefined) => unknown) => update(undefined));
    const setError = vi.fn();
    const setProcessing = vi.fn();
    const setProgress = vi.fn();
    const setSuccessfulItems = vi.fn();
    const errorAdapter = vi.fn(() => ({ genericErrors: [{ message: 'failed' }], fieldErrors: [] }));
    const actionFn = vi.fn((item: { id: number }) => {
      if (item.id === 2) throw new Error('failed');
      return Promise.resolve({ message: 'ok', url: '/items/1' });
    });

    renderHook(() =>
      useBulkActionProcessing({
        abortController: new AbortController(),
        actionFn,
        errorAdapter,
        items: [{ id: 1 }, { id: 2 }],
        keyFn: (item: { id: number }) => item.id,
        retry: 0,
        setError,
        setProcessing,
        setProgress,
        setStatuses: setStatuses as never,
        setSuccessfulItems,
        statusParser: (response) => response as { message: string; url: string },
        successfulItems: [],
        t: (key) => key,
        translations: { errorText: 'Action failed' },
      })
    );

    await waitFor(() => expect(setProcessing).toHaveBeenCalledWith(false));
    expect(setStatuses).toHaveBeenCalledTimes(2);
    expect(setProgress).toHaveBeenCalledTimes(2);
    expect(setError).toHaveBeenCalledWith('Action failed');
    expect(setSuccessfulItems).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('does not update processing state after cancellation', async () => {
    const abortController = new AbortController();
    abortController.abort();
    const setProcessing = vi.fn();
    const setSuccessfulItems = vi.fn();

    renderHook(() =>
      useBulkActionProcessing({
        abortController,
        actionFn: vi.fn(),
        errorAdapter: vi.fn(),
        items: [{ id: 1 }],
        keyFn: (item: { id: number }) => item.id,
        retry: 0,
        setError: vi.fn(),
        setProcessing,
        setProgress: vi.fn(),
        setStatuses: vi.fn() as never,
        setSuccessfulItems,
        successfulItems: [],
        t: (key) => key,
        translations: { errorText: 'Action failed' },
      })
    );

    await waitFor(() => expect(setSuccessfulItems).toHaveBeenCalledWith([]));
    expect(setProcessing).not.toHaveBeenCalled();
  });

  it('records a null status when the parser has no status detail', async () => {
    const statusUpdates: unknown[] = [];
    const setStatuses = vi.fn((update: (value: undefined) => unknown) => {
      statusUpdates.push(update(undefined));
    });

    renderHook(() =>
      useBulkActionProcessing({
        abortController: new AbortController(),
        actionFn: vi.fn(() => Promise.resolve({})),
        errorAdapter: vi.fn(),
        items: [{ id: 1 }],
        keyFn: (item: { id: number }) => item.id,
        retry: 0,
        setError: vi.fn(),
        setProcessing: vi.fn(),
        setProgress: vi.fn(),
        setStatuses: setStatuses as never,
        setSuccessfulItems: vi.fn(),
        statusParser: () => null,
        successfulItems: [],
        t: (key) => key,
        translations: { errorText: 'Action failed' },
      })
    );

    await waitFor(() => expect(statusUpdates).toEqual([{ 1: null }]));
  });
});
