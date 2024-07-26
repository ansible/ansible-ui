import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PageTable, useDashboardColumns, usePageNavigate } from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { useGetPageUrl } from '../../../../framework/PageNavigation/useGetPageUrl';
import { useOptions } from '../../../common/crud/useOptions';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxView } from '../../common/useAwxView';
import { Job } from '../../interfaces/Job';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
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
  const pageNavigate = usePageNavigate();
  let columns = useJobsColumns();
  columns = useDashboardColumns(columns);

  const { data: jobTemplateActions } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/job_templates/`
  );
  const { data: wfJobTemplateActions } = useOptions<OptionsResponse<ActionsResponse>>(
    awxAPI`/workflow_job_templates/`
  );
  const canCreateJobTemplate = Boolean(
    jobTemplateActions && jobTemplateActions.actions && jobTemplateActions.actions['POST']
  );
  const canCreateWFJobTemplate = Boolean(
    wfJobTemplateActions && wfJobTemplateActions.actions && wfJobTemplateActions.actions['POST']
  );

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
        emptyStateDescription={
          canCreateJobTemplate || canCreateWFJobTemplate
            ? t('Create a job by clicking the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateButtonText={
          canCreateJobTemplate || canCreateWFJobTemplate ? t('Create job') : undefined
        }
        emptyStateButtonClick={
          canCreateJobTemplate ? () => pageNavigate(AwxRoute.CreateJobTemplate) : undefined
        }
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : []}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
