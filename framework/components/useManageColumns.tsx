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
    }[] = [{ header: t('Name'), cell: (column: ITableColumn<T>) => column.header }];

    if (!disableTableView) {
      columns.push({
        header: t('Table'),
        cell: (column: ITableColumn<T>, setColumn: (column: ITableColumn<T>) => void) => (
          <PageSingleSelect<keyof typeof ColumnTableOption | ''>
            value={column.table ?? ''}
            onSelect={(value: keyof typeof ColumnTableOption | '' | null) => {
              switch (value) {
                case '':
                  setColumn({ ...column, table: undefined });
                  break;
                case ColumnTableOption.description:
                case ColumnTableOption.expanded:
                case ColumnTableOption.hidden:
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
                value: ColumnTableOption.description,
                label: t('Description'),
                description: t(
                  'Show the column when the item is expanded as a full width description.'
                ),
              },
              {
                value: ColumnTableOption.expanded,
                label: t('Expanded'),
                description: t('Show the column when the item is expanded as a detail.'),
              },
              {
                value: ColumnTableOption.hidden,
                label: t('Hidden'),
                description: t('Hide the column.'),
              },
            ]}
            isRequired
          />
        ),
      });
    }

    if (!disableListView) {
      columns.push({
        header: t('List'),
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
            isRequired
          />
        ),
      });
    }

    if (!disableCardView) {
      columns.push({
        header: t('Card'),
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
            isRequired
          />
        ),
      });
    }

    return columns;
  }, [disableCardView, disableListView, disableTableView, t]);

  const loadColumn = useCallback((column: ITableColumn<T>, data: unknown) => {
    if (typeof data === 'object' && data !== null) {
      if ('table' in data && typeof data.table === 'string') {
        column.table = data.table as ColumnTableOption;
      } else {
        column.table = undefined;
      }
      if ('list' in data && typeof data.list === 'string') {
        column.list = data.list as
          | 'name'
          | 'subtitle'
          | 'description'
          | 'hidden'
          | 'primary'
          | 'secondary';
      } else {
        column.list = undefined;
      }
      if ('card' in data && typeof data.card === 'string') {
        column.card = data.card as 'name' | 'subtitle' | 'description' | 'hidden';
      } else {
        column.card = undefined;
      }
    }
  }, []);

  const saveColumn = useCallback((column: ITableColumn<T>) => {
    const { table, list, card } = column;
    return { table, list, card };
  }, []);

  const { openManageItems: openColumnManagement, managedItems: managedColumns } = useManageItems<
    ITableColumn<T>
  >({
    id: id,
    title: t('Manage Columns'),
    description: t('Manage the order, placement, and format of columns.'),
    items: tableColumns,
    keyFn: (tableColumn) => tableColumn.id ?? tableColumn.header,
    columns,
    loadFn: loadColumn,
    saveFn: saveColumn,
    hideSelection: true,
  });

  return {
    openColumnManagement,
    managedColumns,
  };
}
