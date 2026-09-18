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

function mergeUniqueLogs(
  existingLogs: EdaActivationInstanceLog[],
  incomingLogs: EdaActivationInstanceLog[],
  position: 'prepend' | 'append'
) {
  const existingLogIds = new Set(existingLogs.map((log) => log.id));
  const uniqueIncomingLogs = incomingLogs.filter((log) => !existingLogIds.has(log.id));

  return position === 'prepend'
    ? [...uniqueIncomingLogs, ...existingLogs]
    : [...existingLogs, ...uniqueIncomingLogs];
}

const ScrollContainer = styled.div`
  flex: 1;
  min-height: 0;
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
  refreshToken?: number;
}

export function ActivationInstanceEvents(props: Readonly<IActivationInstanceEventsProps>) {
  const [logs, setLogs] = useState<EdaActivationInstanceLog[]>([]);
  const [hasOlderLogs, setHasOlderLogs] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const latestTimestampRef = useRef<number>(0);
  const oldestTimestampRef = useRef<number>(0);

  const params = useParams<{ instanceId: string }>();
  const instanceId = params.instanceId ?? '';
  const {
    toolbarFilters,
    filterState,
    isFollowModeEnabled,
    setIsFollowModeEnabled,
    isRunning,
    refreshToken = 0,
  } = props;

  const buildFilterString = useCallback(() => {
    return getFiltersQueryString(toolbarFilters, filterState);
  }, [toolbarFilters, filterState]);

  useEffect(() => {
    let isCurrent = true;

    setLogs([]);
    setHasOlderLogs(false);
    latestTimestampRef.current = 0;
    oldestTimestampRef.current = 0;

    async function initialLoad() {
      try {
        const filterString = buildFilterString();
        const countQsParts = ['page_size=1'];
        if (filterString) {
          countQsParts.push(filterString);
        }
        const countResponse = await requestGet<AwxItemsResponse<EdaActivationInstanceLog>>(
          edaAPI`/activation-instances/${instanceId}/logs/`.concat(`?${countQsParts.join('&')}`)
        );
        const count = countResponse.count ?? 0;

        if (!isCurrent) return;

        if (count === 0) {
          setLogs([]);
          setHasOlderLogs(false);
          return;
        }

        const lastPage = Math.ceil(count / INITIAL_PAGE_SIZE);
        const pageQsParts = [`page=${lastPage}`, `page_size=${INITIAL_PAGE_SIZE}`];
        if (filterString) {
          pageQsParts.push(filterString);
        }
        const response = await requestGet<AwxItemsResponse<EdaActivationInstanceLog>>(
          edaAPI`/activation-instances/${instanceId}/logs/`.concat(`?${pageQsParts.join('&')}`)
        );

        if (!isCurrent) return;

        const results = response.results ?? [];
        setLogs(results);
        setHasOlderLogs(count > INITIAL_PAGE_SIZE);

        if (results.length > 0) {
          latestTimestampRef.current = results[results.length - 1].log_timestamp ?? 0;
          oldestTimestampRef.current = results[0].log_timestamp ?? 0;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load logs:', error);
      }
    }

    void initialLoad();

    return () => {
      isCurrent = false;
    };
  }, [instanceId, buildFilterString, refreshToken]);

  useEffect(() => {
    if (!isRunning && !isFollowModeEnabled) return;

    async function pollLogs() {
      if (latestTimestampRef.current === 0) return;

      try {
        const filterString = buildFilterString();
        const qsParts = [
          `log_timestamp__gt=${latestTimestampRef.current}`,
          `page_size=${INITIAL_PAGE_SIZE}`,
        ];
        if (filterString) {
          qsParts.push(filterString);
        }

        const response = await requestGet<AwxItemsResponse<EdaActivationInstanceLog>>(
          edaAPI`/activation-instances/${instanceId}/logs/`.concat(`?${qsParts.join('&')}`)
        );

        const newLogs = response.results ?? [];
        if (newLogs.length > 0) {
          setLogs((previousLogs) => mergeUniqueLogs(previousLogs, newLogs, 'append'));
          latestTimestampRef.current =
            newLogs[newLogs.length - 1].log_timestamp ?? latestTimestampRef.current;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to poll logs:', error);
      }
    }

    const interval = setInterval(() => {
      void pollLogs();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [instanceId, isRunning, isFollowModeEnabled, buildFilterString]);

  const loadOlderLogs = useCallback(async () => {
    if (!hasOlderLogs || isLoadingOlder) return;
    if (oldestTimestampRef.current === 0) return;

    setIsLoadingOlder(true);
    try {
      const filterString = buildFilterString();
      const qsParts = [
        `log_timestamp__lt=${oldestTimestampRef.current}`,
        `page_size=${INITIAL_PAGE_SIZE}`,
      ];
      if (filterString) {
        qsParts.push(filterString);
      }

      const response = await requestGet<AwxItemsResponse<EdaActivationInstanceLog>>(
        edaAPI`/activation-instances/${instanceId}/logs/`.concat(`?${qsParts.join('&')}`)
      );

      const olderLogs = response.results ?? [];
      if (olderLogs.length > 0) {
        setLogs((previousLogs) => mergeUniqueLogs(previousLogs, olderLogs, 'prepend'));
        oldestTimestampRef.current = olderLogs[0].log_timestamp ?? oldestTimestampRef.current;
      }
      setHasOlderLogs((response.count ?? 0) > INITIAL_PAGE_SIZE);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load older logs:', error);
    } finally {
      setIsLoadingOlder(false);
    }
  }, [instanceId, hasOlderLogs, isLoadingOlder, buildFilterString]);

  const estimatedMaxLines = (logs.length ?? 0) * 10;
  const outputLineChars = String(estimatedMaxLines).length;
  const containerRef = useRef<HTMLDivElement>(null);

  const { handleScroll, scrollToTop, scrollToBottom, scrollPageDown, scrollPageUp } =
    useScrollControls(
      containerRef,
      isFollowModeEnabled,
      setIsFollowModeEnabled,
      logs.length,
      isRunning
    );

  const onScroll = useCallback(
    (el: HTMLElement) => {
      handleScroll(el);
      if (el.scrollTop === 0 && hasOlderLogs && !isLoadingOlder) {
        void loadOlderLogs();
      }
    },
    [handleScroll, hasOlderLogs, isLoadingOlder, loadOlderLogs]
  );

  const { beforeRowsHeight, visibleItems, afterRowsHeight, setRowHeight } =
    useVirtualizedList<EdaActivationInstanceLog>(containerRef, logs, onScroll);

  return (
    <Section hasBodyWrapper={false}>
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
                index={logs.findIndex((log) => log.id === row.id)}
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
