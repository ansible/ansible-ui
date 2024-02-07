/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Fragment } from 'react';
import { ITableColumn, TableColumnCell } from '../PageTable/PageTableColumn';
import { PageDetail } from './PageDetail';

export function PageDetailsFromColumns<T extends object>(props: {
  item: T | undefined;
  columns: ITableColumn<T>[];
}) {
  const { item, columns } = props;
  if (!item) return <></>;
  return (
    <>
      {columns.map((column) => {
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
