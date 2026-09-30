import { describe, expect, it } from 'vitest';
import { partitionBulkActionItemsOnClose, resolveBulkCloseStatus } from './bulkActionDialogUtils';

describe('resolveBulkCloseStatus', () => {
  it('returns canceled when the dialog was canceled', () => {
    expect(resolveBulkCloseStatus(true, '')).toBe('canceled');
    expect(resolveBulkCloseStatus(true, 'Error')).toBe('canceled');
  });

  it('returns failures when not canceled and error is set', () => {
    expect(resolveBulkCloseStatus(false, 'Error')).toBe('failures');
  });

  it('returns success when not canceled and error is empty', () => {
    expect(resolveBulkCloseStatus(false, '')).toBe('success');
  });
});

describe('partitionBulkActionItemsOnClose', () => {
  const items = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
  const keyFn = (item: { id: number }) => item.id;

  it('partitions items by status the same way as onClose', () => {
    const statuses = {
      1: null,
      2: 'failed',
      3: undefined,
      4: { message: 'Done', url: 'https://example.com' },
    };

    const { successfulItems, failedItems, canceledItems } = partitionBulkActionItemsOnClose(
      items,
      statuses,
      keyFn
    );

    expect(successfulItems.map((i) => i.id)).toEqual([1, 4]);
    expect(failedItems.map((i) => i.id)).toEqual([2]);
    expect(canceledItems.map((i) => i.id)).toEqual([3]);
  });
});
