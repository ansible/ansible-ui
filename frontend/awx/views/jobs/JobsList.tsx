import { ITableColumn, PageTable } from '@ansible/ansible-ui-framework';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { CubesIcon } from '@patternfly/react-icons';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createThrottle } from '../../common/util/createThrottle';
import { useDomainsStore } from '../../common/domains/useDomains';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { useAwxView } from '../../common/useAwxView';
import { useAwxWebSocketSubscription } from '../../common/useAwxWebSocket';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { useJobRowActions } from '../../views/jobs/hooks/useJobRowActions';
import { useJobToolbarActions } from '../../views/jobs/hooks/useJobToolbarActions';
import { useJobsFilters } from '../../views/jobs/hooks/useJobsFilters';

type QueryParams = { [key: string]: string };

export type WebSocketMessage = {
  group_name?: string;
  type?: string;
  status?: string;
  unified_job_id?: number;
  finished?: string;
};

const FINAL_STATUSES = new Set(['successful', 'failed', 'error', 'canceled']);
const NEW_JOB_STATUSES = new Set(['new', 'pending']);
const BATCH_FLUSH_DELAY = 500;
const BATCH_FLUSH_SIZE = 50;

export type WsAction =
  | { type: 'refresh' }
  | { type: 'fetch'; jobId: number }
  | { type: 'patch'; jobId: number; data: Partial<UnifiedJob> }
  | { type: 'skip' };

export function getWsAction(
  message: WebSocketMessage | undefined,
  pageItemIds: number[]
): WsAction {
  if (message?.group_name !== 'jobs') return { type: 'skip' };

  switch (message?.type) {
    case 'job':
    case 'workflow_job':
    case 'project_update':
      break;
    default:
      return { type: 'skip' };
  }

  const status = message?.status;
  const jobId = message?.unified_job_id;

  if (!status || !jobId) return { type: 'refresh' };

  if (pageItemIds.includes(jobId)) {
    const patch: Partial<UnifiedJob> = { status: status as UnifiedJob['status'] };
    if (status === 'running') {
      patch.started = new Date().toISOString();
    }
    if (FINAL_STATUSES.has(status) && message.finished) {
      patch.finished = message.finished;
    }
    return { type: 'patch', jobId, data: patch };
  }

  // New job — fetch via filtered query so it can be upserted into the list
  if (NEW_JOB_STATUSES.has(status)) return { type: 'fetch', jobId };

  // All other off-page status changes — let periodic polling handle reordering
  return { type: 'skip' };
}

export function JobsList(props: {
  queryParams?: QueryParams;
  columns: ITableColumn<UnifiedJob>[];
}) {
  const { t } = useTranslation();
  const activeDomains = useDomainsStore((state) => state.activeDomains);
  const focusLabels = activeDomains.map((fa) => fa.labels.map((l) => l.name)).flat();
  const toolbarFilters = useJobsFilters(props.queryParams ?? {});
  const tableColumns = props.columns;
  const view = useAwxView<UnifiedJob>({
    url: awxAPI`/unified_jobs/`,
    toolbarFilters,
    tableColumns,
    queryParams: { ...props?.queryParams, or__labels__name: focusLabels },
  });
  const rowActions = useJobRowActions(view.unselectItemsAndRefresh);
  const toolbarActions = useJobToolbarActions(view.unselectItemsAndRefresh);

  usePersistentFilters('jobs');

  const { refresh, upsertItem, listUrl, pageItems } = view;
  const throttledRefresh = useMemo(
    () =>
      createThrottle(() => {
        refresh().catch(() => {});
      }, 5000),
    [refresh]
  );
  // Stable refs to avoid re-render loop in WS subscription
  const pageItemsRef = useRef(pageItems);
  pageItemsRef.current = pageItems;
  const upsertItemRef = useRef(upsertItem);
  upsertItemRef.current = upsertItem;
  const listUrlRef = useRef(listUrl);
  listUrlRef.current = listUrl;

  const pendingFetchIdsRef = useRef(new Set<number>());
  const batchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(
    () => () => {
      throttledRefresh.cancel();
      clearTimeout(batchTimerRef.current);
      pendingFetchIdsRef.current.clear();
    },
    [throttledRefresh]
  );

  const flushBatch = useCallback(() => {
    const ids = Array.from(pendingFetchIdsRef.current);
    pendingFetchIdsRef.current.clear();
    if (ids.length === 0) return;

    const parsed = new URL(listUrlRef.current, 'http://localhost');
    parsed.searchParams.delete('id');
    parsed.searchParams.set('id__in', ids.join(','));
    parsed.searchParams.set('page_size', String(ids.length));
    parsed.searchParams.set('count_disabled', '1');
    const fetchUrl = `${parsed.pathname}?${parsed.searchParams.toString()}`;
    requestGet<AwxItemsResponse<UnifiedJob>>(fetchUrl).then(
      (response) => {
        for (const job of response.results) {
          upsertItemRef.current(job);
        }
      },
      () => throttledRefresh()
    );
  }, [throttledRefresh]);

  const handleWebSocketMessage = useCallback(
    (message?: WebSocketMessage) => {
      const pageItemIds = (pageItemsRef.current ?? []).map((item) => item.id);
      const action = getWsAction(message, pageItemIds);

      switch (action.type) {
        case 'refresh':
          throttledRefresh();
          break;
        case 'fetch': {
          pendingFetchIdsRef.current.add(action.jobId);
          clearTimeout(batchTimerRef.current);
          if (pendingFetchIdsRef.current.size >= BATCH_FLUSH_SIZE) {
            flushBatch();
          } else {
            batchTimerRef.current = setTimeout(flushBatch, BATCH_FLUSH_DELAY);
          }
          break;
        }
        case 'patch': {
          const existing = pageItemsRef.current?.find((i) => i.id === action.jobId);
          if (existing) {
            upsertItemRef.current({ ...existing, ...action.data });
          }
          break;
        }
        case 'skip':
          break;
      }
    },
    [throttledRefresh, flushBatch]
  );
  useAwxWebSocketSubscription(
    { control: ['limit_reached_1'], jobs: ['status_changed'], schedules: ['changed'] },
    handleWebSocketMessage as (data: unknown) => void
  );

  return (
    <PageTable<UnifiedJob>
      id="awx-jobs-table"
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      rowActions={rowActions}
      toolbarActions={toolbarActions}
      errorStateTitle={t('Error loading jobs')}
      emptyStateTitle={
        activeDomains.length > 0 ? t('No jobs match the selected domains') : t('No jobs yet')
      }
      emptyStateDescription={
        activeDomains.length > 0
          ? t('Please select a different domain or clear the current selection.')
          : t('Run a job to populate this list.')
      }
      emptyStateIcon={CubesIcon}
      {...view}
      disableListView
      disableCardView
    />
  );
}
