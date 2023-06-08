import { Skeleton } from '@patternfly/react-core';
import { useEffect } from 'react';
import './JobOutput.css';

export function JobOutputLoadingRow(props: {
  counter: number;
  queryJobOutputEvent: (counter: number) => void;
}) {
  useEffect(() => props.queryJobOutputEvent(props.counter), [props]);
  return (
    <div className="output-grid-row">
      <div className="expand-column"></div>
      <div className="stdout-column">
        <Skeleton>{`Loading ${props.counter}`}</Skeleton>
      </div>
    </div>
  );
}
