/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../framework';
import { PageBackTab, RoutedTab, RoutedTabs } from '../../../common/RoutedTabs';
import { RouteObj } from '../../../common/Routes';
import { useGet } from '../../../common/crud/useGet';
import { AwxRoute } from '../../AwxRoutes';
import { Job } from '../../interfaces/Job';
import { useGetAwxUrl } from '../../useAwxNavigate';
import { JobDetails } from './JobDetails';
import { JobOutput } from './JobOutput/JobOutput';
import { WorkflowOutput } from './WorkflowOutput';

export function JobPage() {
  const { t } = useTranslation();
  const getAwxUrl = useGetAwxUrl();
  const params = useParams<{ id: string; job_type: string }>();
  const { job, refreshJob } = useGetJob(params.id, params.job_type);
  // TODO handle 404/no job
  return (
    <PageLayout>
      <PageHeader
        title={job?.name}
        breadcrumbs={[{ label: t('Jobs'), to: getAwxUrl(AwxRoute.Jobs) }, { label: job?.name }]}
      />
      <RoutedTabs isLoading={!job} baseUrl={RouteObj.JobPage}>
        <PageBackTab
          label={t('Back to Jobs')}
          url={getAwxUrl(AwxRoute.Jobs)}
          persistentFilterKey="jobs"
        />
        <RoutedTab label={t('Output')} url={RouteObj.JobOutput}>
          {job?.type === 'workflow_job' ? (
            <WorkflowOutput job={job} />
          ) : (
            <JobOutput job={job!} reloadJob={refreshJob} />
          )}
        </RoutedTab>
        <RoutedTab label={t('Details')} url={RouteObj.JobDetails}>
          <JobDetails job={job!} />
        </RoutedTab>
      </RoutedTabs>
    </PageLayout>
  );
}

function useGetJob(id?: string, type?: string) {
  const apiPaths: { [key: string]: string } = {
    project: 'project_updates',
    inventory: 'inventory_updates',
    playbook: 'jobs',
    command: 'ad_hoc_commands',
    management: 'system_jobs',
    workflow: 'workflow_jobs',
  };
  const path = type ? apiPaths[type] : 'jobs';
  const { data: job, refresh: refreshJob } = useGet<Job>(
    id ? `/api/v2/${path}/${id}/` : '',
    undefined,
    { refreshInterval: 0 }
  );
  return { job, refreshJob };
}
