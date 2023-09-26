import { Skeleton } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Tr } from '@patternfly/react-table';
import './PageTable.css';

export function PageLoadingTable() {
  return (
    <TableComposable gridBreakPoint="" className="page-table">
      <Tbody>
        {new Array(10).fill(0).map((_, index) => (
          <Tr key={index}>
            <Td>
              <Skeleton height="27px" />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
}
