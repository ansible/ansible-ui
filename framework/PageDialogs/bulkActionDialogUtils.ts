import { StatusWithMessageAndUrl } from './bulkActionDialogTypes';

export type BulkCloseStatus = 'success' | 'failures' | 'canceled';

export function resolveBulkCloseStatus(isCanceled: boolean, error: string): BulkCloseStatus {
  if (isCanceled) {
    return 'canceled';
  }
  if (error) {
    return 'failures';
  }
  return 'success';
}

/** Mirrors legacy onClose item partitioning in BulkActionDialog. */
export function partitionBulkActionItemsOnClose<T extends object>(
  items: T[],
  statuses:
    | Record<string | number, string | null | undefined | StatusWithMessageAndUrl>
    | undefined,
  keyFn: (item: T) => string | number
): { successfulItems: T[]; failedItems: T[]; canceledItems: T[] } {
  const successfulItems = items.filter(
    (item) =>
      statuses?.[keyFn(item)] === null ||
      (statuses?.[keyFn(item)] as StatusWithMessageAndUrl | undefined)?.message
  );
  const failedItems = items.filter(
    (item) => statuses?.[keyFn(item)] !== null && typeof statuses?.[keyFn(item)] === 'string'
  );
  const canceledItems = items.filter((item) => statuses?.[keyFn(item)] === undefined);
  return { successfulItems, failedItems, canceledItems };
}
