import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { ITableColumn, PageLayout, PageTable } from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
import { useJobRowActions } from '../../views/jobs/hooks/useJobRowActions';
import { useJobToolbarActions } from '../../views/jobs/hooks/useJobToolbarActions';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { useJobsFilters } from '../../views/jobs/hooks/useJobsFilters';

export function JobsList(props: { jobHosts?: string; columns: ITableColumn<UnifiedJob>[] }) {
  const { t } = useTranslation();
  const toolbarFilters = useJobsFilters();
  const tableColumns = props.columns;
  const getQueryParams = (jobHosts?: string) => {
    const jobsQueryParams: { [key: string]: string } = {};
    if (jobHosts) {
      jobsQueryParams.job__hosts = jobHosts;
    }
    return jobsQueryParams;
  };
  const view = useAwxView<UnifiedJob>({
    url: awxAPI`/unified_jobs/`,
    toolbarFilters,
    tableColumns,
    queryParams: getQueryParams(props.jobHosts),
  });
  const rowActions = useJobRowActions(view.unselectItemsAndRefresh);
  const toolbarActions = useJobToolbarActions(view.unselectItemsAndRefresh);

  usePersistentFilters('jobs');

  return (
    <PageLayout>
      <PageTable<UnifiedJob>
        id="awx-jobs-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        rowActions={rowActions}
        toolbarActions={toolbarActions}
        errorStateTitle={t('Error loading jobs')}
        emptyStateTitle={t('There are no related jobs')}
        emptyStateIcon={CubesIcon}
        {...view}
      />
    </PageLayout>
  );
}
