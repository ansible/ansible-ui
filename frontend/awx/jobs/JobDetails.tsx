import { Skeleton } from '@patternfly/react-core';
import { useParams } from 'react-router-dom';
import { PageDetails, PageDetailsFromColumns } from '../../../framework';
import { useGetJob } from './JobPage';
import { useJobsColumns } from './hooks/useJobsColumns';

export function JobDetails() {
  const params = useParams<{ id: string; job_type: string }>();
  const { job } = useGetJob(params.id, params.job_type);
  const columns = useJobsColumns();

  if (!job) return <Skeleton />;

  return (
    <PageDetails>
      <PageDetailsFromColumns columns={columns} item={job} />
    </PageDetails>
  );
}
