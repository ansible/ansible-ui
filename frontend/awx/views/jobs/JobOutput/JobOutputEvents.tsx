import { type IFilterState, type IToolbarFilter } from '@ansible/ansible-ui-framework';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { PageControls } from '../../../../common/PageControls';
import { useVirtualizedList } from '../../../../common/utils/useVirtualized';
import { Job } from '../../../interfaces/Job';
import { HostEventModal } from './HostEventModal';
import './JobOutput.css';
import { JobOutputLoadingRow } from './JobOutputLoadingRow';
import { IJobOutputRow, JobOutputRow, jobEventToRows, tracebackToRows } from './JobOutputRow';
import { useJobOutput } from './useJobOutput';
import {
  IJobOutputChildrenSummary,
  useJobOutputChildrenSummary,
} from './useJobOutputChildrenSummary';
import { useScrollControls } from './useScrollControls';
import { isHostEvent, isJobRunning } from './util';

export interface ICollapsed {
  [uuid: string]: boolean;
}

const ScrollContainer = styled.div`
  overflow: auto;
  background-color: var(--pf-t--global--background--color--100);
  font-size: var(--pf-t--global--font--size--sm);
  border-bottom: 1px solid var(--pf-t--global--border--color--100);
`;

interface IJobOutputEventsProps {
  job: Job;
  reloadJob: () => void;
  toolbarFilters: IToolbarFilter[];
  filterState: IFilterState;
  isFollowModeEnabled: boolean;
  setIsFollowModeEnabled: (isFollowModeEnabled: boolean) => void;
}

