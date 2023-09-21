import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  DateTimeCell,
  PageTable,
  useColumnsWithoutExpandedRow,
  useColumnsWithoutSort,
  useVisibleModalColumns,
} from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { useGetPageUrl } from '../../../../framework/PageNavigation/useGetPageUrl';
import { AwxRoute } from '../../AwxRoutes';
import { Job } from '../../interfaces/Job';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { useAwxView } from '../../useAwxView';
import { useJobsColumns } from '../../views/jobs/hooks/useJobsColumns';

export function AwxRecentJobsCard() {
  const getPageUrl = useGetPageUrl();
  const view = useAwxView<Job>({
    url: '/api/v2/unified_jobs/',
    disableQueryString: true,
    defaultSort: 'finished',
    defaultSortDirection: 'desc',
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  let columns = useJobsColumns();
  columns = useVisibleModalColumns(columns);
  columns = useMemo(
    () => [
      ...columns,
      {
        header: t('Finished'),
        cell: (job: UnifiedJob) =>
          job.finished && <DateTimeCell format="date-time" value={job.started} />,
      },
    ],
    [columns, t]
  );
  columns = useColumnsWithoutSort(columns);
  columns = useColumnsWithoutExpandedRow(columns);

  return (
    <PageDashboardCard
      title={t('Recent Jobs')}
      subtitle={t('Recently finished jobs')}
      width="lg"
      height="md"
      linkText={t('Go to Jobs')}
      to={getPageUrl(AwxRoute.Jobs)}
    >
      <PageTable<Job>
        disableBodyPadding={true}
        tableColumns={columns}
        autoHidePagination={true}
        errorStateTitle={t('Error loading jobs')}
        emptyStateIcon={PlusCircleIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateVariant={'light'}
        emptyStateTitle={t('There are currently no jobs')}
        emptyStateDescription={t('Create a job by clicking the button below.')}
        emptyStateButtonText={t('Create job')}
        emptyStateButtonClick={() => navigate(AwxRoute.CreateJobTemplate)}
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : []}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
