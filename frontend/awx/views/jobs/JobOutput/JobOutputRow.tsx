/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Label } from '@patternfly/react-core';
import { AngleRightIcon } from '@patternfly/react-icons';
import useResizeObserver from '@react-hook/resize-observer';
import { useRef } from 'react';
import styled from 'styled-components';
import { Ansi } from '../../../../common/Ansi';
import { JobEvent } from '../../../interfaces/JobEvent';
import './JobOutput.css';
import { ICollapsed } from './JobOutputEvents';

const LineNumberGutter = styled.div`
  position: sticky;
  left: 0px;
  display: flex;
  gap: 8px;
  padding-block: 2px;
  padding-inline: 8px;
  border-right: 1px solid var(--pf-global--BorderColor--100);
  background-color: var(--pf-global--BackgroundColor--200);
  z-index: 1;

  .pf-theme-dark & {
    background-color: var(--pf-global--BackgroundColor--100);
  }
`;
const ExpandButton = styled.button`
  background-color: unset;
  border: 0;
  line-height: 1;
`;
const LineNumber = styled.div`
  flex: 1;
  text-align: right;
`;
const StdOutColumn = styled.div`
  padding-block: 2px;
  padding-inline: 16px;
`;

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
    <div ref={ref} className="output-grid-row">
      <LineNumberGutter>
        {canCollapseEvents && row.canCollapse && (
          <ExpandButton onClick={() => setCollapsed(row.uuid, row.counter, !isCollapsed)}>
            <AngleRightIcon
              style={{
                transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                transition: 'transform',
              }}
            />
          </ExpandButton>
        )}
        <LineNumber>{row.line}</LineNumber>
      </LineNumberGutter>
      <StdOutColumn>
        <Ansi input={row.stdout} />
        {row.isHeaderLine && row.canCollapse && (
          <>
            &nbsp; <Label isCompact>{new Date(row.created ?? '').toLocaleTimeString()}</Label>
          </>
        )}
      </StdOutColumn>
    </div>
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
