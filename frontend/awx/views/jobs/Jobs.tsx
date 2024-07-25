import { PageHeader, PageLayout } from '../../../../framework';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { useAwxWebSocketSubscription } from '../../common/useAwxWebSocket';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { useJobsColumns } from './hooks/useJobsColumns';
import { useJobsFilters } from './hooks/useJobsFilters';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { JobsList } from './JobsList';

export function Jobs() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const tableColumns = useJobsColumns();

  usePersistentFilters('jobs');
  const config = useAwxConfig();
  const toolbarFilters = useJobsFilters();
  const view = useAwxView<UnifiedJob>({
    url: awxAPI`/unified_jobs/`,
    toolbarFilters,
    tableColumns,
  });

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
        titleHelpTitle={t('Jobs')}
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
      />
      <JobsList columns={tableColumns} />
    </PageLayout>
  );
}
