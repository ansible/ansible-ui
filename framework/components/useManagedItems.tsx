import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { ReactNode, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../PageDialogs/PageDialog';
import { useSelected } from '../PageTable/useTableItems';
import { ReorderItems } from './ReorderItems';

interface IManageItemColumn<ItemT extends object> {
  header: string;
  cell: (item: ItemT, setItem: (item: ItemT) => void) => ReactNode;
}

export interface ManageItemsProps<ItemT extends object> {
  /** The id of the modal - used to save the user's preferences */
  id: string;

  title: string;

  description?: string;

  /** A function that gets a unique key for each item */
  keyFn: (item: ItemT) => string | number;

  /** The items to manage */
  items: ItemT[];

  /** The columns to display in the modal for managing the items */
  columns: IManageItemColumn<ItemT>[];

  // ToDo: This will be needed for table column management
  /** A function that determines if an item can be reordered */
  // canReorderItem?: (item: ItemT) => boolean;

  // ToDo: This will be needed for table column management
  /** A function that determines if an item can be disabled */
  // canDisableItem?: (item: ItemT) => boolean;

  /** Setting to hide column headers */
  hideColumnHeaders?: boolean;

  /** Variant controls the size of the modal */
  variant?: ModalVariant;

  /** Callback to determine is an item is selected. */
  isSelected?: (item: ItemT) => boolean;

  /** Callback to set if an item is selected. */
  setSelected?: (item: ItemT, selected: boolean) => void;

  /** Callback to save the manages state to localstorage format. */
  saveFn?: (items: ItemT[]) => object[];

  /** Callback to load the manages state from localstorage format. */
  loadFn?: (items: ItemT[], data: object[]) => void;
}

/**
 * This hook is used to manage items.
 * - Reordering
 * - Enabling/Disabling
 * - Display type
 */
export function useManageItems<ItemT extends object>(options: ManageItemsProps<ItemT>) {
  const { saveFn, loadFn } = options;
  const [_, setDialog] = usePageDialog();
  const [keyFn] = useState(() => options.keyFn);

  const [items, setItemsState] = useState<ItemT[]>(() => {
    try {
      const value = localStorage.getItem(options.id);
      if (typeof value === 'string') {
        const data: unknown = JSON.parse(value);
        if (Array.isArray(data) && data.every((i) => typeof i === 'object')) {
          if (loadFn) {
            const newItems = [...options.items];
            loadFn(newItems, data as object[]);
            return newItems;
          } else {
            return data as ItemT[];
          }
        }
      }
      return options.items;
    } catch {
      return options.items;
    }
  });

  const setItems = useCallback((items: ItemT[]) => {
    setItemsState(items);
  }, []);

  const { selectedItems, selectItems, isSelected, selectItem, unselectItem } = useSelected(
    items,
    keyFn,
    items.filter((item) => options.isSelected?.(item) ?? false)
  );

  const onApplyChanges = useCallback(
    (items: ItemT[], selectedItems: ItemT[]) => {
      setItems(items);
      selectItems(selectedItems);
      if (saveFn) {
        localStorage.setItem(options.id, JSON.stringify(saveFn(items)));
      } else {
        localStorage.setItem(options.id, JSON.stringify(items));
      }
    },
    [options.id, saveFn, selectItems, setItems]
  );

  const openModal = () =>
    setDialog(
      <ManageItemsModal
        {...options}
        keyFn={keyFn}
        items={items}
        defaultSelectedItems={selectedItems}
        onApplyChanges={onApplyChanges}
      />
    );

  const visibleItems = items.filter((item) => isSelected(item));

  return {
    openModal,
    items: visibleItems,
    isSelected,
    selectItem,
    unselectItem,
  };
}

export function ManageItemsModal<ItemT extends object>(
  props: ManageItemsProps<ItemT> & {
    defaultSelectedItems?: ItemT[];
    onApplyChanges: (items: ItemT[], selectedItems: ItemT[]) => void;
  }
) {
  const { t } = useTranslation();
  const { title, description, columns, onApplyChanges } = props;
  const [keyFn] = useState(() => props.keyFn);
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);
  const [items, setItems] = useState<ItemT[]>(() => props.items);
  const {
    selectedItems,
    isSelected,
    selectItem,
    unselectItem,
    allSelected,
    selectAll,
    unselectAll,
  } = useSelected(items, keyFn, props.defaultSelectedItems);

  const onApply = () => {
    for (const item of items) {
      if (!selectedItems.includes(item)) {
        props.setSelected?.(item, false);
      } else {
        props.setSelected?.(item, true);
      }
    }
    onApplyChanges(items, selectedItems);
    setDialog(undefined);
  };

  return (
    <Modal
      title={title}
      aria-label={title}
      description={<div style={{ marginBottom: 16 }}>{description}</div>}
      variant={props.variant ?? ModalVariant.medium}
      isOpen
      onClose={onClose}
      actions={[
        <Button key="apply" variant="primary" onClick={onApply}>{t`Apply`}</Button>,
        <Button key="cancel" variant="link" onClick={onClose}>{t`Cancel`}</Button>,
      ]}
      hasNoBodyWrapper
    >
      <ReorderItems<ItemT>
        keyFn={keyFn}
        items={items}
        setItems={setItems}
        columns={columns}
        isSelected={isSelected}
        selectItem={selectItem}
        unselectItem={unselectItem}
        allSelected={allSelected}
        selectAll={selectAll}
        unselectAll={unselectAll}
        hideColumnHeaders={props.hideColumnHeaders}
        isSelectableWithCheckbox={props.isSelected !== undefined && props.setSelected !== undefined}
      />
    </Modal>
  );
}
