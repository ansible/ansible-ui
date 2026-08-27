import {
  Button,
  Progress,
  ProgressSize,
  ProgressVariant,
  Modal,
  ModalVariant,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, PendingIcon } from '@patternfly/react-icons';
import pLimit from 'p-limit';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { genericErrorAdapter } from '../PageForm/genericErrorAdapter';
import { ErrorAdapter, GenericErrorDetail } from '../PageForm/typesErrorAdapter';
import { PageTable } from '../PageTable/PageTable';
import { ITableColumn, useVisibleModalColumns } from '../PageTable/PageTableColumn';
import { usePaged } from '../PageTable/useTableItems';
import { pfDanger, pfInfo, pfSuccess } from '../components/pfcolors';
import { useAbortController } from '../hooks/useAbortController';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { usePageDialog } from './PageDialog';

export type StatusWithMessageAndUrl = { message: string; url: string };
export interface BulkActionDialogProps<T extends object> {
  /** The title of the model.
   * @link https://www.patternfly.org/v4/components/modal/design-guidelines#confirmation-dialogs
   */
  title: string;

  /** Optional description that appears below the title. */
  description?: ReactNode | string;

  /** The items to confirm for the bulk action. */
  items: T[];

  /** A function that gets a unique key for each item. */
  keyFn: (item: T) => string | number;

  /** The columns to display when processing the actions. */
  actionColumns: ITableColumn<T>[];

  /** The action function to perform on each item. */
  actionFn: (item: T, signal: AbortSignal) => Promise<unknown>;

  /** Callback when all the actions are complete. Returns the successful items. */
  onComplete?: (successfulItems: T[]) => void;

  /** Callback called when the dialog closes. */
  onClose?: (
    status: 'success' | 'failures' | 'canceled',
    successfulItems: T[],
    failedItems: T[],
    canceledItems: T[]
  ) => void;

  /** The text to show for each item when the action is happening.
   * @example Deleting jobs...
   */
  processingText?: string;

  /** Indicates if this is a destructive operation */
  isDanger?: boolean;

  /** Error adapter used to parse the error message */
  errorAdapter?: ErrorAdapter;

  /** function to parse the response */
  statusParser?: (response: unknown) => null | StatusWithMessageAndUrl;
}

/**
 * BulkActionDialog is a generic dialog for process bulk actions.
 *
 * It processes the actions in parallel up to 5 concurrently.
 * The easiest way to use the BulkActionDialog is then useBulkActionDialog hook.
 *
 * @param {string} title - The title of the model.
 * @param {T[]} items - The items to confirm for the bulk action.
 * @param {function} keyFn - A function that gets a unique key for each item.
 * @param {Array(ITableColumn<T>)} actionColumns - The columns to display when processing the actions.
 * @param {function} actionFn - The action function to perform on each item
 * @param {function=} onComplete - Callback when all the actions are complete. Returns the successful items.
 * @param {function=} onClose - Callback called when the dialog closes.
 * @param {string=} processingText - The text to show for each item when the action is happening.
 * @param {boolean=} isDanger - Indicates if this is a destructive operation.
 * @param {ErrorAdapter} [errorAdapter] - Optional adapter for error handling.
 */
