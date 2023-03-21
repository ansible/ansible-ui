/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Label, Split, SplitItem } from '@patternfly/react-core';
import { AngleRightIcon } from '@patternfly/react-icons';
import useResizeObserver from '@react-hook/resize-observer';
import { useRef } from 'react';
import { Ansi } from '../../../../common/Ansi';
import { JobEvent } from '../../../interfaces/JobEvent';
import './JobOutput.css';
import { ICollapsed } from './JobOutputEvents';

export function JobOutputRow(props: {
  index: number;
  row: IJobOutputRow;
  collapsed: ICollapsed;
  setCollapsed: (uuid: string, counter: number, collapsed: boolean) => void;
  setHeight: (index: number, height: number) => void;
  canCollapseEvents?: boolean;
}) {
  const { index, row, collapsed, setCollapsed, canCollapseEvents } = props;
  const ref = useRef<HTMLTableRowElement>(null);
  useResizeObserver(ref, () => props.setHeight(index, ref.current?.clientHeight ?? 0));
  const isCollapsed = collapsed[row.uuid ?? ''] === true;
  return (
    <tr ref={ref}>
      <td className="expand-column">
        <div className="expand-div">
          <Split hasGutter>
            <SplitItem isFilled>
              {canCollapseEvents && row.canCollapse && (
                <button
                  className={'expand-button'}
                  onClick={() => setCollapsed(row.uuid, row.counter, !isCollapsed)}
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
            <SplitItem>{row.line}</SplitItem>
          </Split>
        </div>
      </td>
      <td className="stdout-column">
        <Ansi input={row.stdout} />
        {row.isHeaderLine && row.canCollapse && (
          <>
            &nbsp; <Label isCompact>{new Date(row.created ?? '').toLocaleTimeString()}</Label>
          </>
        )}
      </td>
    </tr>
  );
}

export interface IJobOutputRow {
  counter: number;
  uuid: string;
  playUuid: string;
  taskUuid: string;
  line: number | undefined;
  stdout: string;
  eventLine: number;
  canCollapse: boolean;
  isHeaderLine: boolean;
  created?: string;
}

export function jobEventToRows(jobEvent: JobEvent): IJobOutputRow[] {
  const playUuid = (jobEvent.event_data as { play_uuid?: string }).play_uuid ?? '';
  const taskUuid = (jobEvent.event_data as { task_uuid?: string }).task_uuid ?? '';

  if (!jobEvent.counter) return [];
  if (!jobEvent.stdout) return [];

  const lines = jobEvent.stdout.split('\r\n');
  let canCollapse = false;

  switch (jobEvent.event) {
    case 'playbook_on_play_start':
    case 'playbook_on_task_start':
    case 'playbook_on_stats':
      canCollapse = playUuid !== '' || taskUuid !== '';
  }

  let isHeaderLine = false;
  let foundHeaderLine = false;
  return lines.map((stdout, eventLine) => {
    if (jobEvent.parent_uuid) {
      if (stdout) {
        isHeaderLine = !foundHeaderLine;
        foundHeaderLine = true;
      } else {
        isHeaderLine = false;
      }
    }
    const jobOutputRow: IJobOutputRow = {
      line: jobEvent.start_line! + eventLine,
      counter: jobEvent.counter,
      stdout,
      uuid: jobEvent.uuid ?? '',
      playUuid: playUuid ?? '',
      taskUuid: taskUuid ?? '',
      eventLine,
      canCollapse: canCollapse && isHeaderLine,
      isHeaderLine,
      created: jobEvent.created,
    };
    return jobOutputRow;
  });
}

export function tracebackToRows(output: string): IJobOutputRow[] {
  const lines = output.split('\n');
  return lines.map((stdout, eventLine) => {
    const jobOutputRow: IJobOutputRow = {
      line: undefined,
      counter: 0,
      stdout,
      uuid: '',
      playUuid: '',
      taskUuid: '',
      eventLine,
      canCollapse: false,
      isHeaderLine: false,
      created: undefined,
    };
    return jobOutputRow;
  });
}
