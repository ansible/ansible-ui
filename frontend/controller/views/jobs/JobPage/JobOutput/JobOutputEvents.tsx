import useResizeObserver from '@react-hook/resize-observer';
import { useCallback, useRef, useState } from 'react';
import { JobEvent } from '../../../../interfaces/generated-from-swagger/api';
import { ICollapsed } from './JobOutput';
import './JobOutput.css';
import { JobOutputEvent } from './JobOutputEvent';

export function JobEventsComponent(props: { jobEvents: JobEvent[] }) {
  const { jobEvents } = props;

  const [collapsed, setCollapsed] = useState<ICollapsed>({});

  const tableRef = useRef<HTMLTableElement>(null);
  const [tableHeight, setTableHeight] = useState(0);
  const onResize = useCallback(() => {
    if (!tableRef.current) return;
    setTableHeight(tableRef.current.clientHeight);
  }, []);
  useResizeObserver(tableRef, onResize);

  return (
    <pre style={{ fontSize: 'smaller', flexGrow: 1 }}>
      <table ref={tableRef}>
        {jobEvents.map((jobEvent) => (
          <JobOutputEvent
            key={jobEvent.uuid}
            jobEvent={jobEvent}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        ))}
      </table>
    </pre>
  );
}
