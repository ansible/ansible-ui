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
};

// const FINAL_STATUSES = new Set(['successful', 'failed', 'error', 'canceled']);
const NEW_JOB_STATUSES = new Set(['new', 'pending']);

export type WsAction = { type: 'refresh' } | { type: 'fetch'; jobId: number } | { type: 'skip' };

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

  // Job already visible on current page — fetch updated data via filtered query
  if (pageItemIds.includes(jobId)) return { type: 'fetch', jobId };

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
  useEffect(() => () => throttledRefresh.cancel(), [throttledRefresh]);

  // Stable refs to avoid re-render loop in WS subscription
  const pageItemsRef = useRef(pageItems);
  pageItemsRef.current = pageItems;
  const upsertItemRef = useRef(upsertItem);
  upsertItemRef.current = upsertItem;
  const listUrlRef = useRef(listUrl);
  listUrlRef.current = listUrl;

  const handleWebSocketMessage = useCallback(
    (message?: WebSocketMessage) => {
      const pageItemIds = (pageItemsRef.current ?? []).map((item) => item.id);
      const action = getWsAction(message, pageItemIds);

      switch (action.type) {
        case 'refresh':
          throttledRefresh();
          break;
        case 'fetch': {
          const parsed = new URL(listUrlRef.current, 'http://localhost');
          parsed.searchParams.set('id', action.jobId.toString());
          parsed.searchParams.set('page_size', '1');
          parsed.searchParams.set('count_disabled', '1');
          const fetchUrl = `${parsed.pathname}?${parsed.searchParams.toString()}`;
          requestGet<AwxItemsResponse<UnifiedJob>>(fetchUrl).then(
            (response) => {
              if (response.results.length > 0) {
                upsertItemRef.current(response.results[0]);
              }
            },
            () => throttledRefresh()
          );
          break;
        }
        case 'skip':
          break;
      }
    },
    [throttledRefresh]
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
          : t('Please run a job to populate this list.')
      }
      emptyStateIcon={CubesIcon}
      {...view}
      disableListView
      disableCardView
    />
  );
}
