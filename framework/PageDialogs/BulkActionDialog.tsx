import {
  Button,
  Modal,
  ModalBoxBody,
  ModalVariant,
  Progress,
  ProgressSize,
  ProgressVariant,
} from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon, PendingIcon } from '@patternfly/react-icons';
import pLimit from 'p-limit';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAbortController } from '../../frontend/common/crud/useAbortController';
import { genericErrorAdapter } from '../PageForm/genericErrorAdapter';
import { ErrorAdapter } from '../PageForm/typesErrorAdapter';
import { PageTable } from '../PageTable/PageTable';
import { ITableColumn, useVisibleModalColumns } from '../PageTable/PageTableColumn';
import { usePaged } from '../PageTable/useTableItems';
import { pfDanger, pfInfo, pfSuccess } from '../components/pfcolors';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { usePageDialog } from './PageDialog';

export interface BulkActionDialogProps<T extends object> {
  /** The title of the model.
   * @link https://www.patternfly.org/v4/components/modal/design-guidelines#confirmation-dialogs
   */
  title: string;

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
  onClose?: () => void;

  /** The text to show for each item when the action is happening.
   * @example Deleting jobs...
   */
  processingText?: string;

  /** Indicates if this is a destructive operation */
  isDanger?: boolean;

  /** Error adapter used to parse the error message */
  errorAdapter?: ErrorAdapter;
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
    items,
    keyFn,
    actionColumns,
    actionFn,
    onComplete,
    onClose,
    processingText,
    isDanger,
    errorAdapter = genericErrorAdapter,
  } = props;
  const { t } = useTranslation();
  const [translations] = useFrameworkTranslations();
  const [isProcessing, setProcessing] = useState(true);
  const [isCanceled, setCanceled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [statuses, setStatuses] = useState<Record<string | number, string | null | undefined>>();
  const abortController = useAbortController();
  const [_, setDialog] = usePageDialog();

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
    onClose?.();
  }, [onClose, setDialog]);

  useEffect(() => {
    async function process() {
      const limit = pLimit(5);
      let progress = 0;
      const successfulItems: T[] = [];
      await Promise.all(
        items.map((item: T) =>
          limit(async () => {
            if (abortController.signal.aborted) return;
            const key = keyFn(item);
            try {
              await actionFn(item, abortController.signal);
              if (!abortController.signal.aborted) {
                setStatuses((statuses) => ({ ...(statuses ?? {}), [key]: null }));
              }
              successfulItems.push(item);
            } catch (err) {
              const { genericErrors, fieldErrors } = errorAdapter(err);
              const parsedErrors = [...genericErrors, ...fieldErrors.filter((e) => e.message)];
              if (!abortController.signal.aborted) {
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
            } finally {
              if (!abortController.signal.aborted) {
                setProgress(++progress);
              }
            }
          })
        )
      );
      if (!abortController.signal.aborted) {
        setProcessing(false);
      }
      onComplete?.(successfulItems);
    }
    void process();
  }, [
    abortController,
    actionFn,
    items,
    keyFn,
    onComplete,
    translations.errorText,
    t,
    errorAdapter,
  ]);

  const pagination = usePaged(items);

  const modalColumns = useVisibleModalColumns(actionColumns);

  return (
    <Modal
      titleIconVariant={isDanger ? 'warning' : undefined}
      title={title}
      ouiaId={title}
      aria-label={title}
      variant={ModalVariant.medium}
      isOpen
      onClose={() => {
        onCancelClicked();
        onCloseClicked();
      }}
      actions={
        isProcessing
          ? [
              <Button key="cancel" variant="link" onClick={onCancelClicked}>
                {translations.cancelText}
              </Button>,
            ]
          : [
              <Button key="close" variant="secondary" onClick={onCloseClicked}>
                {translations.closeText}
              </Button>,
            ]
      }
      hasNoBodyWrapper
    >
      <ModalBoxBody style={{ paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 560,
            overflow: 'hidden',
            borderTop: 'thin solid var(--pf-v5-global--BorderColor--100)',
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
                  return (
                    <span style={{ color: pfDanger }}>
                      {<ExclamationCircleIcon />}&nbsp; {statuses?.[key]}
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
      </ModalBoxBody>
      <ModalBoxBody style={{ paddingTop: 0 }}>
        <Progress
          data-cy="progress"
          value={(progress / items.length) * 100}
          title={
            abortController.signal.aborted
              ? translations.canceledText
              : error
                ? translations.errorText
                : !isProcessing
                  ? translations.successText
                  : processingText ?? translations.processingText
          }
          size={ProgressSize.lg}
          variant={
            error || isCanceled
              ? ProgressVariant.danger
              : progress === items.length
                ? ProgressVariant.success
                : undefined
          }
        />
      </ModalBoxBody>
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
  defaultErrorAdapter: ErrorAdapter = genericErrorAdapter
) {
  const [_, setDialog] = usePageDialog();
  const [props, setProps] = useState<BulkActionDialogProps<T>>();
  useEffect(() => {
    if (props) {
      const onCloseHandler = () => {
        setProps(undefined);
        props.onClose?.();
      };
      setDialog(
        <BulkActionDialog<T>
          {...props}
          errorAdapter={props.errorAdapter ?? defaultErrorAdapter}
          onClose={onCloseHandler}
        />
      );
    } else {
      setDialog(undefined);
    }
  }, [props, setDialog, defaultErrorAdapter]);
  return setProps;
}
