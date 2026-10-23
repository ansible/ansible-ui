import { IFilterState, IToolbarFilter, usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { useScrollControls } from '@ansible/awx-ui/views/jobs/JobOutput/useScrollControls';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { PageSection } from '@patternfly/react-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useVirtualizedList } from '../../..//common/utils/useVirtualized';
import { getFiltersQueryString } from '../../../awx/views/jobs/JobOutput/useJobOutput';
import { PageControls } from '../../../common/PageControls';
import { edaAPI } from '../../common/eda-utils';
import { useEdaErrorMessageParser } from '../../common/edaErrorAdapter';
import { EdaActivationInstanceLog } from '../../interfaces/EdaActivationInstanceLog';
import { ActivationInstanceOutputRow } from './ActivationInstanceOutputRow';

const INITIAL_PAGE_SIZE = 5000;
const POLL_INTERVAL_MS = 5000;

function getUniqueLogs(
  existingLogs: EdaActivationInstanceLog[],
  incomingLogs: EdaActivationInstanceLog[]
) {
  const existingLogIds = new Set(existingLogs.map((log) => log.id));
  return incomingLogs.filter((log) => {
    if (existingLogIds.has(log.id)) return false;
    existingLogIds.add(log.id);
    return true;
  });
}

function mergeUniqueLogs(
  existingLogs: EdaActivationInstanceLog[],
  incomingLogs: EdaActivationInstanceLog[],
  position: 'prepend' | 'append'
) {
  const uniqueIncomingLogs = getUniqueLogs(existingLogs, incomingLogs);

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
  const [lineNumberOffset, setLineNumberOffset] = useState(0);
  const logsRef = useRef<EdaActivationInstanceLog[]>([]);
  const newestLoadedIdRef = useRef(0);
  const oldestLoadedIdRef = useRef<number | null>(null);
  const requestGenerationRef = useRef(0);
  const isPollingRef = useRef(false);
  const pollFailureAlertShownRef = useRef(false);
  const alertToaster = usePageAlertToaster();
  const parseError = useEdaErrorMessageParser();
  const parseErrorRef = useRef(parseError);
  parseErrorRef.current = parseError;
  const { t } = useTranslation();

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
    const requestGeneration = requestGenerationRef.current + 1;
    requestGenerationRef.current = requestGeneration;
    let isCurrent = true;

    logsRef.current = [];
    setLogs([]);
    setHasOlderLogs(false);
    setIsLoadingOlder(false);
    setLineNumberOffset(0);
    newestLoadedIdRef.current = 0;
    oldestLoadedIdRef.current = null;
    isPollingRef.current = false;
    pollFailureAlertShownRef.current = false;

    async function initialLoad() {
      try {
        const filterString = buildFilterString();
        const qsParts = ['ordering=-id', `page_size=${INITIAL_PAGE_SIZE}`];
        if (filterString) {
          qsParts.push(filterString);
        }
        const response = await requestGet<AwxItemsResponse<EdaActivationInstanceLog>>(
          edaAPI`/activation-instances/${instanceId}/logs/`.concat(`?${qsParts.join('&')}`)
        );

        if (!isCurrent || requestGenerationRef.current !== requestGeneration) return;

        const results = [...(response.results ?? [])].reverse();
        const count = response.count ?? 0;
        logsRef.current = results;
        setLogs(results);
        setLineNumberOffset(count - results.length);
        setHasOlderLogs(count > results.length);

        if (results.length > 0) {
          oldestLoadedIdRef.current = results[0].id;
          newestLoadedIdRef.current = results[results.length - 1].id;
        }
      } catch (error) {
        const errorResults = parseErrorRef.current(error as Error);
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failed to load logs'),
          children: <>{errorResults.parsedErrors.map((errorResult) => errorResult.message)}</>,
        });
      }
    }

    void initialLoad();

    return () => {
      isCurrent = false;
    };
  }, [alertToaster, buildFilterString, instanceId, refreshToken, t]);

  useEffect(() => {
    if (!isRunning && !isFollowModeEnabled) return;
    const requestGeneration = requestGenerationRef.current;

    async function pollLogs() {
      const newestLoadedId = newestLoadedIdRef.current;
      if (isPollingRef.current) return;

      isPollingRef.current = true;
      try {
        const filterString = buildFilterString();
        const qsParts = [
          `id__gt=${newestLoadedId}`,
          'ordering=id',
          `page_size=${INITIAL_PAGE_SIZE}`,
        ];
        if (filterString) {
          qsParts.push(filterString);
        }

        const response = await requestGet<AwxItemsResponse<EdaActivationInstanceLog>>(
          edaAPI`/activation-instances/${instanceId}/logs/`.concat(`?${qsParts.join('&')}`)
        );

        if (requestGenerationRef.current !== requestGeneration) return;

        pollFailureAlertShownRef.current = false;

        const newLogs = [...(response.results ?? [])].sort((left, right) => left.id - right.id);
        const uniqueNewLogs = getUniqueLogs(logsRef.current, newLogs);
        if (uniqueNewLogs.length > 0) {
          logsRef.current = mergeUniqueLogs(logsRef.current, uniqueNewLogs, 'append');
          setLogs(logsRef.current);
          newestLoadedIdRef.current = Math.max(
            ...uniqueNewLogs.map((log) => log.id),
            newestLoadedId
          );
        }
      } catch (error) {
        if (!pollFailureAlertShownRef.current) {
          pollFailureAlertShownRef.current = true;
          const errorResults = parseErrorRef.current(error as Error);
          alertToaster.addAlert({
            variant: 'danger',
            title: t('Live log updates are temporarily unavailable'),
            children: <>{errorResults.parsedErrors.map((errorResult) => errorResult.message)}</>,
          });
        }
      } finally {
        isPollingRef.current = false;
      }
    }

    const interval = setInterval(() => {
      void pollLogs();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [
    alertToaster,
    buildFilterString,
    instanceId,
    isFollowModeEnabled,
    isRunning,
    refreshToken,
    t,
  ]);

  const loadOlderLogs = useCallback(async () => {
    if (!hasOlderLogs || isLoadingOlder) return;
    const oldestLoadedId = oldestLoadedIdRef.current;
    if (oldestLoadedId === null) return;

    const requestGeneration = requestGenerationRef.current;
    setIsLoadingOlder(true);
    try {
      const filterString = buildFilterString();
      const qsParts = [
        `id__lt=${oldestLoadedId}`,
        'ordering=-id',
        `page_size=${INITIAL_PAGE_SIZE}`,
      ];
      if (filterString) {
        qsParts.push(filterString);
      }

      const response = await requestGet<AwxItemsResponse<EdaActivationInstanceLog>>(
        edaAPI`/activation-instances/${instanceId}/logs/`.concat(`?${qsParts.join('&')}`)
      );

      if (requestGenerationRef.current !== requestGeneration) return;

      const olderLogs = [...(response.results ?? [])].reverse();
      const uniqueOlderLogs = getUniqueLogs(logsRef.current, olderLogs);
      if (uniqueOlderLogs.length > 0) {
        logsRef.current = mergeUniqueLogs(logsRef.current, uniqueOlderLogs, 'prepend');
        setLogs(logsRef.current);
        setLineNumberOffset((offset) => offset - uniqueOlderLogs.length);
      }
      if (olderLogs.length > 0) {
        oldestLoadedIdRef.current = Math.min(...olderLogs.map((log) => log.id), oldestLoadedId);
      }
      setHasOlderLogs((response.count ?? 0) > olderLogs.length);
    } catch (error) {
      const errorResults = parseErrorRef.current(error as Error);
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to load older logs'),
        children: <>{errorResults.parsedErrors.map((errorResult) => errorResult.message)}</>,
      });
    } finally {
      if (requestGenerationRef.current === requestGeneration) {
        setIsLoadingOlder(false);
      }
    }
  }, [alertToaster, buildFilterString, hasOlderLogs, instanceId, isLoadingOlder, t]);

  const estimatedMaxLines = Math.max(lineNumberOffset + logs.length, logs.length) * 10;
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

  const { beforeRowsCount, beforeRowsHeight, visibleItems, afterRowsHeight, setRowHeight } =
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
            {visibleItems?.map((row, visibleIndex) => {
              const index = beforeRowsCount + visibleIndex;
              return (
                <ActivationInstanceOutputRow
                  key={row.id}
                  index={index}
                  lineNumber={lineNumberOffset + index + 1}
                  row={row}
                  setHeight={setRowHeight}
                />
              );
            })}
            <div style={{ height: afterRowsHeight }} />
          </div>
        </pre>
      </ScrollContainer>
    </Section>
  );
}
