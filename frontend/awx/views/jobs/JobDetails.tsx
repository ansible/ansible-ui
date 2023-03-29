import { Skeleton } from '@patternfly/react-core';
import { PageDetailsFromColumns } from '../../../../framework';
import { Job } from '../../interfaces/Job';
import { useJobsColumns } from './hooks/useJobsColumns';

export function JobDetails(props: { job: Job }) {
  const { job } = props;
  const columns = useJobsColumns();
  if (!job) return <Skeleton />;
  return <PageDetailsFromColumns columns={columns} item={job} />;
}
