import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { useParams } from 'react-router-dom';
import { JobsList } from '../../../views/jobs/JobsList';
import { useGetHost } from '../hooks/useGetHost';
import { useHostsJobsColumns } from '../../inventories/inventoryHostsPage/hooks/useHostsJobsColumns';

export function HostJobs() {
  usePersistentFilters('inventories');
  const jobsColumns = useHostsJobsColumns();
  const { id = '' } = useParams<{ id: string }>();
  const { host } = useGetHost(id); // ponytail: SWR deduplicates — HostPage already fetched this
  const isConstructed = host?.summary_fields?.inventory?.kind === 'constructed';
  const effectiveHostId = isConstructed && host?.instance_id ? host.instance_id : id;
  const queryParams = { job__hosts: effectiveHostId, not__launch_type: 'sync' };
  return <JobsList queryParams={queryParams} columns={jobsColumns} />;
}
