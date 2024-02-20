/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Fragment, ReactNode, useMemo } from 'react';
import { ColumnPriorityOption, ITableColumn, TableColumnCell } from '../PageTable/PageTableColumn';
import { PageDetail } from './PageDetail';

export function PageDetailsFromColumns<T extends object>(props: {
  item: T | undefined;
  columns: ITableColumn<T>[];
  /** Custom page details */
  children?: ReactNode;
}) {
  const { item, columns, children } = props;
  /**
   * Columns are displayed based on priority. Columns with ColumnPriorityOption.last appear last.
   * Custom details are received as an optional 'children' prop and placed in the correct position.
   */
  const firstColumns = useMemo(
    () => columns.filter((column) => column.priority !== ColumnPriorityOption.last).sort(),
    [columns]
  );
  const lastColumns = useMemo(
    () => columns.filter((column) => column.priority === ColumnPriorityOption.last).sort(),
    [columns]
  );
  if (!item) return <></>;
  return (
    <>
      {firstColumns.map((column) => {
        if ('value' in column && column.value) {
          const itemValue = column.value(item);
          if (!itemValue) {
            return <Fragment key={column.id ?? column.header} />;
          }
        }
        return (
          <PageDetail key={column.id ?? column.header} label={column.header}>
            <TableColumnCell column={column} item={item} />
          </PageDetail>
        );
      })}
      {children ? children : null}
      {lastColumns.map((column) => {
        if ('value' in column && column.value) {
          const itemValue = column.value(item);
          if (!itemValue) {
            return <Fragment key={column.id ?? column.header} />;
          }
        }
        return (
          <PageDetail key={column.id ?? column.header} label={column.header}>
            <TableColumnCell column={column} item={item} />
          </PageDetail>
        );
      })}
    </>
  );
}
