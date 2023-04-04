import {
  Button,
  DataList,
  DataListCell,
  DataListCheck,
  DataListControl,
  DataListDragButton,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  Modal,
  ModalVariant,
} from '@patternfly/react-core';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ITableColumn } from './PageTable/PageTableColumn';
import { useFrameworkTranslations } from './useFrameworkTranslations';

export function useColumnModal<T extends object>(columns: ITableColumn<T>[]) {
  const [columnModalOpen, setColumnModalOpen] = useState(false);
  const openColumnModal = useCallback(() => {
    setColumnModalOpen(true);
  }, []);
  const [managedColumns, setManagedColumns] = useState<ITableColumn<T>[]>(() => columns);
  const [translations] = useFrameworkTranslations();

  useEffect(() => {
    setManagedColumns((managedColumns) =>
      managedColumns.map(
        (managedColumn) =>
          columns.find((column) => column.header === managedColumn.header) ?? managedColumn
      )
    );
  }, [columns]);

  const onClose = useCallback(() => {
    setColumnModalOpen(false);
  }, []);
  // const selectAllColumns = useCallback(() => {
  //     setManagedColumns((managedColumns) => {
  //         for (const column of managedColumns) {
  //             column.enabled = true
  //         }
  //         return [...managedColumns]
  //     })
  // }, [])
  const onDragFinish = useCallback((itemOrder: string[]) => {
    setManagedColumns((managedColumns) => {
      return itemOrder.map((header) =>
        managedColumns.find((column) => column.header === header)
      ) as ITableColumn<T>[];
    });
  }, []);
  const handleChange = useCallback((checked: boolean, event: FormEvent<HTMLInputElement>) => {
    const columnHeader = (event.target as unknown as { name?: string }).name;
    if (columnHeader) {
      setManagedColumns((managedColumns) => {
        for (const column of managedColumns) {
          if (column.header !== columnHeader) continue;
          column.enabled = checked;
        }
        return [...managedColumns];
      });
    }
  }, []);
  const columnModal = (
    <Modal
      variant={ModalVariant.medium}
      title={translations.manageColumns}
      // description={
      //     <TextContent>
      //         <Text component={TextVariants.p}>Selected categories will be displayed in the table.</Text>
      //         <Button isInline onClick={selectAllColumns} variant="link">
      //             Select all
      //         </Button>
      //     </TextContent>
      // }
      isOpen={columnModalOpen}
      onClose={onClose}
      actions={[
        <Button key="save" variant="primary" onClick={onClose}>
          {translations.closeText}
        </Button>,
        // <Button key="cancel" variant="link" onClick={onClose}>
        //     Cancel
        // </Button>,
      ]}
    >
      <DataList
        aria-label="Table column management"
        id="table-column-management"
        isCompact
        onDragFinish={onDragFinish}
        itemOrder={managedColumns.map((column) => column.header)}
        gridBreakpoint="none"
        style={{ borderTopWidth: 'thin' }}
      >
        {managedColumns.map((column) => {
          // if (index === 0) return <Fragment />
          return (
            <DataListItem
              key={column.header}
              id={column.header}
              aria-labelledby="table-column-management-item1"
              style={{ borderBottomWidth: 'thin' }}
            >
              <DataListItemRow>
                <DataListControl>
                  <DataListDragButton
                    aria-label="Reorder"
                    aria-labelledby="table-column-management-item1"
                    aria-describedby="Press space or enter to begin dragging, and use the arrow keys to navigate up or down. Press enter to confirm the drag, or any other key to cancel the drag operation."
                    aria-pressed="false"
                  />
                  <DataListCheck
                    aria-labelledby="table-column-management-item1"
                    checked={column.enabled !== false}
                    name={column.header}
                    id={column.header}
                    onChange={handleChange}
                    otherControls
                  />
                </DataListControl>
                <DataListItemCells
                  dataListCells={[
                    <DataListCell id="table-column-management-item1" key={column.header}>
                      <label htmlFor={column.header}>{column.header}</label>
                    </DataListCell>,
                  ]}
                />
              </DataListItemRow>
            </DataListItem>
          );
        })}
      </DataList>
    </Modal>
  );
  return { openColumnModal, columnModal, managedColumns };
}
