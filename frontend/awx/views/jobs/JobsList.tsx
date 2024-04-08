import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { ITableColumn, PageTable } from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
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