export function JobOutputEvents(props: IJobOutputEventsProps) {
  const {
    job,
    reloadJob,
    toolbarFilters,
    filterState,
    isFollowModeEnabled,
    setIsFollowModeEnabled,
  } = props;

  const [hostModalData, setHostModalData] = useState<IJobOutputRow | null>(null);
  const isFiltered = Object.keys(filterState).length > 0;

  const wasRunningOnMount = useRef(isJobRunning(job.status));
  useEffect(() => {
    if (isJobRunning(job.status)) {
      wasRunningOnMount.current = true;
    }
  }, [job.status]);

  const { childrenSummary, isFlatMode } = useJobOutputChildrenSummary(
    job,
    wasRunningOnMount.current || isFiltered
  );
  const { jobEventCount, getJobOutputEvent, queryJobOutputEvent, jobEvents } = useJobOutput(
    job,
    reloadJob,
    toolbarFilters,
    filterState,
    200
  );

  const jobOutputRows = useMemo(() => {
    const jobOutputRows: (IJobOutputRow | number)[] = [];
    if (job.result_traceback) {
      for (const row of tracebackToRows(job.result_traceback)) {
        jobOutputRows.push(row);
      }
    }
    for (let counter = 1; counter <= jobEventCount; counter++) {
      const jobEvent = jobEvents[counter];
      if (!jobEvent) jobOutputRows.push(counter);
      else
        for (const row of jobEventToRows(jobEvent)) {
          jobOutputRows.push(row);
        }
    }
    return jobOutputRows;
  }, [jobEventCount, job.result_traceback, jobEvents]);

  const [collapsed, setCollapsedState] = useState<ICollapsed>({});
  const setCollapsed = (uuid: string, counter: number, collapsed: boolean) => {
    setCollapsedState((collapsedState) => ({
      ...collapsedState,
      [uuid]: collapsed,
      [counter]: collapsed,
    }));
    if (collapsed === false) {
      setCollapsedAll(false);
    }
  };

  const [collapsedAll, setCollapsedAll] = useState(false);
  const toggleExpandCollapseAll = () => {
    setCollapsedAll(!collapsedAll);

    // find play and expand/collapse it
    let found = false;
    visibleItems.forEach((visibleItem) => {
      if (typeof visibleItem === 'number' || found === true) {
        return;
      }

      if (visibleItem.canCollapse && visibleItem.isHeaderLine) {
        if (visibleItem.stdout.startsWith('PLAY')) {
          found = true;
          setCollapsed(visibleItem.playUuid, visibleItem.counter, !collapsedAll);
        }
      }
    });
  };

  const nonCollapsedRows = useNonCollapsedRows(
    isFlatMode,
    childrenSummary,
    collapsed,
    jobOutputRows
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const canCollapseEvents = childrenSummary?.event_processing_finished && childrenSummary.is_tree;
  const estimatedMaxLines = jobOutputRows.length * 5;
  const outputLineChars = String(estimatedMaxLines).length;

  const { handleScroll, scrollToTop, scrollToBottom, scrollPageDown, scrollPageUp } =
    useScrollControls(
      containerRef,
      isFollowModeEnabled,
      setIsFollowModeEnabled,
      jobOutputRows.length,
      isJobRunning(job.status)
    );

  const { beforeRowsHeight, visibleItems, setRowHeight, afterRowsHeight } = useVirtualizedList(
    containerRef,
    nonCollapsedRows,
    handleScroll
  );

  const visibleHostIndex = visibleItems.findIndex(
    (el) => typeof el === 'object' && el.uuid === hostModalData?.uuid
  );
  const visibleHost = visibleItems[visibleHostIndex];
  const visibleHostCounter = typeof visibleHost === 'object' && visibleHost.counter;

  const jobEventKey = useMemo(() => {
    return Object.keys(jobEvents).find(
      (key: string) => jobEvents[Number(key)].counter === visibleHostCounter
    );
  }, [jobEvents, visibleHostCounter]);

  const selectedRowHostData = jobEventKey ? getJobOutputEvent(Number(jobEventKey)) : undefined;

  const isHostModalOpen = useMemo(() => {
    if (!hostModalData?.counter) return false;
    const jobEventKeyHostModal = Object.keys(jobEvents).find(
      (key: string) => jobEvents[Number(key)].counter === hostModalData?.counter
    );
    return (
      jobEventKeyHostModal &&
      isHostEvent(getJobOutputEvent(Number(jobEventKeyHostModal))) &&
      hostModalData?.uuid !== hostModalData?.taskUuid
    );
  }, [
    hostModalData?.counter,
    hostModalData?.uuid,
    hostModalData?.taskUuid,
    jobEvents,
    getJobOutputEvent,
  ]);

  return (
    <>
      <PageControls
        onScrollFirst={scrollToTop}
        onScrollLast={scrollToBottom}
        onScrollNext={scrollPageDown}
        onScrollPrevious={scrollPageUp}
        toggleExpandCollapseAll={() => toggleExpandCollapseAll()}
        isFlatMode={isFlatMode}
        isTemplateJob={job.type === 'job'}
        isAllCollapsed={collapsedAll}
      />
      <ScrollContainer ref={containerRef} tabIndex={0}>
        <pre>
          <div
            className="output-grid"
            style={{ '--output-line-chars': outputLineChars } as { [key: string]: string | number }}
          >
            <div style={{ height: beforeRowsHeight }} />
            {visibleItems.map((row, index) => {
              if (typeof row === 'number') {
                const counter = row as unknown as number;

                // check if row is between two adjacent output lines
                // if so, it indicates a gap in the event counters. do not display
                // a loading row for this
                const prev =
                  typeof visibleItems[index - 1] === 'object'
                    ? visibleItems[index - 1]
                    : visibleItems[index - 2];
                const next =
                  typeof visibleItems[index + 1] === 'object'
                    ? visibleItems[index + 1]
                    : visibleItems[index + 2];
                if (
                  typeof prev === 'object' &&
                  typeof next === 'object' &&
                  (prev.line || 0) + 1 === next.line
                ) {
                  return null;
                }

                return (
                  <JobOutputLoadingRow
                    key={`counter-${counter}`}
                    counter={counter}
                    queryJobOutputEvent={queryJobOutputEvent}
                  />
                );
              }

              return (
                <JobOutputRow
                  key={row.index}
                  index={row.index !== undefined ? row.index : row.counter}
                  row={row}
                  collapsed={collapsed}
                  setCollapsed={setCollapsed}
                  setHeight={setRowHeight}
                  onClick={setHostModalData}
                  canCollapseEvents={canCollapseEvents}
                />
              );
            })}
            <div style={{ height: afterRowsHeight }} />
          </div>
        </pre>
      </ScrollContainer>
      {isHostModalOpen && selectedRowHostData !== undefined && (
        <HostEventModal
          isOpen
          onClose={() => setHostModalData(null)}
          hostEvent={selectedRowHostData}
        />
      )}
    </>
  );
}

interface IndexedRow extends IJobOutputRow {
  index?: number;
}

function useNonCollapsedRows(
  isFlatMode: boolean,
  childrenSummary: IJobOutputChildrenSummary | undefined,
  collapsed: ICollapsed,
  jobOutputRows: (IJobOutputRow | number)[]
) {
  return useMemo(() => {
    const rows: (IndexedRow | number)[] = jobOutputRows.filter((row) => {
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
    rows.forEach((row, i) => {
      if (typeof row !== 'number') {
        row.index = i;
      }
    });
    return rows;
  }, [isFlatMode, childrenSummary, collapsed, jobOutputRows]);
}