export function BulkActionDialog<T extends object>(props: BulkActionDialogProps<T>) {
  const {
    title,
    keyFn,
    actionColumns,
    actionFn,
    onComplete,
    onClose,
    processingText,
    isDanger,
    errorAdapter = genericErrorAdapter,
    description,
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
    onClose?.(
      isCanceled ? 'canceled' : error ? 'failures' : 'success',
      items.filter(
        (item) =>
          statuses?.[keyFn(item)] === null ||
          (statuses?.[keyFn(item)] as StatusWithMessageAndUrl).message
      ),
      items.filter(
        (item) => statuses?.[keyFn(item)] !== null && typeof statuses?.[keyFn(item)] === 'string'
      ),
      items.filter((item) => statuses?.[keyFn(item)] === undefined)
    );
    onComplete?.(successfulItems);
  }, [error, isCanceled, items, keyFn, onClose, onComplete, setDialog, statuses, successfulItems]);

  const onRetryClicked = useCallback(() => {
    setError('');
    setProcessing(true);
    setStatuses(undefined);
    // Set items for bulk action to include only failed items
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

  const progressVariant = useMemo(() => {
    if (error || isCanceled) return ProgressVariant.danger;
    if (progress === items.length) return ProgressVariant.success;
    return undefined;
  }, [error, isCanceled, items.length, progress]);

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

  const pagination = usePaged(items);

  const modalColumns = useVisibleModalColumns(actionColumns);

  const modalActions = useMemo(() => {
    if (isProcessing) {
      return [
        <Button key="cancel" variant="link" onClick={onCancelClicked}>
          {t('Cancel')}
        </Button>,
      ];
    }
    if (error) {
      return [
        <Button key="retry" variant="primary" onClick={onRetryClicked}>
          {t('Retry')}
        </Button>,
        <Button key="close" variant="secondary" onClick={onCloseClicked}>
          {t('Close')}
        </Button>,
      ];
    }
    return [];
  }, [error, isProcessing, onCancelClicked, onCloseClicked, onRetryClicked, t]);

  return (
    <Modal
      ouiaId={title}
      variant={ModalVariant.medium}
      isOpen
      onClose={() => {
        onCancelClicked();
        onCloseClicked();
      }}
      aria-label={title}
    >
      <ModalHeader
        title={title}
        titleIconVariant={isDanger ? 'warning' : undefined}
        description={description}
      />
      <ModalBody style={{ paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 560,
            overflow: 'hidden',
            borderTop: 'var(--pf-t--global--border--color--default)',
          }}
        >
          <PageTable<T>
            key="status"
            pageItems={[...pagination.paged]}
            itemCount={items.length}
            tableColumns={[
              ...modalColumns,
              {
                header: t(`Status`),
                cell: (item) => {
                  const key = keyFn(item);
                  const status = statuses?.[key];
                  if (status === undefined) {
                    return (
                      <span style={{ color: pfInfo }}>
                        {<PendingIcon />}&nbsp; {translations.pendingText}
                      </span>
                    );
                  }
                  if (status === null) {
                    return (
                      <span style={{ color: pfSuccess }}>
                        {<CheckCircleIcon />}&nbsp; {translations.successText}
                      </span>
                    );
                  }
                  if (
                    (status as StatusWithMessageAndUrl).message &&
                    (status as StatusWithMessageAndUrl).url
                  ) {
                    return (
                      <a href={(status as StatusWithMessageAndUrl).url}>
                        {(status as StatusWithMessageAndUrl).message}
                      </a>
                    );
                  }
                  return (
                    <span style={{ color: pfDanger }}>
                      {<ExclamationCircleIcon />}&nbsp; {statuses?.[key] as string}
                    </span>
                  );
                },
              },
            ]}
            keyFn={keyFn}
            // pagination={pagination}
            compact
            errorStateTitle=""
            emptyStateTitle={t('No items')}
            autoHidePagination={true}
            disableBodyPadding
            {...pagination}
          />
        </div>
      </ModalBody>
      <ModalBody style={{ paddingTop: 0 }}>
        <Progress
          data-cy="progress"
          data-testid="progress"
          value={(progress / items.length) * 100}
          title={progressTitle}
          size={ProgressSize.lg}
          variant={progressVariant}
        />
      </ModalBody>
      <ModalFooter>{modalActions}</ModalFooter>
    </Modal>
  );
}

/**
 * useBulkActionDialog - react hook to open a BulkActionDialog
 *
 * @template T - The type of the items on which the bulk action will be performed.
 * @param {ErrorAdapter} [defaultErrorAdapter = genericErrorAdapter] - Optional default adapter for error handling.
 * @returns {(props: BulkActionDialogProps<T>) => void} - A function to set the properties of the BulkActionDialog.
 * @example
 * const openBulkActionDialog = useBulkActionDialog()
 * openBulkActionDialog(...) // Pass BulkActionDialogProps
 */
export function useBulkActionDialog<T extends object>(
  defaultErrorAdapter: ErrorAdapter = genericErrorAdapter,
  statusParser?: (response: unknown) => null | StatusWithMessageAndUrl
) {
  const [_, setDialog] = usePageDialog();
  const [props, setProps] = useState<BulkActionDialogProps<T>>();
  useEffect(() => {
    if (props) {
      const onCloseHandler = (
        status: 'success' | 'failures' | 'canceled',
        successfulItems: T[],
        failedItems: T[],
        canceledItems: T[]
      ) => {
        setProps(undefined);
        props.onClose?.(status, successfulItems, failedItems, canceledItems);
      };
      setDialog(
        <BulkActionDialog<T>
          {...props}
          errorAdapter={props.errorAdapter ?? defaultErrorAdapter}
          statusParser={props.statusParser ?? statusParser}
          onClose={onCloseHandler}
        />
      );
    } else {
      setDialog(undefined);
    }
  }, [props, setDialog, defaultErrorAdapter, statusParser]);
  return setProps;
}
