import {
  TableComposable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TbodyProps,
  TrProps,
} from '@patternfly/react-table';
import styles from '@patternfly/react-styles/css/components/Table/table';
import React, { ReactNode, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ReorderItemsProps<T extends object> = {
  /** Array of columns */
  columns: {
    header: string;
    cell: (item: T) => ReactNode | string;
  }[];
  /** Array of items that can be reordered */
  items: T[];
  /** A function that gets a unique key for each item */
  keyFn: (item: T) => string | number;
  /** Callback function to process items with the updated order */
  onSave: (items: T[], selectedItems: T[]) => void;
  /** Setting to show the table with the `compact` variant and without borders for rows */
  isCompactBorderless?: boolean;
  /** Setting to hide column headers */
  hideColumnHeaders?: boolean;
  /** Setting to include a column of checkboxes to enable selection of rows */
  isSelectableWithCheckbox?: boolean;
  /** Initial selection of rows */
  defaultSelection?: T[];
};

export type ReorderItemsRef<T extends object> = {
  // Get the current state of reordered and selected items
  getReorderedAndSelectedItems: () => { reorderedItems: T[]; selectedItems: T[] };
};

/**
 * Component to reorder items in a list by dragging items to a desired position.
 * [Optionally allows selecting items from the list using checkboxes.]
 */
export function ReorderItems<T extends object>(props: ReorderItemsProps<T>) {
  const {
    columns,
    items,
    isCompactBorderless,
    hideColumnHeaders,
    keyFn,
    onSave,
    isSelectableWithCheckbox,
    defaultSelection,
  } = props;
  const [listItems, setListItems] = useState([...items]);
  const [selectedItems, setSelectedItems] = useState([
    ...(defaultSelection ? defaultSelection : []),
  ]);
  const [itemStartIndex, setStartItemIndex] = useState<number | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useTranslation();

  // useImperativeHandle<ReorderItemsRef<T>, ReorderItemsRef<T>>(ref, () => ({
  //   getReorderedAndSelectedItems() {
  //     return {
  //       reorderedItems: listItems,
  //       selectedItems,
  //     };
  //   },
  // }));

  const bodyRef = useRef<HTMLTableSectionElement>(null);

  const isValidDrop = (evt: React.DragEvent<HTMLTableSectionElement | HTMLTableRowElement>) => {
    if (bodyRef.current) {
      const ulRect = bodyRef.current.getBoundingClientRect();
      return (
        evt.clientX > ulRect.x &&
        evt.clientX < ulRect.x + ulRect.width &&
        evt.clientY > ulRect.y &&
        evt.clientY < ulRect.y + ulRect.height
      );
    }
    return false;
  };

  const onDrop: TrProps['onDrop'] = (evt) => {
    if (!isValidDrop(evt)) {
      onDragCancel();
    }
  };

  const onDragCancel = () => {
    if (bodyRef.current) {
      Array.from(bodyRef.current.children).forEach((el) => {
        el.classList.remove(styles.modifiers.ghostRow);
        el.setAttribute('aria-pressed', 'false');
      });
    }
    setDraggedItemId(null);
    setStartItemIndex(null);
    setIsDragging(false);
  };

  const onDragOver: TbodyProps['onDragOver'] = (evt) => {
    evt.preventDefault();

    const curListItem = (evt.target as HTMLTableSectionElement).closest('tr');
    if (
      !curListItem ||
      !(bodyRef.current && bodyRef.current.contains(curListItem)) ||
      curListItem.id === draggedItemId
    ) {
      return null;
    } else {
      const dragId = curListItem.id;
      const newDraggedItemIndex = Array.from(bodyRef.current.children).findIndex(
        (item) => item.id === dragId
      );
      if (newDraggedItemIndex !== itemStartIndex && draggedItemId) {
        const tempItemOrder = moveItem([...listItems], draggedItemId, newDraggedItemIndex);
        setListItems(tempItemOrder);
        onSave(tempItemOrder, selectedItems);
      }
    }
    return null;
  };

  const moveItem = (arr: T[], itemId: string, toIndex: number) => {
    const fromIndex = arr.findIndex((item) => keyFn(item) === itemId);

    if (fromIndex === toIndex) {
      return arr;
    }
    const temp = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, temp[0]);

    return arr;
  };

  const onDragLeave: TbodyProps['onDragLeave'] = (evt) => {
    if (!isValidDrop(evt)) {
      setStartItemIndex(null);
    }
  };

  const onDragEnd: TrProps['onDragEnd'] = (evt) => {
    const target = evt.target as HTMLTableRowElement;
    target.classList.remove(styles.modifiers.ghostRow);
    target.setAttribute('aria-pressed', 'false');
    setDraggedItemId(null);
    setStartItemIndex(null);
    setIsDragging(false);
  };

  const onDragStart: TrProps['onDragStart'] = (evt) => {
    if (bodyRef.current) {
      evt.dataTransfer.effectAllowed = 'move';
      const newDraggedItemId = evt.currentTarget.id;

      const originalStartIndex = Array.from(bodyRef.current.children).findIndex(
        (item) => item.id === evt.currentTarget.id
      );
      evt.currentTarget.setAttribute('aria-pressed', 'true');
      setDraggedItemId(newDraggedItemId);
      setStartItemIndex(originalStartIndex);
    }
  };

  const onSelect = (isSelected: boolean, listItem: T) => {
    setSelectedItems((prevSelected) => {
      const otherSelectedItems = prevSelected.filter((item) => item !== listItem);
      return isSelected ? [...otherSelectedItems, listItem] : otherSelectedItems;
    });
  };

  const isItemSelected = (item: T) => {
    return selectedItems.includes(item);
  };

  return (
    <TableComposable
      aria-label={t(`Table with draggable rows`)}
      className={isDragging ? styles.modifiers.dragOver : ''}
      variant={isCompactBorderless ? 'compact' : undefined}
      borders={!isCompactBorderless}
    >
      {hideColumnHeaders ? null : (
        <Thead>
          <Tr>
            <Th />
            {columns.map((column, columnIndex) => (
              <Th key={columnIndex}>{column.header}</Th>
            ))}
          </Tr>
        </Thead>
      )}
      <Tbody ref={bodyRef} onDragOver={onDragOver} onDragLeave={onDragLeave}>
        {listItems.map((listItem, rowIndex) => (
          <Tr
            key={keyFn(listItem)}
            id={keyFn(listItem) as string}
            draggable
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
          >
            <Td
              draggableRow={{
                id: `draggable-row-${keyFn(listItem) as string}`,
              }}
            />
            <Td
              select={
                isSelectableWithCheckbox
                  ? {
                      rowIndex,
                      variant: 'checkbox',
                      onSelect: (_event, isSelected) => onSelect(isSelected, listItem),
                      isSelected: isItemSelected(listItem),
                    }
                  : undefined
              }
            />
            {columns.map((column, columnIndex) => (
              <Td key={`${keyFn(listItem) as string}_${columnIndex}`}>{column.cell(listItem)}</Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
}
