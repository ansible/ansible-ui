import { ITableColumn, PageTable } from '@ansible/ansible-ui-framework';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { CubesIcon } from '@patternfly/react-icons';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../common/api/awx-utils';
import { createThrottle } from '../../common/util/createThrottle';
import { useDomainsStore } from '../../common/domains/useDomains';
import { useAwxView } from '../../common/useAwxView';
import { useAwxWebSocketSubscription } from '../../common/useAwxWebSocket';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { useJobRowActions } from '../../views/jobs/hooks/useJobRowActions';
import { useJobToolbarActions } from '../../views/jobs/hooks/useJobToolbarActions';
import { useJobsFilters } from '../../views/jobs/hooks/useJobsFilters';

type QueryParams = { [key: string]: string };

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

  const { refresh } = view;
  const throttledRefresh = useMemo(
    () =>
      createThrottle(() => {
        refresh().catch(() => {});
      }, 5000),
    [refresh]
  );
  useEffect(() => () => throttledRefresh.cancel(), [throttledRefresh]);

  const handleWebSocketMessage = useCallback(
    (message?: { group_name?: string; type?: string }) => {
      switch (message?.group_name) {
        case 'jobs':
          switch (message?.type) {
            case 'job':
            case 'workflow_job':
            case 'project_update':
              throttledRefresh();
              break;
          }
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
