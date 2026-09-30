import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { genericErrorAdapter } from '../PageForm/genericErrorAdapter';
import { useAbortController } from '../hooks/useAbortController';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { usePageDialog } from './PageDialog';
import { BulkActionDialogProps } from './bulkActionDialogProps';
import { partitionBulkActionItemsOnClose, resolveBulkCloseStatus } from './bulkActionDialogUtils';
import { StatusWithMessageAndUrl } from './bulkActionDialogTypes';
import { runBulkActionItems } from './runBulkActionItems';

export function useBulkActionDialogLogic<T extends object>(props: BulkActionDialogProps<T>) {
  const {
    keyFn,
    actionFn,
    onComplete,
    onClose,
    processingText,
    errorAdapter = genericErrorAdapter,
    statusParser,
  } = props;
  const { t } = useTranslation();
  const [items, setItems] = useState<T[]>(props.items);
  const [translations] = useFrameworkTranslations();
  const [isProcessing, setProcessing] = useState(true);
  const [retry, setRetry] = useState(0);
  const [isCanceled, setCanceled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [statuses, setStatuses] =
    useState<Record<string | number, string | null | undefined | StatusWithMessageAndUrl>>();
  const abortController = useAbortController();
  const [_, setDialog] = usePageDialog();
  const [successfulItems, setSuccessfulItems] = useState<T[]>([]);

  const onCancelClicked = useCallback(() => {
    setCanceled(true);
    abortController.abort();
    setProcessing(false);
    setStatuses((statuses) => {
      const newStatuses = { ...statuses };
      for (const item of items) {
        const key = keyFn(item);
        if (newStatuses[key] === undefined) {
          newStatuses[key] = t('Cancelled');
        }
      }
      return newStatuses;
    });
  }, [abortController, items, keyFn, t]);

  const onCloseClicked = useCallback(() => {
    setDialog(undefined);
    const {
      successfulItems: successful,
      failedItems,
      canceledItems,
    } = partitionBulkActionItemsOnClose(items, statuses, keyFn);
    onClose?.(resolveBulkCloseStatus(isCanceled, error), successful, failedItems, canceledItems);
    onComplete?.(successfulItems);
  }, [error, isCanceled, items, keyFn, onClose, onComplete, setDialog, statuses, successfulItems]);

  const onRetryClicked = useCallback(() => {
    setError('');
    setProcessing(true);
    setStatuses(undefined);
    setItems(
      items.filter(
        (item) => statuses?.[keyFn(item)] !== null && typeof statuses?.[keyFn(item)] === 'string'
      )
    );
    setRetry(retry + 1);
  }, [items, keyFn, retry, statuses]);

  const progressTitle = useMemo(() => {
    if (abortController.signal.aborted) return translations.canceledText;
    if (error) return translations.errorText;
    if (!isProcessing) return translations.successText;
    return processingText ?? translations.processingText;
  }, [
    abortController.signal.aborted,
    error,
    isProcessing,
    processingText,
    translations.canceledText,
    translations.errorText,
    translations.processingText,
    translations.successText,
  ]);

  useEffect(() => {
    async function process() {
      const batchSuccessful = await runBulkActionItems({
        items,
        keyFn,
        actionFn,
        signal: abortController.signal,
        errorAdapter,
        statusParser,
        t,
        onProgress: setProgress,
        onStatusPatch: (key, status) => {
          setStatuses((statuses) => ({
            ...(statuses ?? {}),
            [key]: status,
          }));
        },
        onBatchError: () => setError(translations.errorText),
      });
      setSuccessfulItems((previous) => [...previous, ...batchSuccessful]);
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
    onComplete,
    translations.errorText,
    t,
    errorAdapter,
    statusParser,
    retry,
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isProcessing && !error) {
      timer = setTimeout(() => {
        onCloseClicked();
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isProcessing, error, onCloseClicked]);

  return {
    items,
    keyFn,
    actionColumns: props.actionColumns,
    title: props.title,
    description: props.description,
    isDanger: props.isDanger,
    isProcessing,
    error,
    isCanceled,
    progress,
    statuses,
    progressTitle,
    translations,
    t,
    onCancelClicked,
    onCloseClicked,
    onRetryClicked,
  };
}

export type BulkActionDialogViewProps<T extends object> = ReturnType<
  typeof useBulkActionDialogLogic<T>
>;
