import { Skeleton } from '@patternfly/react-core';
import { useParams } from 'react-router-dom';
import { PageDetails, PageDetailsFromColumns } from '../../../../framework';
import { useJobsColumns } from './hooks/useJobsColumns';
import { useGetJob } from './JobPage';
import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';
import { useTranslation } from 'react-i18next';
import { EmptyStateNoData } from '../../../../framework/components/EmptyStateNoData';

export function JobDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; job_type: string; job_id: string }>();
  const { job } = useGetJob(params.job_id ? params.job_id : params.id, params.job_type);
  const columns = useJobsColumns();

  if (params.job_id && !job)
    return <EmptyStateNoData title="" description={t('Workflow job deleted')} />;
  if (!job) return <Skeleton />;

  return (
    <PageDetails>
      <PageDetailsFromColumns columns={columns} item={job} />
      <PageDetailCodeEditor
        label={t`Extra Variables`}
        showCopyToClipboard
        data-cy="inventory-source-detail-variables"
        value={job.extra_vars ?? ''}
      />
    </PageDetails>
  );
}
