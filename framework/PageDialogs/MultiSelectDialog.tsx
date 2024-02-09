import {
  Button,
  Label,
  LabelGroup,
  Modal,
  ModalBoxBody,
  ModalVariant,
  Skeleton,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { useCallback } from 'react';
import { PageTable } from '../PageTable/PageTable';
import { ITableColumn, TableColumnCell } from '../PageTable/PageTableColumn';
import { ISelected } from '../PageTable/useTableItems';
import { IToolbarFilter } from '../PageToolbar/PageToolbarFilter';
import { Collapse } from '../components/Collapse';
import { useFrameworkTranslations } from '../useFrameworkTranslations';
import { IView } from '../useView';
import { usePageDialog } from './PageDialog';

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
          key="confirm"
          variant="primary"
          id="confirm"
          onClick={() => {
            onClose();
            onSelect(view.selectedItems);
          }}
          isAriaDisabled={view.selectedItems.length === 0 && !allowZeroSelections}
        >
          {confirmText ?? translations.confirmText}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          {cancelText ?? translations.cancelText}
        </Button>,
      ]}
      hasNoBodyWrapper
    >
      <ModalBoxBody style={{ overflow: 'hidden' }}>
        <Split hasGutter>
          <SplitItem style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            {translations.selectedText}
          </SplitItem>
          {view.selectedItems.length > 0 ? (
            <LabelGroup>
              {view.selectedItems.map((item, i) => {
                if (tableColumns && tableColumns.length > 0) {
                  return (
                    <Label key={i} onClose={() => view.unselectItem(item)}>
                      <TableColumnCell
                        item={item}
                        column={
                          tableColumns.find(
                            (column) => column.card === 'name' || column.list === 'name'
                          ) ?? tableColumns[0]
                        }
                      />
                    </Label>
                  );
                }
                return <></>;
              })}
            </LabelGroup>
          ) : (
            <SplitItem style={{ fontStyle: 'italic' }}>{translations.noneSelectedText}</SplitItem>
          )}
        </Split>
      </ModalBoxBody>
      <Collapse open={view.itemCount === undefined}>
        <Skeleton height="80px" />
      </Collapse>
      <Collapse open={view.itemCount !== undefined}>
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
            compact
            disableBodyPadding
            maxSelections={maxSelections}
          />
        </div>
      </Collapse>
    </Modal>
  );
}
