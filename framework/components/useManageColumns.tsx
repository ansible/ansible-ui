import { ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageSingleSelect } from '../PageInputs/PageSingleSelect';
import { ColumnTableOption, ITableColumn } from '../PageTable/PageTableColumn';
import { useManageItems } from './useManagedItems';

export function useManageColumns<T extends object>(
  id: string,
  tableColumns: ITableColumn<T>[],
  disableTableView?: boolean,
  disableListView?: boolean,
  disableCardView?: boolean
) {
  const { t } = useTranslation();
  const columns = useMemo(() => {
    const columns: {
      header: string;
      cell: (column: ITableColumn<T>, setColumn: (column: ITableColumn<T>) => void) => ReactNode;
    }[] = [{ header: t('Column Name'), cell: (column: ITableColumn<T>) => column.header }];

    if (!disableTableView) {
      columns.push({
        header: t('Table View'),
        cell: (column: ITableColumn<T>, setColumn: (column: ITableColumn<T>) => void) => (
          <PageSingleSelect
            value={column.table ?? ''}
            onSelect={(value) => {
              switch (value) {
                case '':
                  setColumn({ ...column, table: undefined });
                  break;
                case ColumnTableOption.Description:
                case ColumnTableOption.Expanded:
                case ColumnTableOption.Hidden:
                  setColumn({ ...column, table: value });
                  break;
              }
            }}
            placeholder={t('Column')}
            options={[
              {
                value: '',
                label: t('Column'),
                description: t('Show the column in the table.'),
              },
              {
                value: ColumnTableOption.Description,
                label: t('Description'),
                description: t(
                  'Show the column when the item is expanded as a full width description.'
                ),
              },
              {
                value: ColumnTableOption.Expanded,
                label: t('Expanded'),
                description: t('Show the column when the item is expandedas a detail.'),
              },
              {
                value: ColumnTableOption.Hidden,
                label: t('Hidden'),
                description: t('Hide the column.'),
              },
            ]}
          />
        ),
      });
    }

    if (!disableListView) {
      columns.push({
        header: t('List View'),
        cell: (column: ITableColumn<T>, setColumn: (column: ITableColumn<T>) => void) => (
          <PageSingleSelect
            value={column.list ?? ''}
            onSelect={(value) => {
              switch (value) {
                case '':
                  setColumn({ ...column, list: undefined });
                  break;
                case 'name':
                case 'subtitle':
                case 'description':
                case 'primary':
                case 'secondary':
                case 'hidden':
                  setColumn({ ...column, list: value });
                  break;
              }
            }}
            options={[
              {
                value: 'name',
                label: t('Name'),
                description: t('Show the column as the name of the list item.'),
              },
              {
                value: 'subtitle',
                label: t('Subtitle'),
                description: t('Show the column as the subtitle under the name on the list.'),
              },
              {
                value: 'description',
                label: t('Description'),
                description: t('Show the column as the list item description.'),
              },
              {
                value: '',
                label: t('Left side'),
                description: t('Show the column on the left side of the list.'),
              },
              {
                value: 'primary',
                label: t('Left side'),
                description: t('Show the column on the left side of the list.'),
              },
              {
                value: 'secondary',
                label: t('Right side'),
                description: t('Show the column on the right side of the list.'),
              },
              {
                value: 'hidden',
                label: t('Hidden'),
                description: t('Hide the column on the list.'),
              },
            ]}
            placeholder={t('Left side')}
          />
        ),
      });
    }

    if (!disableCardView) {
      columns.push({
        header: t('Card View'),
        cell: (column: ITableColumn<T>, setColumn: (column: ITableColumn<T>) => void) => (
          <PageSingleSelect
            value={column.card ?? ''}
            onSelect={(value) => {
              switch (value) {
                case '':
                  setColumn({ ...column, card: undefined });
                  break;
                case 'name':
                case 'subtitle':
                case 'description':
                case 'hidden':
                  setColumn({ ...column, card: value });
                  break;
              }
            }}
            placeholder={t('Detail')}
            options={[
              {
                value: 'name',
                label: t('Name'),
                description: t('Show the column as the name on the card.'),
              },
              {
                value: 'subtitle',
                label: t('Subtitle'),
                description: t('Show the column as the subtitle under the name on the card.'),
              },
              {
                value: 'description',
                label: t('Description'),
                description: t('Show the column as the card description.'),
              },
              {
                value: '',
                label: t('Detail'),
                description: t('Show the column one of the details on the card.'),
              },
              {
                value: 'hidden',
                label: t('Hidden'),
                description: t('Hide the column on the card.'),
              },
            ]}
          />
        ),
      });
    }

    return columns;
  }, [disableCardView, disableListView, disableTableView, t]);

  const loadColumns = useCallback((columns: ITableColumn<T>[], data: object[]) => {
    const values = data as Pick<ITableColumn<T>, 'id' | 'header' | 'table' | 'list' | 'card'>[];
    for (const column of columns) {
      if (column.id) {
        const value = values.find((value) => value.id === column.id);
        if (value) {
          column.table = value.table;
          column.list = value.list;
          column.card = value.card;
        }
      } else {
        const value = values.find((value) => value.header === column.header);
        if (value) {
          column.table = value.table;
          column.list = value.list;
          column.card = value.card;
        }
      }
    }
    columns.sort((a, b) => {
      if (a.id && b.id) {
        const valueAIndex = values.findIndex((value) => value.id === a.id);
        const valueBIndex = values.findIndex((value) => value.id === b.id);
        return valueAIndex - valueBIndex;
      } else {
        const valueAIndex = values.findIndex((value) => value.header === a.header);
        const valueBIndex = values.findIndex((value) => value.header === b.header);
        return valueAIndex - valueBIndex;
      }
    });
  }, []);

  const saveColumns = useCallback(
    (columns: ITableColumn<T>[]) =>
      columns.map((column) => {
        const { id, header, table, list, card } = column;
        return { id, header, table, list, card };
      }),
    []
  );

  const { openModal: openColumnManagement, items: managedColumns } = useManageItems<
    ITableColumn<T>
  >({
    id: id,
    title: t('Manage Columns'),
    description: t('Manage the order, placement, and format of columns.'),
    items: tableColumns,
    keyFn: (tableColumn) => tableColumn.id ?? tableColumn.header,
    columns,
    loadFn: loadColumns,
    saveFn: saveColumns,
  });
  return {
    openColumnManagement,
    managedColumns,
  };
}
