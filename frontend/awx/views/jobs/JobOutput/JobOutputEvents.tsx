import { useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { type IFilterState, type IToolbarFilter } from '../../../../../framework';
import { Job } from '../../../interfaces/Job';
import './JobOutput.css';
import { JobOutputLoadingRow } from './JobOutputLoadingRow';
import { IJobOutputRow, JobOutputRow, jobEventToRows, tracebackToRows } from './JobOutputRow';
import { PageControls } from './PageControls';
import { useJobOutput } from './useJobOutput';
import {
  IJobOutputChildrenSummary,
  useJobOutputChildrenSummary,
} from './useJobOutputChildrenSummary';
import { useScrollControls } from './useScrollControls';
import { useVirtualizedList } from './useVirtualized';
import { isHostEvent, isJobRunning } from './util';
import { HostEventModal } from './HostEventModal';

export interface ICollapsed {
  [uuid: string]: boolean;
}

const ScrollContainer = styled.div`
  overflow: auto;
  backgroundcolor: var(--pf-v5-global--BackgroundColor--100);
  font-size: var(--pf-v5-global--FontSize--sm);
  border-bottom: 1px solid var(--pf-v5-global--BorderColor--100);
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

  const { childrenSummary, isFlatMode } = useJobOutputChildrenSummary(
    job,
    isJobRunning(job.status) || isFiltered
  );
  const { jobEventCount, getJobOutputEvent, queryJobOutputEvent } = useJobOutput(
    job,
    reloadJob,
    toolbarFilters,
    filterState,
    50
  );

  const jobOutputRows = useMemo(() => {
    const jobOutputRows: (IJobOutputRow | number)[] = [];
    if (job.result_traceback) {
      for (const row of tracebackToRows(job.result_traceback)) {
        jobOutputRows.push(row);
      }
    }
    for (let counter = 1; counter <= jobEventCount; counter++) {
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
  const { beforeRowsHeight, visibleItems, setRowHeight, afterRowsHeight } = useVirtualizedList(
    containerRef,
    nonCollapsedRows
  );

  const canCollapseEvents = childrenSummary?.event_processing_finished && childrenSummary.is_tree;
  const estimatedMaxLines = jobOutputRows.length * 5;
  const outputLineChars = String(estimatedMaxLines).length;

  const { scrollToTop, scrollToBottom, scrollPageDown, scrollPageUp } = useScrollControls(
    containerRef,
    isFollowModeEnabled,
    setIsFollowModeEnabled,
    jobOutputRows.length,
    isJobRunning(job.status)
  );

  const visibleHostIndex = visibleItems.findIndex(
    (el) => typeof el === 'object' && el.uuid === hostModalData?.uuid
  );
  const visibleHost = visibleItems[visibleHostIndex];
  const visibleHostCounter = typeof visibleHost === 'object' && visibleHost.counter;

  const selectedRowHostData = visibleHostCounter
    ? getJobOutputEvent(visibleHostCounter)
    : undefined;

  const isHostModalOpen =
    hostModalData?.counter &&
    isHostEvent(getJobOutputEvent(hostModalData.counter)) &&
    hostModalData.uuid !== hostModalData.taskUuid;

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
