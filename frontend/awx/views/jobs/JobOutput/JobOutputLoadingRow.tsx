import { Skeleton } from '@patternfly/react-core';
import { useEffect } from 'react';
import './JobOutput.css';

export function JobOutputLoadingRow(props: {
  counter: number;
  queryJobOutputEvent: (counter: number) => void;
}) {
  useEffect(() => props.queryJobOutputEvent(props.counter), [props]);
  return (
    <tr>
      <td className="expand-column"></td>
      <td className="stdout-column">
        <Skeleton>{`Loading ${props.counter}`}</Skeleton>
      </td>
    </tr>
  );
}
