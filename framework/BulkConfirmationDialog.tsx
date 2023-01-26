import { Alert, Button, Checkbox, Modal, ModalBoxBody, ModalVariant } from '@patternfly/react-core';
import { useCallback, useEffect, useState } from 'react';
import { BulkActionDialogProps, useBulkActionDialog } from './BulkActionDialog';
import { usePageDialog } from './PageDialog';
import { ITableColumn, PageTable } from './PageTable/PageTable';
import { usePaged } from './PageTable/useTableItems';
import { useFrameworkTranslations } from './useFrameworkTranslations';

export interface BulkConfirmationDialog<T extends object> {
  /** The title of the model.
   * @link https://www.patternfly.org/v4/components/modal/design-guidelines#confirmation-dialogs
   */
  title: string;

  /** The prompt that shows up under the confirmation title. */
  prompt?: string;

  /** Alert prompt that shows up under the confirmation title. (appears as a notification) */
  alertPrompt?: string;

  /** The items to confirm for the bulk action. */
  items: T[];

  /** Actionable items for the bulk action. */
  actionableItems?: T[];

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
    alertPrompt,
    confirmationColumns,
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
  const { paged, page, perPage, setPage, setPerPage } = usePaged(items);
  const [confirmed, setConfirmed] = useState(!confirmText);
  return (
    <Modal
      titleIconVariant={isDanger ? 'warning' : undefined}
      title={title}
      description={
        alertPrompt ? (
          <Alert isInline title={alertPrompt} variant="danger"></Alert>
        ) : prompt ? (
          prompt
        ) : undefined
      }
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
            <PageTable<T>
              key="items"
              pageItems={paged}
              itemCount={items.length}
              tableColumns={confirmationColumns}
              keyFn={keyFn}
              page={page}
              perPage={perPage}
              setPage={setPage}
              setPerPage={setPerPage}
              compact
              errorStateTitle="Error"
              emptyStateTitle="No items"
            />
          </div>
          {confirmText && (
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
      if (options.actionableItems) {
        bulkActionOptions.items = options.actionableItems;
      }
      return bulkConfirmationDialog({
        ...options,
        onConfirm: () => bulkActionDialog(bulkActionOptions),
      });
    },
    [bulkActionDialog, bulkConfirmationDialog]
  );
}
