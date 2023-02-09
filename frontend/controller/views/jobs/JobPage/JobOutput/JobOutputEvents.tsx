import { useState } from 'react';
import { JobEvent } from '../../../../interfaces/generated-from-swagger/api';
import { ICollapsed } from './JobOutput';
import './JobOutput.css';
import { JobOutputEvent } from './JobOutputEvent';

export function JobEventsComponent(props: { jobEvents: JobEvent[] }) {
  const { jobEvents } = props;
  const [collapsed, setCollapsed] = useState<ICollapsed>({});
  return (
    <pre style={{ fontSize: 'smaller', flexGrow: 1 }}>
      <table>
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
    // <pre style={{ fontSize: 'smaller', flexGrow: 1 }}>
    //   <div
    //     style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr' }}
    //     className="border-bottom"
    //   >
    //     <div className="expand-column" style={{ minHeight: 8 }} />
    //     <div className="line-column" />
    //     <div className="stdout-column" />

    //     {jobEvents.map((jobEvent) => (
    //       <JobEventComponent
    //         key={jobEvent.uuid}
    //         jobEvent={jobEvent}
    //         collapsed={collapsed}
    //         setCollapsed={setCollapsed}
    //       />
    //     ))}
    //     <div className="expand-column" style={{ minHeight: 8 }} />
    //     <div className="line-column" />
    //     <div className="stdout-column" />

    //     {/* <div style={{ minHeight: 10, backgroundColor: 'red' }} />
    //     <div className="line-column" />
    //     <div className="dark-0" /> */}
    //   </div>
    //   {/* {Object.keys(collapsed).map((key) => (
    //     <div>
    //       {key} : {collapsed[key] ? 'true' : 'false'}
    //     </div>
    //   ))} */}
    // </pre>
  );
}
