import {
  Button,
  Chip,
  ChipGroup,
  Modal,
  ModalBoxBody,
  ModalVariant,
  Skeleton,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageTable } from '../PageTable/PageTable';
import { ITableColumn, TableColumnCell } from '../PageTable/PageTableColumn';
import { IToolbarFilter } from '../PageTable/PageToolbar';
import { ISelected } from '../PageTable/useTableItems';
import { Collapse } from '../components/Collapse';
import { IView } from '../useView';
import { usePageDialog } from './PageDialog';

/**
 * @deprecated use SelectSingleDialog
 */
interface ISelectDialogOptions<T extends object, TMultiple> {
  view: IView & ISelected<T> & { itemCount?: number; pageItems: T[] | undefined };
  tableColumns: ITableColumn<T>[];
  toolbarFilters: IToolbarFilter[];
  confirm: string;
  cancel: string;
  selected: string;
  isMultiple?: TMultiple extends true ? true : false;
}

/**
 * @deprecated use SelectSingleDialog
 */
export function useSelectDialog<
  T extends { id: number | string; name: string | undefined },
  TMultiple = false
>(options: ISelectDialogOptions<T, TMultiple>) {
  const { view, tableColumns, toolbarFilters, confirm, cancel, selected, isMultiple } = options;
  const [title, setTitle] = useState('');
  type ISetter = TMultiple extends true ? (item: T[]) => void : (item: T) => void;
  const [onSelect, setOnSelect] = useState<ISetter>();
  const openSetting = useCallback((onSelect?: ISetter, title?: string) => {
    setTitle(title ?? '');
    setOnSelect(() => onSelect);
  }, []);
  const [_, setDialog] = usePageDialog();
  useEffect(() => {
    if (onSelect !== undefined) {
      setDialog(
        <SelectDialog<T, TMultiple>
          title={title}
          open
          isMultiple={isMultiple}
          setOpen={() => setOnSelect(undefined)}
          onSelect={onSelect}
          view={view}
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          confirm={confirm}
          cancel={cancel}
          selected={selected}
          keyFn={view.keyFn}
        />
      );
    } else {
      setDialog(undefined);
      view.unselectAll();
    }
  }, [
    cancel,
    confirm,
    onSelect,
    selected,
    setDialog,
    tableColumns,
    title,
    toolbarFilters,
    view,
    isMultiple,
  ]);
  return openSetting;
}

/**
 * @deprecated use SelectSingleDialog
 */
export type SelectDialogProps<T extends object, TMultiple> = {
  title: string;
  open: boolean;
  isMultiple?: TMultiple extends true ? true : false;
  setOpen: (open: boolean) => void;
  onSelect: TMultiple extends true ? (item: T[]) => void : (item: T) => void;
  keyFn: (item: T) => string | number;
} & ISelectDialogOptions<T, TMultiple>;

export function SelectDialog<
  T extends { id: number | string; name: string | undefined },
  TMultiple = false
>(props: SelectDialogProps<T, TMultiple>) {
  const {
    title,
    open,
    isMultiple = false,
    setOpen,
    onSelect,
    view,
    tableColumns,
    toolbarFilters,
    confirm,
    cancel,
    selected,
  } = props;
  const onClose = () => setOpen(false);
  const { t } = useTranslation();
  return (
    <Modal
      title={title}
      aria-label={title}
      isOpen={open}
      onClose={onClose}
      variant={ModalVariant.medium}
      tabIndex={0}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={() => {
            if (!isMultiple && view.selectedItems.length > 0) {
              onSelect(view.selectedItems[0] as T[] & T);
            } else if (isMultiple) {
              onSelect(view.selectedItems as T[] & T);
            }
            onClose();
          }}
          isAriaDisabled={view.selectedItems.length === 0}
        >
          {confirm}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          {cancel}
        </Button>,
      ]}
      hasNoBodyWrapper
    >
      <ModalBoxBody style={{ overflow: 'hidden' }}>
        <Split hasGutter>
          <SplitItem style={{ fontWeight: 'bold' }}>{selected}</SplitItem>
          {view.selectedItems.length > 0 ? (
            <ChipGroup>
              {view.selectedItems.map((item, i) => {
                if (tableColumns && tableColumns.length > 0) {
                  return (
                    <Chip key={i} onClick={() => view.unselectItem(item)}>
                      <TableColumnCell
                        item={item}
                        column={
                          tableColumns.find(
                            (column) => column.card === 'name' || column.list === 'name'
                          ) ?? tableColumns[0]
                        }
                      />
                    </Chip>
                  );
                }
                return <></>;
              })}
            </ChipGroup>
          ) : (
            <SplitItem
              style={{ fontStyle: 'italic' }}
            >{t`None - Please make a selection below.`}</SplitItem>
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
            emptyStateTitle="No organizations found"
            errorStateTitle="Error loading organizations"
            {...view}
            isSelectMultiple={isMultiple}
            onSelect={() => null}
            disableCardView
            disableListView
            disableColumnManagement
            compact
            disableBodyPadding
          />
        </div>
      </Collapse>
    </Modal>
  );
}
