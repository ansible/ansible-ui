/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import { PageDetail } from '../PageDetails/PageDetail';
import { PageDetails } from '../PageDetails/PageDetails';
import { ITableColumn, TableColumnCell } from './PageTable';

export function TableDetails<T extends object>(props: {
  item: T | undefined;
  columns: ITableColumn<T>[];
}) {
  const { item, columns } = props;
  if (!item) return <></>;
  return (
    <PageDetails>
      {columns.map((column) => (
        <PageDetail key={column.id} label={column.header}>
          <TableColumnCell column={column} item={item} />
        </PageDetail>
      ))}
    </PageDetails>
  );
}
