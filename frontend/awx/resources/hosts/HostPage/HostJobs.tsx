import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { useParams } from 'react-router';
import { JobsList } from '../../../views/jobs/JobsList';
import { useHostsJobsColumns } from '../../inventories/inventoryHostsPage/hooks/useHostsJobsColumns';

export function HostJobs() {
  usePersistentFilters('inventories');
  const jobsColumns = useHostsJobsColumns();
  const { id = '' } = useParams<{ id: string }>();
  const queryParams = { job__hosts: id, not__launch_type: 'sync' };
  return <JobsList queryParams={queryParams} columns={jobsColumns} />;
}
