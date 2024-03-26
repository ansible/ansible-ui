import { Button, Modal, ModalBoxBody, ModalVariant } from '@patternfly/react-core';
import { useCallback } from 'react';
import { ITableColumn, useVisibleModalColumns } from '../PageTable/PageTableColumn';
import { ISelected } from '../PageTable/useTableItems';
import { IToolbarFilter } from '../PageToolbar/PageToolbarFilter';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { IView } from '../useView';
import { usePageDialog } from './PageDialog';
import { PageMultiSelectList } from '../PageTable/PageMultiSelectList';

export type MultiSelectDialogProps<T extends object> = {
  title: string;
  description?: string;
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined };
  tableColumns: ITableColumn<T>[];
  toolbarFilters: IToolbarFilter[];
  onSelect: (items: T[]) => void;
  confirmText?: string;
  cancelText?: string;
  emptyStateTitle?: string;
  errorStateTitle?: string;
  defaultSort?: string;
  maxSelections?: number;
  allowZeroSelections?: boolean;
  onClose?: () => void;
};

export function MultiSelectDialog<T extends object>(props: MultiSelectDialogProps<T>) {
  const {
    title,
    description,
    view,
    tableColumns,
    toolbarFilters,
    emptyStateTitle,
    errorStateTitle,
    confirmText,
    cancelText,
    onSelect,
    maxSelections,
    allowZeroSelections,
  } = props;
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
      description={description}
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
            onSelect(view.selectedItems);
          }}
          isAriaDisabled={view.selectedItems.length === 0 && !allowZeroSelections}
        >
          {confirmText ?? translations.confirmText}
        </Button>,
        <Button id="cancel" key="cancel" variant="link" onClick={onClose}>
          {cancelText ?? translations.cancelText}
        </Button>,
      ]}
      hasNoBodyWrapper
    >
      <ModalBoxBody style={{ overflow: 'hidden' }}>
        <PageMultiSelectList
          view={view}
          tableColumns={modalColumns}
          toolbarFilters={toolbarFilters}
          emptyStateTitle={emptyStateTitle}
          errorStateTitle={errorStateTitle}
          maxSelections={maxSelections}
          isCompact
        />
      </ModalBoxBody>
    </Modal>
  );
}
