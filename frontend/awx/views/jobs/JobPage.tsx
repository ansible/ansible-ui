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
import { AwxError } from '../../common/AwxError';
import { LoadingPage } from '../../../../framework';

export function JobPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; job_type: string }>();
  const { job, isLoading, error, refreshJob } = useGetJob(params.id, params.job_type);

  if (error) return <AwxError error={error} handleRefresh={refreshJob} />;
  if (!job || isLoading) return <LoadingPage breadcrumbs tabs />;

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
        componentParams={{ job }}
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
  const {
    data: job,
    refresh: refreshJob,
    isLoading,
    error,
  } = useGet<Job>(id ? awxAPI`/${path}/${id}/` : '');
  return { job, refreshJob, isLoading, error };
}
