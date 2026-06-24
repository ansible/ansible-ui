import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { useParams } from 'react-router-dom';
import { JobsList } from '../../../views/jobs/JobsList';
import { useGetHost } from '../../hosts/hooks/useGetHost';
import { useHostsJobsColumns } from './hooks/useHostsJobsColumns';

export function InventoryHostJobs() {
  usePersistentFilters('inventories');
  const jobsColumns = useHostsJobsColumns();
  const { host_id = '' } = useParams<{ host_id: string }>();
  const { host } = useGetHost(host_id); // ponytail: SWR deduplicates — InventoryHostPage already fetched this
  const isConstructed = host?.summary_fields?.inventory?.kind === 'constructed';
  const effectiveHostId = isConstructed && host?.instance_id ? host.instance_id : host_id;
  const queryParams = { job__hosts: effectiveHostId, not__launch_type: 'sync' };
  return <JobsList queryParams={queryParams} columns={jobsColumns} />;
}
