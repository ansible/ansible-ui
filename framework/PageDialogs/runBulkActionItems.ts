import pLimit from 'p-limit';
import { genericErrorAdapter } from '../PageForm/genericErrorAdapter';
import { ErrorAdapter, GenericErrorDetail } from '../PageForm/typesErrorAdapter';
import { StatusWithMessageAndUrl } from './bulkActionDialogTypes';

export type BulkItemStatus = string | null | undefined | StatusWithMessageAndUrl;

export interface RunBulkActionItemsOptions<T extends object> {
  items: T[];
  keyFn: (item: T) => string | number;
  actionFn: (item: T, signal: AbortSignal) => Promise<unknown>;
  signal: AbortSignal;
  errorAdapter: ErrorAdapter;
  statusParser?: (response: unknown) => null | StatusWithMessageAndUrl;
  t: (key: string) => string;
  onProgress: (completedCount: number) => void;
  onStatusPatch: (key: string | number, status: BulkItemStatus) => void;
  onBatchError: () => void;
}

export async function runBulkActionItems<T extends object>(
  options: RunBulkActionItemsOptions<T>
): Promise<T[]> {
  const {
    items,
    keyFn,
    actionFn,
    signal,
    errorAdapter = genericErrorAdapter,
    statusParser,
    t,
    onProgress,
    onStatusPatch,
    onBatchError,
  } = options;

  const limit = pLimit(5);
  let completed = 0;
  const successfulItems: T[] = [];

  function updateSuccessState(key: string | number, response: unknown) {
    if (signal.aborted) {
      return;
    }
    let successState: null | StatusWithMessageAndUrl | undefined = undefined;
    if (statusParser) {
      successState = statusParser(response);
    }
    onStatusPatch(key, successState !== undefined ? successState : null);
  }

  function updateErrorState(
    key: string | number,
    parsedErrors: GenericErrorDetail[],
    err: unknown
  ) {
    if (signal.aborted) {
      return;
    }
    if (err instanceof Error) {
      const message =
        typeof parsedErrors[0]?.message === 'string' && parsedErrors.length === 1
          ? parsedErrors[0].message
          : t(`Unknown error`);
      onStatusPatch(key, message);
    } else {
      onStatusPatch(key, t(`Unknown error`));
    }
    onBatchError();
  }

  await Promise.all(
    items.map((item) =>
      limit(async () => {
        if (signal.aborted) {
          return;
        }
        const key = keyFn(item);
        try {
          const response = await actionFn(item, signal);
          updateSuccessState(key, response);
          successfulItems.push(item);
        } catch (err) {
          const { genericErrors, fieldErrors } = errorAdapter(err);
          const parsedErrors = [...genericErrors, ...fieldErrors.filter((e) => e.message)];
          updateErrorState(key, parsedErrors, err);
        } finally {
          if (!signal.aborted) {
            completed += 1;
            onProgress(completed);
          }
        }
      })
    )
  );

  return successfulItems;
}
