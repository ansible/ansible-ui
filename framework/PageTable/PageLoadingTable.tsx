import { Skeleton } from '@patternfly/react-core';
import { Table /* data-codemods */, Tbody, Td, Tr } from '@patternfly/react-table';

export function PageLoadingTable() {
  return (
    <Table gridBreakPoint="" className="page-table">
      <Tbody>
        {new Array(10).fill(0).map((_, index) => (
          <Tr key={index}>
            <Td>
              <Skeleton height="27px" />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
