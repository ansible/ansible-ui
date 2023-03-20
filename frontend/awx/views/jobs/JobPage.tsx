/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, PageTab, PageTabs } from '../../../../framework';
import { useGet2 } from '../../../Data';
import { RouteObj } from '../../../Routes';
import { Job } from '../../interfaces/Job';
import { JobDetails } from './JobDetails';
import { JobOutput } from './JobOutput/JobOutput';

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
      <PageTabs loading={!job}>
        <PageTab label={t('Output')}>
          <JobOutput job={job!} />
        </PageTab>
        <PageTab label={t('Details')}>
          <JobDetails job={job!} />
        </PageTab>
      </PageTabs>
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
  const { data: job } = useGet2<Job>({
    url: id ? `/api/v2/${path}/${id}/` : '',
  });
  return job;
}
