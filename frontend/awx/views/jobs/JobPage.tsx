/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../framework';
import { useGetPageUrl } from '../../../../framework/PageNavigation/useGetPageUrl';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { useGet } from '../../../common/crud/useGet';
import { AwxRoute } from '../../AwxRoutes';
import { Job } from '../../interfaces/Job';

export function JobPage() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string; job_type: string }>();
  const { job } = useGetJob(params.id, params.job_type);
  // TODO handle 404/no job
  return (
    <PageLayout>
      <PageHeader
        title={job?.name}
        breadcrumbs={[{ label: t('Jobs'), to: getPageUrl(AwxRoute.Jobs) }, { label: job?.name }]}
      />
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
  const { data: job, refresh: refreshJob } = useGet<Job>(
    id ? `/api/v2/${path}/${id}/` : '',
    undefined,
    { refreshInterval: 0 }
  );
  return { job, refreshJob };
}
