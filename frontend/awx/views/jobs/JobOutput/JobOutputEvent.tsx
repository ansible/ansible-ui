import { Label, Split, SplitItem } from '@patternfly/react-core';
import { AngleRightIcon } from '@patternfly/react-icons';
import useResizeObserver from '@react-hook/resize-observer';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { JobEvent } from '../../../interfaces/generated-from-swagger/api';
import { Ansi } from './Ansi';
import { ICollapsed } from './JobOutput';
import './JobOutput.css';

export function JobOutputEvent(props: {
  jobEvent: JobEvent;
  collapsed: ICollapsed;
  setCollapsed: Dispatch<SetStateAction<ICollapsed>>;
  setEventHeight: (height: number) => void;
}) {
  const { jobEvent, collapsed, setCollapsed } = props;
  const lineNumber = Number(jobEvent.start_line);
  const jobEventStdout = jobEvent.stdout ?? '';

  const [eventRowHeights, setEventRowHeights] = useState<Record<number, number | undefined>>({});
  const setEventRowHeight = useCallback((index: number, height: number) => {
    setEventRowHeights((heights) => {
      const existingHeight = heights[index];
      if (existingHeight === height) return heights;
      const newHeights = { ...heights };
      newHeights[index] = height;
      return newHeights;
    });
  }, []);

  useEffect(() => {
    let eventHeight = 0;
    for (const eventRowHeight of Object.values(eventRowHeights)) {
      if (eventRowHeight) eventHeight += eventRowHeight;
    }
    if (eventHeight !== 0) {
      props.setEventHeight(eventHeight);
    }
  }, [eventRowHeights, props]);

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

  // if (isPlayCollapsed && jobEvent.uuid !== playUuid) {
  //   return <></>;
  // }

  const taskUuid = (jobEvent.event_data as { task_uuid?: string }).task_uuid ?? '';
  const isTaskCollapsed = !!collapsed[taskUuid];

  // if (isTaskCollapsed && jobEvent.uuid !== taskUuid) {
  //   return <></>;
  // }

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

        return (
          <JobOutputEventRow
            key={lineNumber + index + 1}
            index={index}
            line={line}
            jobEvent={jobEvent}
            setEventRowHeight={setEventRowHeight}
            setCollapsed={setCollapsed}
            collapsed={collapsed}
            showTime={showTime}
            eventHeaderLine={eventHeaderLine}
            lineNumber={lineNumber}
            useEventHeader={useEventHeader}
            collapseEvent={collapseEvent}
            isCollapsed={isCollapsed}
            foundHeaderLine={foundHeaderLine}
            isPlayCollapsed={isPlayCollapsed}
            isTaskCollapsed={isTaskCollapsed}
          />
        );
      })}
    </>
  );
}

export function JobOutputEventRow(props: {
  index: number;
  line: string;
  jobEvent: JobEvent;
  setEventRowHeight: (index: number, height: number) => void;

  collapsed: ICollapsed;
  setCollapsed: Dispatch<SetStateAction<ICollapsed>>;
  lineNumber: number;
  eventHeaderLine: boolean;
  useEventHeader: boolean;
  showTime: boolean;
  collapseEvent: () => void;
  isCollapsed: boolean;
  foundHeaderLine: boolean;
  isPlayCollapsed: boolean;
  isTaskCollapsed: boolean;
}) {
  const {
    jobEvent,
    lineNumber,
    index,
    line,
    eventHeaderLine,
    useEventHeader,
    collapseEvent,
    isCollapsed,
    showTime,
    foundHeaderLine,
    isPlayCollapsed,
    isTaskCollapsed,
  } = props;

  const ref = useRef<HTMLTableRowElement>(null);
  useResizeObserver(ref, () => props.setEventRowHeight(index, ref.current?.clientHeight ?? 0));

  const collapse =
    !jobEvent.stdout ||
    isCollapsed ||
    (isPlayCollapsed && !eventHeaderLine) ||
    (isTaskCollapsed && !eventHeaderLine);
  return (
    <tr ref={ref}>
      {!collapse && (
        <>
          <td className="expand-column">
            <div className="expand-div">
              <Split hasGutter>
                <SplitItem isFilled>
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
                </SplitItem>
                <SplitItem>{(lineNumber + index + 1).toString()}</SplitItem>
              </Split>
            </div>
          </td>
          <td className={`stdout-column ${index == 0 ? 'border-top' : ''}`}>
            <Ansi input={line} />
            {eventHeaderLine && showTime && (
              <>
                &nbsp;{' '}
                <Label isCompact>{new Date(jobEvent.created ?? '').toLocaleTimeString()}</Label>
              </>
            )}
          </td>
          <td className={`stdout-column`}>{jobEvent.counter}</td>
        </>
      )}
    </tr>
  );
}
