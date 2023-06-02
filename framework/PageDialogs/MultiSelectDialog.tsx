import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useCallback } from 'react';
import { PageTable } from '../PageTable/PageTable';
import { ITableColumn } from '../PageTable/PageTableColumn';
import { IToolbarFilter } from '../PageTable/PageToolbar/PageToolbarFilter';
import { ISelected } from '../PageTable/useTableItems';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { IView } from '../useView';
import { usePageDialog } from './PageDialog';

export type MultiSelectDialogProps<T extends object> = {
  title: string;
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined };
  tableColumns: ITableColumn<T>[];
  toolbarFilters: IToolbarFilter[];
  onSelect: (items: T[]) => void;
  confirmText?: string;
  cancelText?: string;
  emptyStateTitle?: string;
  errorStateTitle?: string;
};

export function MultiSelectDialog<T extends object>(props: MultiSelectDialogProps<T>) {
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
            onSelect(view.selectedItems);
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
          showSelect
          disableCardView
          disableListView
          disableColumnManagement
          compact
          disableBodyPadding
        />
      </div>
    </Modal>
  );
}
