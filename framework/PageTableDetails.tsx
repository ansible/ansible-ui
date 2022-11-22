/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import { DescriptionList } from '@patternfly/react-core'
import { Detail } from './components/Details'
import { ITableColumn, TableColumnCell } from './PageTable'

export function TableDetails<T extends object>(props: {
  item: T | undefined
  columns: ITableColumn<T>[]
}) {
  const { item, columns } = props
  if (!item) return <></>
  return (
    <DescriptionList isCompact>
      {columns.map((column) => (
        <Detail key={column.id} label={column.header}>
          <TableColumnCell column={column} item={item} />
        </Detail>
      ))}
    </DescriptionList>
  )
}
