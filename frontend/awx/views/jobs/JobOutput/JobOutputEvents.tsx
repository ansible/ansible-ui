import {
  Divider,
  Label,
  LabelGroup,
  PageSection,
  Skeleton,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { AngleRightIcon } from '@patternfly/react-icons';
import useResizeObserver from '@react-hook/resize-observer';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Job } from '../../../interfaces/Job';
import { Ansi } from './Ansi';
import './JobOutput.css';
import { IJobOutputRow, jobEventToRows } from './JobOutputRow';
import { useJobOutput } from './useJobOutput';
import { useJobOutputChildrenSummary } from './useJobOutputSummary';
import { useVirtualizedList } from './useVirtualized';

export interface ICollapsed {
  [uuid: string]: boolean;
}

export function JobEventsComponent(props: { job: Job }) {
  const childrenSummary = useJobOutputChildrenSummary(props.job);
  const { jobEventCount, getJobOutputEvent, queryJobOutputEvent } = useJobOutput(props.job, 3);

  const jobOutputRows = useMemo(() => {
    const jobOutputRows: (IJobOutputRow | number)[] = [];
    for (let counter = 0; counter < jobEventCount; counter++) {
      const jobEvent = getJobOutputEvent(counter);
      if (!jobEvent) jobOutputRows.push(counter);
      else
        for (const row of jobEventToRows(jobEvent)) {
          jobOutputRows.push(row);
        }
    }
    return jobOutputRows;
  }, [getJobOutputEvent, jobEventCount]);

  const [collapsed, setCollapsedState] = useState<ICollapsed>({});
  const setCollapsed = (uuid: string, counter: number, collapsed: boolean) => {
    setCollapsedState((collapsedState) => ({
      ...collapsedState,
      [uuid]: collapsed,
      [counter]: collapsed,
    }));
  };

  const visibleRows = useMemo(() => {
    return jobOutputRows.filter((row) => {
      // Check if row is a number, if it is, it has not loaded and is the counter for the event
      if (typeof row === 'number') {
        if (childrenSummary) {
          for (const counterKey in childrenSummary.children_summary) {
            const summary = childrenSummary.children_summary[counterKey];
            if (summary) {
              const counter = Number(counterKey);
              if (counter < row) {
                if (counter + summary.numChildren > row) {
                  if (collapsed[counter]) {
                    return false;
                  }
                }
              }
            }
          }
        }
        return true;
      }

      // Only collapse the row if it is not the main event for the play or task, which should still show
      if (collapsed[row.playUuid] && row.playUuid !== row.uuid) return false;
      if (collapsed[row.taskUuid] && row.taskUuid !== row.uuid) return false;

      return true;
    });
  }, [childrenSummary, collapsed, jobOutputRows]);

  const containerRef = useRef<HTMLDivElement>(null);
  const { beforeRowsHeight, visibleItems, setRowHeight, afterRowsHeight } = useVirtualizedList(
    containerRef,
    visibleRows
  );

  const canCollapseEvents = childrenSummary?.event_processing_finished && childrenSummary.is_tree;

  return (
    <>
      <PageSection variant="light">
        <LabelGroup numLabels={999}>
          <Label variant="outline">Event Count: {jobEventCount}</Label>
          <Label variant="outline">Row Count: {jobOutputRows.length}</Label>
          <Label variant="outline">Visible Row Count: {visibleItems.length}</Label>
          <Label variant="outline">Before Spacing: {beforeRowsHeight}px</Label>
          <Label variant="outline">After Spacing: {afterRowsHeight}px</Label>
        </LabelGroup>
      </PageSection>
      <Divider />
      <div ref={containerRef} style={{ overflow: 'auto' }}>
        <pre style={{ fontSize: 'smaller', flexGrow: 1 }}>
          <table style={{ width: '100%', height: '100%' }}>
            <tbody>
              <tr style={{ height: beforeRowsHeight }} />
              {visibleItems.map((row, index) => {
                if (typeof row === 'number') {
                  const counter = row as unknown as number;
                  return (
                    <JobOutputLoadingRow
                      key={counter}
                      counter={counter}
                      queryJobOutputEvent={queryJobOutputEvent}
                    />
                  );
                }
                return (
                  <JobOutputRow
                    key={`${row.counter}-${row.eventLine}-${index}`}
                    index={index}
                    row={row}
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    setHeight={setRowHeight}
                    canCollapseEvents={canCollapseEvents}
                  />
                );
              })}
              <tr style={{ height: afterRowsHeight }} />
            </tbody>
          </table>
        </pre>
      </div>
    </>
  );
}

function JobOutputLoadingRow(props: {
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

function JobOutputRow(props: {
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
      {/* <td className="expand-div">{row.playUuid}</td>
      <td className="expand-div">{row.taskUuid}</td>
      <td className="expand-div">{row.uuid}</td> */}
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
