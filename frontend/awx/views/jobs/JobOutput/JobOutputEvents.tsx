import { useMemo, useRef, useState } from 'react';
import { Job } from '../../../interfaces/Job';
import './JobOutput.css';
import { JobOutputLoadingRow } from './JobOutputLoadingRow';
import { IJobOutputRow, jobEventToRows, tracebackToRows, JobOutputRow } from './JobOutputRow';
import { useJobOutput } from './useJobOutput';
import { useJobOutputChildrenSummary } from './useJobOutputChildrenSummary';
import { useVirtualizedList } from './useVirtualized';

export interface ICollapsed {
  [uuid: string]: boolean;
}

const runningJobTypes: string[] = ['new', 'pending', 'waiting', 'running'];

export function JobOutputEvents(props: { job: Job }) {
  const { job } = props;
  // TODO set job status on ws event change
  const isJobRunning = !job.status || runningJobTypes.includes(job.status);

  const { childrenSummary, isFlatMode } = useJobOutputChildrenSummary(job, isJobRunning);
  const { jobEventCount, getJobOutputEvent, queryJobOutputEvent } = useJobOutput(job, 50);

  const jobOutputRows = useMemo(() => {
    const jobOutputRows: (IJobOutputRow | number)[] = [];
    if (job.result_traceback) {
      for (const row of tracebackToRows(job.result_traceback)) {
        jobOutputRows.push(row);
      }
    }
    for (let counter = 0; counter < jobEventCount; counter++) {
      const jobEvent = getJobOutputEvent(counter);
      if (!jobEvent) jobOutputRows.push(counter);
      else
        for (const row of jobEventToRows(jobEvent)) {
          jobOutputRows.push(row);
        }
    }
    return jobOutputRows;
  }, [getJobOutputEvent, jobEventCount, job.result_traceback]);

  const [collapsed, setCollapsedState] = useState<ICollapsed>({});
  const setCollapsed = (uuid: string, counter: number, collapsed: boolean) => {
    setCollapsedState((collapsedState) => ({
      ...collapsedState,
      [uuid]: collapsed,
      [counter]: collapsed,
    }));
  };

  const nonCollapsedRows = useMemo(() => {
    return jobOutputRows.filter((row) => {
      if (isFlatMode) {
        return true;
      }
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
  }, [isFlatMode, childrenSummary, collapsed, jobOutputRows]);

  const containerRef = useRef<HTMLDivElement>(null);
  const { beforeRowsHeight, visibleItems, setRowHeight, afterRowsHeight } = useVirtualizedList(
    containerRef,
    nonCollapsedRows
  );

  const canCollapseEvents = childrenSummary?.event_processing_finished && childrenSummary.is_tree;

  return (
    <>
      {/* <PageSection variant="light">
        <LabelGroup numLabels={999}>
          <Label variant="outline">Event Count: {jobEventCount}</Label>
          <Label variant="outline">Row Count: {jobOutputRows.length}</Label>
          <Label variant="outline">Visible Row Count: {visibleItems.length}</Label>
          <Label variant="outline">Before Spacing: {beforeRowsHeight}px</Label>
          <Label variant="outline">After Spacing: {afterRowsHeight}px</Label>
        </LabelGroup>
      </PageSection>
      <Divider /> */}
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          overflow: 'auto',
          flexGrow: 1,
          backgroundColor: 'var(--pf-global--BackgroundColor--100)',
        }}
      >
        <pre
          style={{
            fontSize: 'smaller',
            flexGrow: 1,
          }}
        >
          <table style={{ width: '100%', height: '100%', minHeight: '100%' }}>
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
              <tr
                style={{
                  height: '100%',
                  borderTop: 'thin solid var(--pf-global--BorderColor--100)',
                }}
              />
            </tbody>
          </table>
        </pre>
      </div>
    </>
  );
}
