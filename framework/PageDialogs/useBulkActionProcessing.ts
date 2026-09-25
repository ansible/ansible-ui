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
  successfulItems: T[];
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
    successfulItems,
    t,
    translations,
  } = props;

  useEffect(() => {
    function updateSuccessState(key: string | number, response: unknown) {
      if (abortController.signal.aborted) {
        return;
      }
      let successState = undefined;
      if (statusParser) {
        successState = statusParser(response);
      }
      setStatuses((statuses) => ({
        ...(statuses ?? {}),
        [key]: successState !== undefined ? successState : null,
      }));
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
        const message =
          typeof parsedErrors[0].message === 'string' && parsedErrors.length === 1
            ? parsedErrors[0].message
            : t(`Unknown error`);
        setStatuses((statuses) => ({
          ...(statuses ?? {}),
          [key]: message,
        }));
      } else {
        setStatuses((statuses) => ({
          ...(statuses ?? {}),
          [key]: t(`Unknown error`),
        }));
      }
      setError(translations.errorText);
    }

    async function process() {
      const limit = pLimit(5);
      let progress = 0;
      const successfulItemsArray: T[] = [];
      await Promise.all(
        items.map((item: T) =>
          limit(async () => {
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
          })
        )
      );
      setSuccessfulItems([...successfulItems, ...successfulItemsArray]);
      if (!abortController.signal.aborted) {
        setProcessing(false);
      }
    }

    void process();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    abortController,
    actionFn,
    items,
    keyFn,
    translations.errorText,
    t,
    errorAdapter,
    statusParser,
    retry,
  ]);
}
