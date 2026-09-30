import { useEffect, useState } from 'react';
import { genericErrorAdapter } from '../PageForm/genericErrorAdapter';
import { ErrorAdapter } from '../PageForm/typesErrorAdapter';
import { BulkActionDialogView } from './BulkActionDialogView';
import { BulkActionDialogProps } from './bulkActionDialogProps';
export type { BulkActionDialogProps } from './bulkActionDialogProps';
export type { StatusWithMessageAndUrl } from './bulkActionDialogTypes';
import { StatusWithMessageAndUrl } from './bulkActionDialogTypes';
import { useBulkActionDialogLogic } from './useBulkActionDialogLogic';
import { usePageDialog } from './PageDialog';

/**
 * BulkActionDialog is a generic dialog for process bulk actions.
 *
 * It processes the actions in parallel up to 5 concurrently.
 * The easiest way to use the BulkActionDialog is then useBulkActionDialog hook.
 */
export function BulkActionDialog<T extends object>(props: BulkActionDialogProps<T>) {
  const viewProps = useBulkActionDialogLogic(props);
  return <BulkActionDialogView<T> {...viewProps} />;
}

/**
 * useBulkActionDialog - react hook to open a BulkActionDialog
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
