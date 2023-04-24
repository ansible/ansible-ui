/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, RoutedTabs, RoutedTab } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { RouteObj } from '../../../Routes';
import { Job } from '../../interfaces/Job';
import { JobDetails } from './JobDetails';
import { JobOutput } from './JobOutput/JobOutput';
import { WorkflowOutput } from './WorkflowOutput';

export function JobPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; job_type: string }>();
  const job = useGetJob(params.id, params.job_type);
  // TODO handle 404/no job
  return (
    <PageLayout>
      <PageHeader
        title={job?.name}
        breadcrumbs={[{ label: t('Jobs'), to: RouteObj.Jobs }, { label: job?.name }]}
      />
      <RoutedTabs isLoading={!job} baseUrl={RouteObj.JobPage}>
        <RoutedTab label={t('Output')} url={RouteObj.JobOutput}>
          {job?.type === 'workflow_job' ? <WorkflowOutput job={job} /> : <JobOutput job={job!} />}
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
  const { data: job } = useGet<Job>(id ? `/api/v2/${path}/${id}/` : '');
  return job;
}
