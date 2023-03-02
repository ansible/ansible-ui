import {
  Alert,
  Button,
  Checkbox,
  Icon,
  Modal,
  ModalBoxBody,
  ModalVariant,
  Tooltip,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BulkActionDialogProps, useBulkActionDialog } from './BulkActionDialog';
import { usePageDialog } from './PageDialog';
import { ITableColumn, PageTable } from './PageTable/PageTable';
import { usePaged } from './PageTable/useTableItems';
import { useFrameworkTranslations } from './useFrameworkTranslations';
import { compareStrings } from './utils/compare';

export interface BulkConfirmationDialog<T extends object> {
  /** The title of the model.
   * @link https://www.patternfly.org/v4/components/modal/design-guidelines#confirmation-dialogs
   */
  title: string;

  /** The prompt/description that shows up under the confirmation title. */
  prompt?: string;

  /** Alert prompts that shows up under the confirmation title. */
  alertPrompts?: string[];

  /** The items to confirm for the bulk action. */
  items: T[];

  /** A function that determines that whether an action cannot be performed on a selected item
   * (so that this item can be identified in the confirmation dialog) and returns a tooltip
   * that can be displayed with the non-actionable row */
  isItemNonActionable?: (item: T) => string | undefined;

  /** A function that gets a unique key for each item. */
  keyFn: (item: T) => string | number;

  /** The columns to display for confirmation. */
  confirmationColumns: ITableColumn<T>[];

  /** Callback called when the user confirms. */
  onConfirm: () => void;

  /** Callback called when the dialog closes. */
  onClose?: () => void;

  /** The prompt to show for the user to confirm the bulk action. */
  confirmText: string;

  /** The button text to perform the action. */
  actionButtonText: string;

  /** Indicates if this is a destructive operation */
  isDanger?: boolean;
}

function BulkConfirmationDialog<T extends object>(props: BulkConfirmationDialog<T>) {
  const {
    title,
    items,
    keyFn,
    prompt,
    alertPrompts,
    confirmationColumns,
    isItemNonActionable,
    onConfirm,
    onClose,
    confirmText,
    actionButtonText,
    isDanger,
  } = props;
  const [_, setDialog] = usePageDialog();
  const [translations] = useFrameworkTranslations();
  const onCloseClicked = useCallback(() => {
    setDialog(undefined);
    onClose?.();
  }, [onClose, setDialog]);

  // Non-actionable rows appear first
  const sortedItems = useMemo<T[]>(() => {
    if (isItemNonActionable && items.some(isItemNonActionable)) {
      return items.sort((l, r) => compareStrings(isItemNonActionable(l), isItemNonActionable(r)));
    }
    return items;
  }, [items, isItemNonActionable]);

  const { paged, page, perPage, setPage, setPerPage } = usePaged(sortedItems);
  const [confirmed, setConfirmed] = useState(!confirmText);
  /**
   * If there are non-actionable rows, the first column will contain exclamation icons
   * to identify the non-actionable rows.
   */
  const columnsForConfirmation: ITableColumn<T>[] = useMemo<ITableColumn<T>[]>(() => {
    if (isItemNonActionable && items.some(isItemNonActionable)) {
      return [
        {
          header: '',
          cell: (item: T) =>
            isItemNonActionable(item) ? (
              <Tooltip
                content={isItemNonActionable(item)}
                trigger={isItemNonActionable(item) ? undefined : 'manual'}
              >
                <Icon status="warning">
                  <ExclamationTriangleIcon />
                </Icon>
              </Tooltip>
            ) : null,
        },
        ...confirmationColumns,
      ];
    }
    return confirmationColumns;
  }, [confirmationColumns, isItemNonActionable, items]);

  const actionableItems = useMemo<T[]>(() => {
    if (isItemNonActionable) {
      return items.filter((item) => !isItemNonActionable(item));
    }
    return items;
  }, [isItemNonActionable, items]);

  return (
    <Modal
      titleIconVariant={isDanger ? 'warning' : undefined}
      title={title}
      description={prompt}
      variant={ModalVariant.medium}
      isOpen
      onClose={onCloseClicked}
      actions={[
        <Button
          key="submit"
          variant={isDanger ? 'danger' : 'primary'}
          onClick={() => {
            onCloseClicked();
            onConfirm();
          }}
          isAriaDisabled={!confirmed}
        >
          {actionButtonText}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          {translations.cancelText}
        </Button>,
      ]}
      hasNoBodyWrapper
    >
      {items.length > 0 && (
        <ModalBoxBody style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 560,
              overflow: 'hidden',
              borderTop: 'thin solid var(--pf-global--BorderColor--100)',
            }}
          >
            {alertPrompts &&
              alertPrompts.length > 0 &&
              alertPrompts.map((alertPrompt, i) => (
                <Alert isInline title={alertPrompt} variant="warning" key={i}></Alert>
              ))}
            <PageTable<T>
              key="items"
              pageItems={paged}
              itemCount={items.length}
              tableColumns={columnsForConfirmation}
              keyFn={keyFn}
              page={page}
              perPage={perPage}
              setPage={setPage}
              setPerPage={setPerPage}
              compact
              errorStateTitle="Error"
              emptyStateTitle="No items"
              autoHidePagination={true}
              disableBodyPadding
            />
          </div>
          {confirmText && actionableItems.length > 0 && (
            <div style={{ marginLeft: 32, height: 64, display: 'flex', alignItems: 'center' }}>
              <Checkbox
                id="confirm"
                label={confirmText}
                isChecked={confirmed}
                onChange={setConfirmed}
              />
            </div>
          )}
        </ModalBoxBody>
      )}
    </Modal>
  );
}

function useBulkConfirmationDialog<T extends object>() {
  const [_, setDialog] = usePageDialog();
  const [props, setProps] = useState<BulkConfirmationDialog<T>>();
  useEffect(() => {
    if (props) {
      const onCloseHandler = () => {
        setProps(undefined);
        props.onClose?.();
      };
      setDialog(<BulkConfirmationDialog<T> {...props} onClose={onCloseHandler} />);
    } else {
      setDialog(undefined);
    }
  }, [props, setDialog]);
  return setProps;
}

export function useBulkConfirmation<T extends object>() {
  const bulkConfirmationDialog = useBulkConfirmationDialog<T>();
  const bulkActionDialog = useBulkActionDialog<T>();
  return useCallback(
    (
      options: Omit<BulkConfirmationDialog<T>, 'onConfirm' | 'onClose'> &
        Omit<BulkActionDialogProps<T>, 'onClose'>
    ) => {
      const bulkActionOptions = Object.assign({}, options);
      if (options.isItemNonActionable && options.isItemNonActionable !== undefined) {
        bulkActionOptions.items = options.items.filter(
          (item) => options.isItemNonActionable !== undefined && !options.isItemNonActionable(item)
        );
      }
      return bulkConfirmationDialog({
        ...options,
        onConfirm: () => bulkActionDialog(bulkActionOptions),
      });
    },
    [bulkActionDialog, bulkConfirmationDialog]
  );
}
