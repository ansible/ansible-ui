import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useCallback } from 'react';
import { PageTable } from '../PageTable/PageTable';
import { ITableColumn, useVisibleModalColumns } from '../PageTable/PageTableColumn';
import { ISelected } from '../PageTable/useTableItems';
import { IToolbarFilter } from '../PageToolbar/PageToolbarFilter';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { IView } from '../useView';
import { usePageDialog } from './PageDialog';

export type SingleSelectDialogProps<T extends object> = {
  title: string;
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined };
  tableColumns: ITableColumn<T>[];
  toolbarFilters: IToolbarFilter[];
  onSelect: (item: T) => void;
  confirmText?: string;
  cancelText?: string;
  emptyStateTitle?: string;
  errorStateTitle?: string;
  onClose?: () => void;
};

export function SingleSelectDialog<T extends object>(props: SingleSelectDialogProps<T>) {
  const { title, view, tableColumns, toolbarFilters, confirmText, cancelText, onSelect } = props;
  const [_, setDialog] = usePageDialog();
  let onClose = useCallback(() => setDialog(undefined), [setDialog]);
  if (props.onClose) {
    onClose = props.onClose;
  }

  const [translations] = useFrameworkTranslations();
  const modalColumns = useVisibleModalColumns(tableColumns);
  return (
    <Modal
      title={title}
      aria-label={title}
      ouiaId={title}
      isOpen
      onClose={onClose}
      variant={ModalVariant.medium}
      tabIndex={0}
      actions={[
        <Button
          key="submit"
          variant="primary"
          id="submit"
          onClick={() => {
            onClose();
            if (view.selectedItems.length > 0) {
              onSelect(view.selectedItems[0]);
            }
          }}
          isAriaDisabled={view.selectedItems.length === 0}
        >
          {confirmText ?? translations.confirmText}
        </Button>,
        <Button id="cancel" key="cancel" variant="link" onClick={onClose}>
          {cancelText ?? translations.cancelText}
        </Button>,
      ]}
      hasNoBodyWrapper
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 500,
          overflow: 'hidden',
        }}
      >
        <PageTable<T>
          tableColumns={modalColumns}
          toolbarFilters={toolbarFilters}
          {...view}
          emptyStateTitle={props.emptyStateTitle ?? translations.noItemsFound}
          errorStateTitle={props.errorStateTitle ?? translations.errorText}
          disableCardView
          disableListView
          compact
          disableBodyPadding
          onSelect={() => {
            // do nothing
          }}
          autoHidePagination
        />
      </div>
    </Modal>
  );
}
