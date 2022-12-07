/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Detail, DetailsList } from '../components/Details';
import { ITableColumn, TableColumnCell } from './PageTable';

export function TableDetails<T extends object>(props: {
  item: T | undefined;
  columns: ITableColumn<T>[];
}) {
  const { item, columns } = props;
  if (!item) return <></>;
  return (
    <DetailsList>
      {columns.map((column) => (
        <Detail key={column.id} label={column.header}>
          <TableColumnCell column={column} item={item} />
        </Detail>
      ))}
    </DetailsList>
  );
}
