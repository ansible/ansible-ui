import { SelectOption } from '@patternfly/react-core/next';
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
            onChange={(value) => {
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
          >
            <SelectOption itemId="" description={t('Show the column in the table.')}>
              {t('Column')}
            </SelectOption>
            <SelectOption
              itemId={ColumnTableOption.Description}
              description={t(
                'Show the column when the item is expanded as a full width description.'
              )}
            >
              {t('Description')}
            </SelectOption>
            <SelectOption
              itemId={ColumnTableOption.Expanded}
              description={t('Show the column when the item is expandedas a detail.')}
            >
              {t('Expanded')}
            </SelectOption>
            <SelectOption itemId={ColumnTableOption.Hidden} description={t('Hide the column.')}>
              {t('Hidden')}
            </SelectOption>
          </PageSingleSelect>
        ),
      });
    }

    if (!disableListView) {
      columns.push({
        header: 'List View',
        cell: (column: ITableColumn<T>, setColumn: (column: ITableColumn<T>) => void) => (
          <PageSingleSelect
            value={column.list ?? ''}
            onChange={(value) => {
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
            placeholder={t('Left side')}
          >
            <SelectOption
              itemId=""
              description={t('Show the column on the left side of the list.')}
            >
              {t('Left side')}
            </SelectOption>
            <SelectOption
              itemId="name"
              description={t('Show the column as the name of the list item.')}
            >
              {t('Name')}
            </SelectOption>
            <SelectOption
              itemId="subtitle"
              description={t('Show the column as the subtitle under the name on the list.')}
            >
              {t('Subtitle')}
            </SelectOption>
            <SelectOption
              itemId="description"
              description={t('Show the column as the list item description.')}
            >
              {t('Description')}
            </SelectOption>
            <SelectOption
              itemId="primary"
              description={t('Show the column on the left side of the list.')}
            >
              {t('Left side')}
            </SelectOption>
            <SelectOption
              itemId="secondary"
              description={t('Show the column on the right side of the list.')}
            >
              {t('Right side')}
            </SelectOption>
            <SelectOption itemId="hidden" description={t('Hide the column on the list.')}>
              {t('Hidden')}
            </SelectOption>
          </PageSingleSelect>
        ),
      });
    }

    if (!disableCardView) {
      columns.push({
        header: 'Card View',
        cell: (column: ITableColumn<T>, setColumn: (column: ITableColumn<T>) => void) => (
          <PageSingleSelect
            value={column.card ?? ''}
            onChange={(value) => {
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
          >
            <SelectOption
              itemId=""
              description={t('Show the column one of the details on the card.')}
            >
              {t('Detail')}
            </SelectOption>
            <SelectOption itemId="name" description={t('Show the column as the name on the card.')}>
              {t('Name')}
            </SelectOption>
            <SelectOption
              itemId="subtitle"
              description={t('Show the column as the subtitle under the name on the card.')}
            >
              {t('Subtitle')}
            </SelectOption>
            <SelectOption
              itemId="description"
              description={t('Show the column as the card description.')}
            >
              {t('Description')}
            </SelectOption>
            <SelectOption itemId="hidden" description={t('Hide the column on the card.')}>
              {t('Hidden')}
            </SelectOption>
          </PageSingleSelect>
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
    title: 'Manage Columns',
    description: 'Manage the order, placement, and format of columns.',
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
