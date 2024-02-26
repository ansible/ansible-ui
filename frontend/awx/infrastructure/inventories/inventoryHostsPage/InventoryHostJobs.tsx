import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageLayout, PageTable } from '../../../../../framework';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { useJobRowActions } from '../../../jobs/hooks/useJobRowActions';
import { useJobToolbarActions } from '../../../jobs/hooks/useJobToolbarActions';
import { useJobsFilters } from '../../../jobs/hooks/useJobsFilters';
import { useHostsJobsColumns } from './hooks/useHostsJobsColumns';

export function InventoryHostJobs() {
  const { t } = useTranslation();
  const tableColumns = useHostsJobsColumns();
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();
  const toolbarFilters = useJobsFilters();

  const view = useAwxView<UnifiedJob>({
    url: awxAPI`/unified_jobs/`,
    toolbarFilters,
    tableColumns,
    queryParams: {
      job__hosts: params.host_id ?? '',
    },
  });
  const rowActions = useJobRowActions(view.unselectItemsAndRefresh);
  const toolbarActions = useJobToolbarActions(view.unselectItemsAndRefresh);

  usePersistentFilters('inventories');

  return (
    <PageLayout>
      <PageTable<UnifiedJob>
        id="awx-inventory-host-jobs-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        errorStateTitle={t('Error loading host jobs')}
        emptyStateTitle={t('There are no jobs that were run on this host')}
        emptyStateIcon={CubesIcon}
        {...view}
      />
    </PageLayout>
  );
}
