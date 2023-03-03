import { Label, Split, SplitItem } from '@patternfly/react-core';
import { AngleRightIcon } from '@patternfly/react-icons';
import { Dispatch, SetStateAction } from 'react';
import { JobEvent } from '../../../interfaces/generated-from-swagger/api';
import { Ansi } from './Ansi';
import { ICollapsed } from './JobOutput';
import './JobOutput.css';

export function JobOutputEvent(props: {
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
          <tr key={lineNumber + index + 1}>
            <td className="expand-column">
              <div className="expand-div">
                <Split hasGutter>
                  <SplitItem isFilled>
                    {eventHeaderLine && useEventHeader && (
                      <button
                        style={{ backgroundColor: 'unset', border: 0 }}
                        onClick={collapseEvent}
                      >
                        <AngleRightIcon
                          style={{
                            transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                            transition: 'transform',
                          }}
                        />
                      </button>
                    )}
                  </SplitItem>
                  <SplitItem>{(lineNumber + index + 1).toString()}</SplitItem>
                </Split>
              </div>
            </td>
            <td className="stdout-column">
              <Ansi input={line} />
              {eventHeaderLine && showTime && (
                <>
                  &nbsp;{' '}
                  <Label isCompact>{new Date(jobEvent.created ?? '').toLocaleTimeString()}</Label>
                </>
              )}
            </td>
          </tr>
        );
      })}
      {/* {(isPlayCollapsed || isTaskCollapsed) && (
        <>
          <div className="expand-column" />
          <div className="line-column" />
          <div className="stdout-column">
            <Label isCompact onClick={collapseEvent} style={{ cursor: 'pointer' }}>
              ...
            </Label>
          </div>
        </>
      )} */}
    </>
  );
}
