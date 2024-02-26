import { PageHeader, PageLayout, PageTable } from '../../../framework';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePersistentFilters } from '../../common/PersistentFilters';
import { ActivityStreamIcon } from '../common/ActivityStreamIcon';
import { awxAPI } from '../common/api/awx-utils';
import { useAwxConfig } from '../common/useAwxConfig';
import { useAwxView } from '../common/useAwxView';
import { useAwxWebSocketSubscription } from '../common/useAwxWebSocket';
import { getDocsBaseUrl } from '../common/util/getDocsBaseUrl';
import { UnifiedJob } from '../interfaces/UnifiedJob';
import { useJobRowActions } from './hooks/useJobRowActions';
import { useJobToolbarActions } from './hooks/useJobToolbarActions';
import { useJobsColumns } from './hooks/useJobsColumns';
import { useJobsFilters } from './hooks/useJobsFilters';

export function Jobs() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const toolbarFilters = useJobsFilters();
  const tableColumns = useJobsColumns();
  const view = useAwxView<UnifiedJob>({
    url: awxAPI`/unified_jobs/`,
    queryParams: {
      not__launch_type: 'sync',
    },
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useJobToolbarActions(view.unselectItemsAndRefresh);
  const rowActions = useJobRowActions(view.unselectItemsAndRefresh);
  usePersistentFilters('jobs');
  const config = useAwxConfig();

  // const [showGraph, setShowGraph] = useState(false);

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
    <PageLayout>
      <PageHeader
        title={t('Jobs')}
        titleHelpTitle={t('Job')}
        titleHelp={t(
          `A job is an instance of {{product}} launching an Ansible playbook against an inventory of hosts.`,
          { product }
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/jobs.html`}
        description={t(
          `A job is an instance of {{product}} launching an Ansible playbook against an inventory of hosts.`,
          { product }
        )}
        headerActions={<ActivityStreamIcon type={'job'} />}
        // headerActions={
        //   <ToggleGroup aria-label={t('show graph toggle')}>
        //     <ToggleGroupItem
        //       icon={<TachometerAltIcon />}
        //       aria-label={t('toggle show graph')}
        //       isSelected={showGraph}
        //       onChange={() => setShowGraph((show) => !show)}
        //     />
        //   </ToggleGroup>
        // }
      />
      <PageTable
        id="awx-jobs-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading jobs')}
        emptyStateTitle={t('No jobs yet')}
        emptyStateDescription={t('Please run a job to populate this list.')}
        {...view}
        defaultSubtitle={t('Job')}
        // topContent={
        //   showGraph && (
        //     <PageSection>
        //       <JobsChart height={250} />
        //     </PageSection>
        //   )
        // }
        limitFiltersToOneOrOperation
      />
    </PageLayout>
  );
}
