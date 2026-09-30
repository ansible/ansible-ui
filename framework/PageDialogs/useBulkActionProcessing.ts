import { Dispatch, SetStateAction, useEffect } from 'react';
import pLimit from 'p-limit';
import { ErrorAdapter, GenericErrorDetail } from '../PageForm/typesErrorAdapter';
import type { StatusWithMessageAndUrl } from './BulkActionDialog';

type BulkActionStatus = string | null | undefined | StatusWithMessageAndUrl;
type BulkActionStatuses = Record<string | number, BulkActionStatus>;

export interface BulkActionProcessingProps<T extends object> {
  abortController: AbortController;
  actionFn: (item: T, signal: AbortSignal) => Promise<unknown>;
  errorAdapter: ErrorAdapter;
  items: T[];
  keyFn: (item: T) => string | number;
  retry: number;
  setError: Dispatch<SetStateAction<string>>;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  setProgress: Dispatch<SetStateAction<number>>;
  setStatuses: Dispatch<SetStateAction<BulkActionStatuses | undefined>>;
  setSuccessfulItems: Dispatch<SetStateAction<T[]>>;
  statusParser?: (response: unknown) => null | StatusWithMessageAndUrl;
  t: (key: string) => string;
  translations: { errorText: string };
}

export function useBulkActionProcessing<T extends object>(props: BulkActionProcessingProps<T>) {
  const {
    abortController,
    actionFn,
    errorAdapter,
    items,
    keyFn,
    retry,
    setError,
    setProcessing,
    setProgress,
    setStatuses,
    setSuccessfulItems,
    statusParser,
    t,
    translations,
  } = props;

  useEffect(() => {
    function updateStatus(key: string | number, status: BulkActionStatus) {
      setStatuses((statuses) => (statuses ? { ...statuses, [key]: status } : { [key]: status }));
    }

    function updateSuccessState(key: string | number, response: unknown) {
      if (abortController.signal.aborted) {
        return;
      }
      let successState = undefined;
      if (statusParser) {
        successState = statusParser(response);
      }
      updateStatus(key, successState !== undefined ? successState : null);
    }

    function updateErrorState(
      key: string | number,
      parsedErrors: GenericErrorDetail[],
      err: unknown
    ) {
      if (abortController.signal.aborted) {
        return;
      }
      if (err instanceof Error) {
        const firstError = parsedErrors[0];
        const message =
          parsedErrors.length === 1 && firstError && typeof firstError.message === 'string'
            ? firstError.message
            : t(`Unknown error`);
        updateStatus(key, message);
      } else {
        updateStatus(key, t(`Unknown error`));
      }
      setError(translations.errorText);
    }

    let progress = 0;
    const successfulItemsArray: T[] = [];
    async function processItem(item: T) {
      if (abortController.signal.aborted) return;
      const key = keyFn(item);
      try {
        const response = await actionFn(item, abortController.signal);
        updateSuccessState(key, response);
        successfulItemsArray.push(item);
      } catch (err) {
        const { genericErrors, fieldErrors } = errorAdapter(err);
        const parsedErrors = [...genericErrors, ...fieldErrors.filter((e) => e.message)];
        updateErrorState(key, parsedErrors, err);
      } finally {
        if (!abortController.signal.aborted) {
          setProgress(++progress);
        }
      }
    }

    const limit = pLimit(5);
    const tasks = items.map((item: T) => limit(() => processItem(item)));
    async function process() {
      await Promise.all(tasks);
      setSuccessfulItems((prev) => [...prev, ...successfulItemsArray]);
      if (!abortController.signal.aborted) {
        setProcessing(false);
      }
    }

    void process();
  }, [
    abortController,
    actionFn,
    errorAdapter,
    items,
    keyFn,
    retry,
    setError,
    setProcessing,
    setProgress,
    setStatuses,
    setSuccessfulItems,
    statusParser,
    t,
    translations.errorText,
  ]);
}
