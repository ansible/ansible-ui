import { useParams } from 'react-router-dom';
import { JobsList } from '../../../views/jobs/JobsList';
import { useInstanceGroupJobsColumns } from './hooks/useInstanceGroupJobsColumns';

export function InstanceGroupJobs() {
  const jobsColumns = useInstanceGroupJobsColumns();
  const { id = '' } = useParams<{ id: string }>();
  const queryParams = { instance_group: id, not__launch_type: 'sync' };
  return <JobsList queryParams={queryParams} columns={jobsColumns} />;
}
