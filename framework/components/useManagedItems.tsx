import { Button, Divider, Modal, ModalBoxBody, ModalVariant } from '@patternfly/react-core';
import { ReactNode, useCallback, useMemo, useState } from 'react';
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

  /** Callback to save the manages state to localstorage format. */
  saveFn?: (items: ItemT) => unknown;

  /** Callback to load the manages state from localstorage format. */
  loadFn?: (items: ItemT, data: unknown) => void;

  /** Setting to include a column of checkboxes to enable selection of rows */
  hideSelection?: boolean;

  /** A function that gets called after the user clicks the apply button. */
  onSubmit?: (items: ItemT[]) => void;
}

/**
 * This hook is used to manage items.
 * - Reordering
 * - Enabling/Disabling
 * - Display type
 */
export function useManageItems<ItemT extends object>(options: ManageItemsProps<ItemT>) {
  const [_, setDialog] = usePageDialog();
  const [keyFn] = useState(() => options.keyFn);
  const [saveFn] = useState(() => options.saveFn);
  const [loadFn] = useState(() => options.loadFn);

  // This is the order/enabled/state that is stored in localstorage
  const [itemsState, setItemsState] = useState<IManagedItemState[] | undefined>(() => {
    try {
      const value = localStorage.getItem(options.id);
      if (typeof value === 'string') {
        const data: unknown = JSON.parse(value);
        if (
          Array.isArray(data) &&
          data.every((i) => typeof i === 'object') &&
          data.every((i) => 'key' in i && 'enabled' in i)
        ) {
          return data as IManagedItemState[];
        }
      }
    } catch {
      // Do nothing
    }
    return undefined;
  });

  const items = useMemo(() => {
    if (!itemsState) {
      return options.items;
    } else {
      return options.items
        .map((item) => {
          if (loadFn) {
            const itemState = itemsState.find((i) => i.key === keyFn(item));
            if (itemState && itemState.state) {
              loadFn(item, itemState.state);
            }
          }
          return item;
        })
        .sort((a, b) => {
          const aIndex = itemsState.findIndex((i) => i.key === keyFn(a));
          const bIndex = itemsState.findIndex((i) => i.key === keyFn(b));
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
    }
  }, [itemsState, keyFn, loadFn, options.items]);

  const selectedItems = useMemo(() => {
    if (itemsState) {
      return items.filter((item) => {
        const itemState = itemsState.find((i) => i.key === keyFn(item));
        return itemState ? itemState.enabled : true;
      });
    } else {
      return items;
    }
  }, [items, itemsState, keyFn]);

  const onApplyChanges = useCallback(
    (orderedItems: ItemT[], selectedItems: ItemT[]) => {
      const managedItemsState: IManagedItemState[] = orderedItems.map((item) => ({
        key: keyFn(item),
        enabled: selectedItems.includes(item),
        state: saveFn ? saveFn(item) : undefined,
      }));
      setItemsState(managedItemsState);
      localStorage.setItem(options.id, JSON.stringify(managedItemsState));
      options.onSubmit ? options.onSubmit(orderedItems) : undefined;
    },
    [keyFn, options, saveFn]
  );

  const openManageItems = () =>
    setDialog(
      <ManageItemsModal
        {...options}
        keyFn={keyFn}
        items={items}
        defaultSelectedItems={selectedItems}
        onApplyChanges={onApplyChanges}
      />
    );

  return { openManageItems, managedItems: selectedItems };
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
    onApplyChanges(items, selectedItems);
    setDialog(undefined);
  };

  return (
    <Modal
      title={title}
      aria-label={title}
      ouiaId={title}
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
      <Divider />
      <ModalBoxBody style={{ padding: 0 }}>
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
          isSelectableWithCheckbox={props.hideSelection !== true}
        />
      </ModalBoxBody>
      <Divider />
    </Modal>
  );
}

interface IManagedItemState {
  key: string | number;
  enabled: boolean;
  state?: unknown;
}
