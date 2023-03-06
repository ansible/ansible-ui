import { Divider, Label, LabelGroup, PageSection, Split, SplitItem } from '@patternfly/react-core';
import { AngleRightIcon } from '@patternfly/react-icons';
import useResizeObserver from '@react-hook/resize-observer';
import { useMemo, useRef, useState } from 'react';
import { JobEvent } from '../../../interfaces/generated-from-swagger/api';
import { Ansi } from './Ansi';
import { ICollapsed } from './JobOutput';
import './JobOutput.css';
import { IJobOutputRow, jobEventToRows } from './JobOutputRow';
import { useVirtualizedList } from './useVirtualized';

export function JobEventsComponent(props: { jobEvents: JobEvent[] }) {
  const { jobEvents } = props;

  const jobOutputRows = useMemo(() => {
    const jobOutputRows: IJobOutputRow[] = [];
    for (const jobEvent of jobEvents) {
      for (const row of jobEventToRows(jobEvent)) {
        jobOutputRows.push(row);
      }
    }
    return jobOutputRows;
  }, [jobEvents]);

  const [collapsed, setCollapsedState] = useState<ICollapsed>({});
  const setCollapsed = (uuid: string, collapsed: boolean) => {
    setCollapsedState((collapsedState) => ({
      ...collapsedState,
      [uuid ?? '']: collapsed,
    }));
  };

  const visibleRows = useMemo(() => {
    return jobOutputRows.filter((row) => {
      if (collapsed[row.playUuid] && row.playUuid !== row.uuid) return false;
      if (collapsed[row.taskUuid] && row.taskUuid !== row.uuid) return false;
      return true;
    });
  }, [collapsed, jobOutputRows]);

  const containerRef = useRef<HTMLDivElement>(null);
  const { beforeRowsHeight, visibleItems, setRowHeight, afterRowsHeight } = useVirtualizedList(
    containerRef,
    visibleRows
  );

  return (
    <>
      <PageSection variant="light">
        <LabelGroup numLabels={999}>
          <Label variant="outline">Total Count: {jobOutputRows.length}</Label>
          <Label variant="outline">Visible Count: {visibleItems.length}</Label>
          <Label variant="outline">Before: {beforeRowsHeight}</Label>
          <Label variant="outline">After: {afterRowsHeight}</Label>
        </LabelGroup>
      </PageSection>
      <Divider />
      <div ref={containerRef} style={{ overflow: 'auto' }}>
        <pre style={{ fontSize: 'smaller', flexGrow: 1 }}>
          <table style={{ width: '100%', height: '100%' }}>
            <tbody>
              <tr style={{ height: beforeRowsHeight }} />
              {visibleItems.map((row, index) => (
                <JobOutputRow
                  key={`${row.counter}-${row.eventLine}-${index}`}
                  index={index}
                  row={row}
                  collapsed={collapsed}
                  setCollapsed={setCollapsed}
                  setHeight={setRowHeight}
                />
              ))}
              <tr style={{ height: afterRowsHeight }} />
            </tbody>
          </table>
        </pre>
      </div>
    </>
  );
}

function JobOutputRow(props: {
  index: number;
  row: IJobOutputRow;
  collapsed: ICollapsed;
  setCollapsed: (uuid: string, collapsed: boolean) => void;
  setHeight: (index: number, height: number) => void;
}) {
  const { index, row, collapsed, setCollapsed } = props;
  const ref = useRef<HTMLTableRowElement>(null);
  useResizeObserver(ref, () => props.setHeight(index, ref.current?.clientHeight ?? 0));
  const isCollapsed = collapsed[row.jobEvent.uuid ?? ''] === true;
  return (
    <tr ref={ref}>
      {/* <td className="expand-div">{row.playUuid}</td>
      <td className="expand-div">{row.taskUuid}</td>
      <td className="expand-div">{row.uuid}</td> */}
      <td className="expand-column">
        <div className="expand-div">
          <Split hasGutter>
            <SplitItem isFilled>
              {row.canCollapse && (
                <button
                  className={'expand-button'}
                  onClick={() => setCollapsed(row.uuid, !isCollapsed)}
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
        {row.isHeaderLine && (
          <>
            &nbsp;{' '}
            <Label isCompact>{new Date(row.jobEvent.created ?? '').toLocaleTimeString()}</Label>
          </>
        )}
      </td>
    </tr>
  );
}
