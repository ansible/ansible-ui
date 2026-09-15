import { IFilterState, IToolbarFilter } from '@ansible/ansible-ui-framework';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { useScrollControls } from '@ansible/awx-ui/views/jobs/JobOutput/useScrollControls';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { PageSection } from '@patternfly/react-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useVirtualizedList } from '../../..//common/utils/useVirtualized';
import { getFiltersQueryString } from '../../../awx/views/jobs/JobOutput/useJobOutput';
import { PageControls } from '../../../common/PageControls';
import { edaAPI } from '../../common/eda-utils';
import { EdaActivationInstanceLog } from '../../interfaces/EdaActivationInstanceLog';
import { ActivationInstanceOutputRow } from './ActivationInstanceOutputRow';

const INITIAL_PAGE_SIZE = 5000;
const POLL_INTERVAL_MS = 5000;

const ScrollContainer = styled.div`
  overflow: auto;
  background-color: var(--pf-t--global--background--color--primary--default);
  font-size: var(--pf-t--global--font--size--body--sm);
  border-bottom: 1px solid var(--pf-t--global--border--color--default);
`;

const Section = styled(PageSection)`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 550px);
  padding: 0px 24px 24px 24px;
  background-color: var(--pf-t--global--background--color--primary--default);
`;

interface IActivationInstanceEventsProps {
  toolbarFilters: IToolbarFilter[];
  filterState: IFilterState;
  isFollowModeEnabled: boolean;
  setIsFollowModeEnabled: (isFollowModeEnabled: boolean) => void;
  isRunning: boolean;
}

export function ActivationInstanceEvents(props: IActivationInstanceEventsProps) {
  const [logs, setLogs] = useState<EdaActivationInstanceLog[]>([]);
  const [hasOlderLogs, setHasOlderLogs] = useState(false);
  const latestTimestampRef = useRef<number>(0);

  const params = useParams<{ instanceId: string }>();
  const { toolbarFilters, filterState, isFollowModeEnabled, setIsFollowModeEnabled, isRunning } =
    props;

  const buildFilterString = useCallback(() => {
    return getFiltersQueryString(toolbarFilters, filterState);
  }, [toolbarFilters, filterState]);

  useEffect(() => {
    async function initialLoad() {
      const filterString = buildFilterString();
      const qsParts = [`page_size=${INITIAL_PAGE_SIZE}`, 'ordering=-id'];
      if (filterString) {
        qsParts.push(filterString);
      }
      const response = await requestGet<AwxItemsResponse<EdaActivationInstanceLog>>(
        edaAPI`/activation-instances/${params.instanceId ?? ''}/logs/`.concat(
          `?${qsParts.join('&')}`
        )
      );

      const results = [...(response.results ?? [])].reverse();
      setLogs(results);
      setHasOlderLogs((response.count ?? 0) > INITIAL_PAGE_SIZE);

      if (results.length > 0) {
        const lastLog = results[results.length - 1];
        latestTimestampRef.current = lastLog.log_timestamp ?? 0;
      }
    }

    void initialLoad();
  }, [params.instanceId, buildFilterString]);

  useEffect(() => {
    if (!isRunning && !isFollowModeEnabled) return;

    const interval = setInterval(async () => {
      if (latestTimestampRef.current === 0) return;

      const filterString = buildFilterString();
      const qsParts = [
        `log_timestamp__gt=${latestTimestampRef.current}`,
        `page_size=${INITIAL_PAGE_SIZE}`,
      ];
      if (filterString) {
        qsParts.push(filterString);
      }

      const response = await requestGet<AwxItemsResponse<EdaActivationInstanceLog>>(
        edaAPI`/activation-instances/${params.instanceId ?? ''}/logs/`.concat(
          `?${qsParts.join('&')}`
        )
      );

      const newLogs = response.results ?? [];
      if (newLogs.length > 0) {
        setLogs((prev) => [...prev, ...newLogs]);
        const lastLog = newLogs[newLogs.length - 1];
        latestTimestampRef.current = lastLog.log_timestamp ?? latestTimestampRef.current;
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [params.instanceId, isRunning, isFollowModeEnabled, buildFilterString]);

  const loadOlderLogs = useCallback(async () => {
    if (logs.length === 0 || !hasOlderLogs) return;

    const oldestTimestamp = logs[0].log_timestamp ?? 0;
    const filterString = buildFilterString();
    const qsParts = [
      `log_timestamp__lt=${oldestTimestamp}`,
      `page_size=${INITIAL_PAGE_SIZE}`,
      'ordering=-id',
    ];
    if (filterString) {
      qsParts.push(filterString);
    }

    const response = await requestGet<AwxItemsResponse<EdaActivationInstanceLog>>(
      edaAPI`/activation-instances/${params.instanceId ?? ''}/logs/`.concat(
        `?${qsParts.join('&')}`
      )
    );

    const olderLogs = [...(response.results ?? [])].reverse();
    if (olderLogs.length > 0) {
      setLogs((prev) => [...olderLogs, ...prev]);
    }
    setHasOlderLogs((response.count ?? 0) > INITIAL_PAGE_SIZE);
  }, [logs, hasOlderLogs, params.instanceId, buildFilterString]);

  const estimatedMaxLines = (logs.length ?? 0) * 10;
  const outputLineChars = String(estimatedMaxLines).length;
  const containerRef = useRef<HTMLDivElement>(null);

  const { handleScroll, scrollToTop, scrollToBottom, scrollPageDown, scrollPageUp } =
    useScrollControls(containerRef, isFollowModeEnabled, setIsFollowModeEnabled, logs.length, isRunning);

  const onScroll = useCallback(
    (el: HTMLElement) => {
      handleScroll(el);
      if (el.scrollTop === 0 && hasOlderLogs) {
        void loadOlderLogs();
      }
    },
    [handleScroll, hasOlderLogs, loadOlderLogs]
  );

  const { beforeRowsHeight, visibleItems, afterRowsHeight, setRowHeight } =
    useVirtualizedList<EdaActivationInstanceLog>(containerRef, logs, onScroll);

  return (
    <Section>
      <PageControls
        onScrollFirst={scrollToTop}
        onScrollLast={scrollToBottom}
        onScrollNext={scrollPageDown}
        onScrollPrevious={scrollPageUp}
        isFlatMode={true}
        isTemplateJob={false}
      />
      <ScrollContainer ref={containerRef}>
        <pre>
          <div
            className="output-grid"
            style={{ '--output-line-chars': outputLineChars } as { [key: string]: string | number }}
          >
            <div style={{ height: beforeRowsHeight }} />
            {visibleItems?.map((row) => (
              <ActivationInstanceOutputRow
                key={row.id}
                index={logs.findIndex((r) => r.id === row.id)}
                row={row}
                setHeight={setRowHeight}
              />
            ))}
            <div style={{ height: afterRowsHeight }} />
          </div>
        </pre>
      </ScrollContainer>
    </Section>
  );
}
