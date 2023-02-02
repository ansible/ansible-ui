import {
  Label,
  PageSection,
  SearchInput,
  Skeleton,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { AngleRightIcon } from '@patternfly/react-icons';
import Ansi from 'ansi-to-react';
import { Dispatch, SetStateAction, useState } from 'react';
import { ItemsResponse, useGet2 } from '../../../../Data';
import { JobEvent } from '../../../interfaces/generated-from-swagger/api';
import { Job } from '../../../interfaces/Job';
import './JobOutput.css';

export function JobOutput(props: { job: Job }) {
  const { job } = props;
  const { data: itemsResponse } = useGet2<ItemsResponse<JobEvent>>({
    url: job
      ? // ? `/api/v2/jobs/${job.id.toString()}/events/?order_by=counter&page=1&page_size=50`
        `/api/v2/jobs/${job.id.toString()}/job_events/`
      : '',
    query: { order_by: 'counter', page: 1, page_size: 50 },
  });

  if (!job) return <Skeleton />;
  if (!itemsResponse) return <></>;
  if (!itemsResponse.results) return <></>;

  const jobEvents = itemsResponse?.results;

  return (
    <PageSection variant="light" padding={{ default: 'noPadding' }}>
      <Toolbar className="dark-2 border-bottom">
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <JobEventsComponent jobEvents={jobEvents} />
    </PageSection>
  );
}

interface ICollapsed {
  [uuid: string]: boolean;
}

function JobEventsComponent(props: { jobEvents: JobEvent[] }) {
  const { jobEvents } = props;
  const [collapsed, setCollapsed] = useState<ICollapsed>({});
  return (
    <pre style={{ fontSize: 'smaller', flexGrow: 1 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto auto 1fr',
          height: '100%',
          minHeight: '100%',
        }}
      >
        <div className="expand-column" style={{ minHeight: 8 }} />
        <div className="line-column" />
        <div className="dark-0" />

        {jobEvents.map((jobEvent) => (
          <JobEventComponent
            key={jobEvent.uuid}
            jobEvent={jobEvent}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        ))}
        {/* <div style={{ minHeight: '100%', gridRow: '1fr' }} />
        <div />
        <div className="dark-0" /> */}
      </div>
      {/* {Object.keys(collapsed).map((key) => (
        <div>
          {key} : {collapsed[key] ? 'true' : 'false'}
        </div>
      ))} */}
    </pre>
  );
}

function JobEventComponent(props: {
  jobEvent: JobEvent;
  collapsed: ICollapsed;
  setCollapsed: Dispatch<SetStateAction<ICollapsed>>;
}) {
  const { jobEvent, collapsed, setCollapsed } = props;
  const lineNumber = Number(jobEvent.start_line);
  if (jobEvent.start_line === jobEvent.end_line) return <></>;

  const jobEventStdout = jobEvent.stdout;
  if (!jobEventStdout) return <></>;

  // if (jobEventStdout.startsWith('\r\n')) {
  //   jobEventStdout = jobEventStdout.slice(2) + '\r\n';
  // }
  const lines = jobEventStdout.split('\r\n');
  let eventHeaderLine = false;
  let foundHeaderLine = false;

  let useEventHeader = false;
  switch (jobEvent.event) {
    case 'playbook_on_play_start':
    case 'playbook_on_task_start':
    case 'playbook_on_stats':
      useEventHeader = true;
  }

  let showTime = false;
  switch (jobEvent.event) {
    case 'playbook_on_play_start':
    case 'playbook_on_task_start':
    case 'playbook_on_stats':
      showTime = true;
  }

  const playUuid = (jobEvent.event_data as { play_uuid?: string }).play_uuid ?? '';
  const isPlayCollapsed = !!collapsed[playUuid];

  if (isPlayCollapsed && jobEvent.uuid !== playUuid) {
    return <></>;
  }

  const taskUuid = (jobEvent.event_data as { task_uuid?: string }).task_uuid ?? '';
  const isTaskCollapsed = !!collapsed[taskUuid];

  if (isTaskCollapsed && jobEvent.uuid !== taskUuid) {
    return <></>;
  }

  const isCollapsed = !!collapsed[jobEvent.uuid ?? ''];

  const collapseEvent = () =>
    setCollapsed((collapsed) => ({ ...collapsed, [jobEvent.uuid ?? '']: !isCollapsed }));

  return (
    <>
      {lines.map((line, index) => {
        if (jobEvent.parent_uuid) {
          if (line) {
            eventHeaderLine = !foundHeaderLine;
            foundHeaderLine = true;
          } else {
            eventHeaderLine = false;
          }
        }
        if (isCollapsed && !eventHeaderLine && foundHeaderLine) {
          return <></>;
        }
        return (
          <>
            <div
              className="expand-column"
              style={{
                textAlign: 'right',
                paddingLeft: 16,
                paddingTop: 2,
                paddingBottom: 2,
              }}
            >
              {eventHeaderLine && useEventHeader && (
                <button style={{ backgroundColor: 'unset', border: 0 }} onClick={collapseEvent}>
                  <AngleRightIcon
                    style={{
                      transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                      transition: 'transform',
                    }}
                  />
                </button>
              )}
            </div>
            <div
              className="line-column"
              style={{
                textAlign: 'right',
                paddingLeft: 8,
                paddingRight: 16,
                paddingTop: 2,
                paddingBottom: 2,
              }}
            >
              {/* {playUuid} &nbsp; */}
              {/* {taskUuid} &nbsp; */}
              {/* {jobEvent.play} &nbsp; */}
              {(lineNumber + index + 1).toString()}
              {/* &nbsp; {jobEvent.uuid} */}
              {/* &nbsp; {jobEvent.parent_uuid} */}
            </div>
            <div
              className="dark-0"
              style={{
                paddingLeft: 16,
                paddingRight: 16,
                paddingTop: 2,
                paddingBottom: 2,
              }}
            >
              <span style={{ whiteSpace: 'pre-wrap' }}>
                <Ansi useClasses>{line}</Ansi>
              </span>
              {/* &nbsp; <Label isCompact>{jobEvent.uuid}</Label> */}
              {eventHeaderLine && showTime && (
                <>
                  &nbsp; <Label isCompact>{new Date(jobEvent.created).toLocaleTimeString()}</Label>
                </>
              )}
            </div>
          </>
        );
      })}
      {(isPlayCollapsed || isTaskCollapsed) && (
        <>
          <div className="expand-column" />
          <div className="line-column" />
          <div className="dark-0" style={{ paddingLeft: 16 }}>
            <Label isCompact onClick={collapseEvent}>
              ...
            </Label>
          </div>
        </>
      )}
    </>
  );
}
