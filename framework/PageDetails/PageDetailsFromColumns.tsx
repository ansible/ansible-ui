/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ITableColumn, TableColumnCell } from '../PageTable/PageTable';
import { PageDetail } from './PageDetail';
import { PageDetails } from './PageDetails';

export function PageDetailsFromColumns<T extends object>(props: {
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
