import { useMemo, useRef, useState } from 'react';
import { Banner } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Job } from '../../../interfaces/Job';
import './JobOutput.css';
import { JobOutputLoadingRow } from './JobOutputLoadingRow';
import { IJobOutputRow, jobEventToRows, tracebackToRows, JobOutputRow } from './JobOutputRow';
import { useJobOutput } from './useJobOutput';
import {
  useJobOutputChildrenSummary,
  IJobOutputChildrenSummary,
} from './useJobOutputChildrenSummary';
import { useVirtualizedList } from './useVirtualized';

export interface ICollapsed {
  [uuid: string]: boolean;
}

const runningJobTypes: string[] = ['new', 'pending', 'waiting', 'running'];

const ScrollContainer = styled.div`
  overflow: auto;
  backgroundcolor: var(--pf-global--BackgroundColor--100);
  font-size: var(--pf-chart-global--FontSize--sm);
  border-bottom: 1px solid var(--pf-global--BorderColor--100);
`;

export function JobOutputEvents(props: { job: Job }) {
  const { t } = useTranslation();
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

  const nonCollapsedRows = useNonCollapsedRows(
    isFlatMode,
    childrenSummary,
    collapsed,
    jobOutputRows
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const { beforeRowsHeight, visibleItems, setRowHeight, afterRowsHeight } = useVirtualizedList(
    containerRef,
    nonCollapsedRows
  );

  const canCollapseEvents = childrenSummary?.event_processing_finished && childrenSummary.is_tree;
  const estimatedMaxLines = jobOutputRows.length * 5;
  const outputLineChars = String(estimatedMaxLines).length;

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
      {isJobRunning ? (
        <Banner variant="warning">
          <p>
            {t(
              'This job is currently running. Live event streaming has not been added yet to the tech preview.'
            )}
          </p>
        </Banner>
      ) : null}
      <ScrollContainer
        ref={containerRef}
        tabIndex={0} // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
      >
        <pre>
          <div
            className="output-grid"
            style={{ '--output-line-chars': outputLineChars } as { [key: string]: string | number }}
          >
            <div style={{ height: beforeRowsHeight }} />
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
            <div style={{ height: afterRowsHeight }} />
          </div>
        </pre>
      </ScrollContainer>
    </>
  );
}

function useNonCollapsedRows(
  isFlatMode: boolean,
  childrenSummary: IJobOutputChildrenSummary | undefined,
  collapsed: ICollapsed,
  jobOutputRows: (IJobOutputRow | number)[]
) {
  return useMemo(() => {
    return jobOutputRows.filter((row) => {
      if (isFlatMode) {
        return true;
      }

      // If row is a number, it has not loaded and is the counter for the event
      if (typeof row !== 'number') {
        // Only collapse the row if it is not the main event for the play or task,
        // which should still show
        if (collapsed[row.playUuid] && row.playUuid !== row.uuid) return false;
        if (collapsed[row.taskUuid] && row.taskUuid !== row.uuid) return false;

        return true;
      }

      if (!childrenSummary) {
        return true;
      }

      for (const counterKey in childrenSummary.children_summary) {
        const summary = childrenSummary.children_summary[counterKey];
        if (!summary) {
          return true;
        }
        const counter = Number(counterKey);

        if (counter >= row) {
          return true;
        }
        if (counter + summary.numChildren > row && collapsed[counter]) {
          return false;
        }
      }
      return true;
    });
  }, [isFlatMode, childrenSummary, collapsed, jobOutputRows]);
}
