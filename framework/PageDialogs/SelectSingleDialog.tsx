import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useCallback } from 'react';
import { ITableColumn, PageTable } from '../PageTable/PageTable';
import { IToolbarFilter } from '../PageTable/PageToolbar';
import { ISelected } from '../PageTable/useTableItems';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { IView } from '../useView';
import { usePageDialog } from './PageDialog';

export type SelectSingleDialogProps<T extends object> = {
  title: string;
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined };
  tableColumns: ITableColumn<T>[];
  toolbarFilters: IToolbarFilter[];
  onSelect: (item: T) => void;
  confirmText?: string;
  cancelText?: string;
  emptyStateTitle?: string;
  errorStateTitle?: string;
};

export function SelectSingleDialog<T extends object>(props: SelectSingleDialogProps<T>) {
  const { title, view, tableColumns, toolbarFilters, confirmText, cancelText, onSelect } = props;
  const [_, setDialog] = usePageDialog();
  const onClose = useCallback(() => setDialog(undefined), [setDialog]);
  const [translations] = useFrameworkTranslations();
  return (
    <Modal
      title={title}
      isOpen
      onClose={onClose}
      variant={ModalVariant.medium}
      tabIndex={0}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          id="confirm"
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
        <Button key="cancel" variant="link" onClick={onClose}>
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
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          {...view}
          emptyStateTitle={props.emptyStateTitle ?? translations.noItemsFound}
          errorStateTitle={props.errorStateTitle ?? translations.errorText}
          disableCardView
          disableListView
          disableColumnManagement
          compact
          disableBodyPadding
          onSelect={(item) => {
            view.unselectAll();
            view.selectItem(item);
          }}
        />
      </div>
    </Modal>
  );
}
