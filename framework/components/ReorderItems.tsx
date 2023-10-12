import styles from '@patternfly/react-styles/css/components/Table/table';
import {
  Table /* data-codemods */,
  Tbody,
  TbodyProps,
  Td,
  Th,
  Thead,
  Tr,
  TrProps,
} from '@patternfly/react-table';
import React, { ReactNode, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ReorderItemsProps<T extends object> = {
  /** Array of columns */
  columns: {
    header: string;
    cell: (item: T, setItem: (item: T) => void) => ReactNode | string;
  }[];

  items: T[];
  setItems: (items: T[]) => void;

  isSelected: (items: T) => boolean;
  selectItem: (items: T) => void;
  unselectItem: (items: T) => void;
  allSelected: boolean;
  selectAll: () => void;
  unselectAll: () => void;

  /** A function that gets a unique key for each item */
  keyFn: (item: T) => string | number;

  /** Setting to hide column headers */
  hideColumnHeaders?: boolean;

  /** Setting to include a column of checkboxes to enable selection of rows */
  isSelectableWithCheckbox?: boolean;
};

/**
 * Component to reorder items in a list by dragging items to a desired position.
 * [Optionally allows selecting items from the list using checkboxes.]
 */
export function ReorderItems<T extends object>(props: ReorderItemsProps<T>) {
  const { t } = useTranslation();

  const {
    columns,
    keyFn,
    items,
    setItems,
    isSelected,
    selectItem,
    unselectItem,
    allSelected,
    selectAll,
    unselectAll,
    hideColumnHeaders,
    isSelectableWithCheckbox,
  } = props;

  const [itemStartIndex, setStartItemIndex] = useState<number | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
        const tempItemOrder = moveItem([...items], draggedItemId, newDraggedItemIndex);
        setItems(tempItemOrder);
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

  const updateItem = useCallback(
    (item: T) => {
      const index = items.findIndex((i) => keyFn(i) === keyFn(item));
      const newItems = [...items];
      newItems[index] = item;
      setItems(newItems);
    },
    [items, setItems, keyFn]
  );

  return (
    <Table
      aria-label={t(`Table with draggable rows`)}
      className={isDragging ? styles.modifiers.dragOver : ''}
      variant="compact"
      gridBreakPoint=""
    >
      {!hideColumnHeaders && (
        <Thead>
          <Tr>
            <Th />
            {isSelectableWithCheckbox && (
              <Th
                select={{
                  onSelect: (_event, isSelected) => {
                    isSelected ? selectAll() : unselectAll();
                  },
                  isSelected: allSelected,
                }}
              />
            )}
            {columns.map((column, columnIndex) => (
              <Th key={columnIndex}>{column.header}</Th>
            ))}
          </Tr>
        </Thead>
      )}
      <Tbody ref={bodyRef} onDragOver={onDragOver} onDragLeave={onDragLeave}>
        {items.map((item, rowIndex) => {
          const key = keyFn(item);
          return (
            <Tr
              key={key}
              id={key.toString()}
              draggable
              onDrop={onDrop}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
            >
              <Td draggableRow={{ id: `draggable-row-${key.toString()}` }} />
              {isSelectableWithCheckbox && (
                <Td
                  select={{
                    rowIndex,
                    variant: 'checkbox',
                    onSelect: (_event, select) => {
                      select ? selectItem(item) : unselectItem(item);
                    },
                    isSelected: isSelected(item),
                  }}
                />
              )}
              {columns.map((column) => (
                <Td key={column.header}>{column.cell(item, updateItem)}</Td>
              ))}
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
