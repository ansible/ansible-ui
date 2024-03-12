/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageLayout } from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { useGet } from '../../../common/crud/useGet';
import { awxAPI } from '../../common/api/awx-utils';
import { Job } from '../../interfaces/Job';
import { AwxRoute } from '../../main/AwxRoutes';
import { JobHeader } from './JobHeader';

export function JobPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; job_type: string }>();
  // TODO handle 404/no job
  return (
    <PageLayout>
      <JobHeader />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Jobs'),
          page: AwxRoute.Jobs,
          persistentFilterKey: 'jobs',
        }}
        tabs={[
          { label: t('Output'), page: AwxRoute.JobOutput },
          { label: t('Details'), page: AwxRoute.JobDetails },
        ]}
        params={params}
      />
    </PageLayout>
  );
}

export function useGetJob(id?: string, type?: string) {
  const apiPaths: { [key: string]: string } = {
    project: 'project_updates',
    inventory: 'inventory_updates',
    playbook: 'jobs',
    command: 'ad_hoc_commands',
    management: 'system_jobs',
    workflow: 'workflow_jobs',
  };
  const path = type ? apiPaths[type] : 'jobs';
  const { data: job, refresh: refreshJob } = useGet<Job>(id ? awxAPI`/${path}/${id}/` : '');
  return { job, refreshJob };
}
