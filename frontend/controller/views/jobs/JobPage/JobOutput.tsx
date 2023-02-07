import {
  Label,
  SearchInput,
  Skeleton,
  Stack,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { AngleRightIcon } from '@patternfly/react-icons';
import Anser from 'anser';
import { Dispatch, Fragment, SetStateAction, useState } from 'react';
import { Scrollable } from '../../../../../framework';
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
    <>
      <Toolbar className="dark-2 border-bottom">
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput />
          </ToolbarItem>
          <div style={{ flexGrow: 1 }} />
          <ToolbarItem>
            Plays <Label>{job.playbook_counts.play_count}</Label>
          </ToolbarItem>
          <ToolbarItem>
            Tasks <Label>{job.playbook_counts.task_count}</Label>
          </ToolbarItem>
          <ToolbarItem>
            Hosts <Label>{job.host_status_counts.failures}</Label>
          </ToolbarItem>
          <ToolbarItem>
            Failed <Label>{job.host_status_counts.failures}</Label>
          </ToolbarItem>
          <ToolbarItem>
            Elapsed <Label>{job.elapsed}</Label>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      {/* <div style={{ backgroundColor: 'green', flexGrow: 1 }}>kk</div> */}
      <Scrollable>
        <Stack>
          <JobEventsComponent jobEvents={jobEvents} />
          {/* <Test jobEvents={jobEvents} /> */}
        </Stack>
      </Scrollable>
    </>
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
        style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr' }}
        className="border-bottom"
      >
        <div className="expand-column" style={{ minHeight: 8 }} />
        <div className="line-column" />
        <div className="stdout-column" />

        {jobEvents.map((jobEvent) => (
          <JobEventComponent
            key={jobEvent.uuid}
            jobEvent={jobEvent}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        ))}
        <div className="expand-column" style={{ minHeight: 8 }} />
        <div className="line-column" />
        <div className="stdout-column" />

        {/* <div style={{ minHeight: 10, backgroundColor: 'red' }} />
        <div className="line-column" />
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
            <div className="expand-column">
              {eventHeaderLine && useEventHeader && (
                <button style={{ backgroundColor: 'unset', border: 0 }} onClick={collapseEvent}>
                  <AngleRightIcon
                    style={{
                      transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                      transition: 'transform',
                      // marginRight: playUuid === jobEvent.uuid ? 32 : 0,
                    }}
                  />
                </button>
              )}
            </div>
            <div className="line-column">
              {/* {playUuid} &nbsp; */}
              {/* {taskUuid} &nbsp; */}
              {/* {jobEvent.play} &nbsp; */}
              {(lineNumber + index + 1).toString()}
              {/* &nbsp; {jobEvent.uuid} */}
              {/* &nbsp; {jobEvent.parent_uuid} */}
            </div>
            <div className="stdout-column">
              {/* <span style={{ whiteSpace: 'pre-wrap' }}> */}
              <Ansi input={line} />
              {/* </span> */}
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
          <div className="stdout-column">
            <Label isCompact onClick={collapseEvent} style={{ cursor: 'pointer' }}>
              ...
            </Label>
          </div>
        </>
      )}
    </>
  );
}

function Test(props: { jobEvents: JobEvent[] }) {
  const { jobEvents } = props;
  const [collapsed, setCollapsed] = useState<ICollapsed>({});
  const rows = useJobOutputRows(jobEvents);
  return (
    <pre style={{ fontSize: 'smaller', flexGrow: 1 }}>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr' }}
        className="border-bottom"
      >
        <div className="expand-column" style={{ minHeight: 8 }} />
        <div className="line-column" />
        <div className="stdout-column" />
        {rows.map((row) => (
          <Fragment key={row.uuid}>
            <div className="expand-column" />
            <div className="line-column">{row.lineNumber}</div>
            <div className="stdout-column">
              <Ansi input={row.stdout} />
            </div>
          </Fragment>
        ))}
        <div className="expand-column" style={{ minHeight: 8 }} />
        <div className="line-column" />
        <div className="stdout-column" />
      </div>
    </pre>
  );
}

type JobOutputRow = {
  lineNumber: number;
  uuid: string | undefined;
  playUuid: string | undefined;
  taskUuid: string | undefined;
  stdout: string;
  counter: number | undefined;
} & Pick<JobEvent, 'event'>;

function useJobOutputRows(jobEvents: JobEvent[]) {
  const jobOutputRows: JobOutputRow[] = [];
  for (const jobEvent of jobEvents) {
    if (!jobEvent.stdout) continue;
    const playUuid = (jobEvent.event_data as { play_uuid?: string }).play_uuid ?? '';
    const taskUuid = (jobEvent.event_data as { task_uuid?: string }).task_uuid ?? '';
    const lines = (jobEvent.stdout ?? '').split('\r\n');
    let lineNumber = Number(jobEvent.start_line);
    for (const line of lines) {
      jobOutputRows.push({
        uuid: jobEvent.uuid,
        lineNumber: ++lineNumber,
        playUuid,
        taskUuid,
        stdout: line,
        event: jobEvent.event,
        counter: jobEvent.counter,
      });
    }
  }
  return jobOutputRows;
}

function Ansi(props: { input: string }) {
  const data = Anser.ansiToJson(props.input, ansiOptions);
  return (
    <>
      {data.map((entry, index) => {
        let className = undefined;
        if (entry.fg) className = `${entry.fg}-fg`;
        return (
          <span key={index} className={className}>
            {entry.content}
          </span>
        );
      })}
    </>
  );
}
const ansiOptions = {
  json: true,
  remove_empty: true,
  use_classes: true,
};
