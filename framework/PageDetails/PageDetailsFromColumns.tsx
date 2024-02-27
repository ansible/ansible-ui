/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ReactNode, useMemo } from 'react';
import { ColumnPriority, ITableColumn, TableColumnCell } from '../PageTable/PageTableColumn';
import { PageDetail } from './PageDetail';

export function PageDetailsFromColumns<T extends object>(props: {
  item: T | undefined;
  columns: ITableColumn<T>[];
  /** Custom page details */
  children?: ReactNode;
}) {
  const { item, columns, children } = props;

  const columnsWithValue = useMemo(
    () =>
      columns.filter((column) => {
        if (!item) return false;
        if ('value' in column && column.value) {
          const itemValue = column.value(item);
          if (
            itemValue === undefined ||
            itemValue === null ||
            (typeof itemValue === 'string' && itemValue.trim().length === 0)
          )
            return false;
        }
        return true;
      }),
    [columns, item]
  );

  /**
   * Columns are displayed based on priority. Columns with ColumnPriority.last appear last.
   * Custom details are received as an optional 'children' prop and placed in the correct position.
   */
  const firstColumns = useMemo(
    () => columnsWithValue.filter((column) => column.priority !== ColumnPriority.last),
    [columnsWithValue]
  );
  const lastColumns = useMemo(
    () => columnsWithValue.filter((column) => column.priority === ColumnPriority.last),
    [columnsWithValue]
  );
  if (!item) return null;
  if (!columnsWithValue.length) return null;
  return (
    <>
      {firstColumns.map((column) => {
        return (
          <PageDetail key={column.id ?? column.header} label={column.header}>
            <TableColumnCell column={column} item={item} />
          </PageDetail>
        );
      })}
      {children ? children : null}
      {lastColumns.map((column) => {
        return (
          <PageDetail key={column.id ?? column.header} label={column.header}>
            <TableColumnCell column={column} item={item} />
          </PageDetail>
        );
      })}
    </>
  );
}
