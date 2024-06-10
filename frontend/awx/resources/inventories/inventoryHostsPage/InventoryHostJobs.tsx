import { useParams } from 'react-router-dom';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { JobsList } from '../../../views/jobs/JobsList';
import { useHostsJobsColumns } from './hooks/useHostsJobsColumns';

export function InventoryHostJobs() {
  usePersistentFilters('inventories');
  const jobsColumns = useHostsJobsColumns();
  const { host_id = '' } = useParams<{ host_id: string }>();
  const queryParams = { job__hosts: host_id, not__launch_type: 'sync' };
  return <JobsList queryParams={queryParams} columns={jobsColumns} />;
}
