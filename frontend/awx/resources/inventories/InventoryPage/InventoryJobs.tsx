import { useParams } from 'react-router-dom';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { JobsList } from '../../../views/jobs/JobsList';
import { useHostsJobsColumns } from '../../inventories/inventoryHostsPage/hooks/useHostsJobsColumns';

export function InventoryJobs() {
  usePersistentFilters('inventories');
  const jobsColumns = useHostsJobsColumns();
  const { id = '' } = useParams<{ id: string }>();
  const queryParams = {
    not__launch_type: 'sync',
    or__adhoccommand__inventory: id,
    or__inventoryupdate__inventory_source__inventory: id,
    or__job__inventory: id,
    or__workflowjob__inventory: id,
  };
  return <JobsList queryParams={queryParams} columns={jobsColumns} />;
}
