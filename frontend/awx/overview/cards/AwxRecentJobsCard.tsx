import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageTable, useDashboardColumns } from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { useGetPageUrl } from '../../../../framework/PageNavigation/useGetPageUrl';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
import { Job } from '../../interfaces/Job';
import { AwxRoute } from '../../main/AwxRoutes';
import { useJobsColumns } from '../../views/jobs/hooks/useJobsColumns';

export function AwxRecentJobsCard() {
  const getPageUrl = useGetPageUrl();
  const view = useAwxView<Job>({
    url: awxAPI`/unified_jobs/`,
    disableQueryString: true,
    defaultSort: 'finished',
    defaultSortDirection: 'desc',
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  let columns = useJobsColumns();
  columns = useDashboardColumns(columns);

  return (
    <PageDashboardCard
      title={t('Jobs')}
      subtitle={t('Recently finished jobs')}
      width="md"
      height="md"
      linkText={t('View all Jobs')}
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
