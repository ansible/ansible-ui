import { describe, expect, it, vi } from 'vitest';
import { runBulkActionItems } from './runBulkActionItems';

describe('runBulkActionItems', () => {
  it('runs actions with concurrency and reports progress', async () => {
    const actionFn = vi.fn().mockResolvedValue(undefined);
    const onProgress = vi.fn();
    const onStatusPatch = vi.fn();
    const onBatchError = vi.fn();

    const successful = await runBulkActionItems({
      items: [{ id: 1 }, { id: 2 }],
      keyFn: (item) => item.id,
      actionFn,
      signal: new AbortController().signal,
      errorAdapter: () => ({ genericErrors: [], fieldErrors: [] }),
      t: (key) => key,
      onProgress,
      onStatusPatch,
      onBatchError,
    });

    expect(successful).toHaveLength(2);
    expect(actionFn).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenCalledWith(1);
    expect(onProgress).toHaveBeenCalledWith(2);
    expect(onStatusPatch).toHaveBeenCalledWith(1, null);
    expect(onBatchError).not.toHaveBeenCalled();
  });

  it('records adapter-parsed errors', async () => {
    const onStatusPatch = vi.fn();
    const onBatchError = vi.fn();
    const actionFn = vi.fn().mockRejectedValue(new Error('fail'));

    await runBulkActionItems({
      items: [{ id: 1 }],
      keyFn: (item) => item.id,
      actionFn,
      signal: new AbortController().signal,
      errorAdapter: () => ({
        genericErrors: [{ message: 'Conflict' }],
        fieldErrors: [],
      }),
      t: (key) => key,
      onProgress: vi.fn(),
      onStatusPatch,
      onBatchError,
    });

    expect(onStatusPatch).toHaveBeenCalledWith(1, 'Conflict');
    expect(onBatchError).toHaveBeenCalledTimes(1);
  });

  it('uses statusParser success shape when provided', async () => {
    const onStatusPatch = vi.fn();
    await runBulkActionItems({
      items: [{ id: 1 }],
      keyFn: (item) => item.id,
      actionFn: vi.fn().mockResolvedValue({ ok: true }),
      signal: new AbortController().signal,
      errorAdapter: () => ({ genericErrors: [], fieldErrors: [] }),
      statusParser: () => ({ message: 'Linked', url: 'https://x.test' }),
      t: (key) => key,
      onProgress: vi.fn(),
      onStatusPatch,
      onBatchError: vi.fn(),
    });

    expect(onStatusPatch).toHaveBeenCalledWith(1, {
      message: 'Linked',
      url: 'https://x.test',
    });
  });
});
