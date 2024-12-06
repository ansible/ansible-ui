import { ITableColumn, PageTable } from '@ansible/ansible-ui-framework';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { CubesIcon } from '@patternfly/react-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../common/api/awx-utils';
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
  const toolbarFilters = useJobsFilters(props.queryParams ?? {});
  const tableColumns = props.columns;
  const view = useAwxView<UnifiedJob>({
    url: awxAPI`/unified_jobs/`,
    toolbarFilters,
    tableColumns,
    queryParams: props?.queryParams ?? {},
  });
  const rowActions = useJobRowActions(view.unselectItemsAndRefresh);
  const toolbarActions = useJobToolbarActions(view.unselectItemsAndRefresh);

  usePersistentFilters('jobs');

  const { refresh } = view;
  const handleWebSocketMessage = useCallback(
    (message?: { group_name?: string; type?: string }) => {
      switch (message?.group_name) {
        case 'jobs':
          switch (message?.type) {
            case 'job':
              void refresh();
              break;
            case 'workflow_job':
              void refresh();
              break;
            case 'project_update':
              void refresh();
              break;
          }
          break;
      }
    },
    [refresh]
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
      emptyStateTitle={t('No jobs yet')}
      emptyStateDescription={t('Please run a job to populate this list.')}
      emptyStateIcon={CubesIcon}
      {...view}
    />
  );
}
