import { useParams } from 'react-router-dom';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { JobsList } from '../../../views/jobs/JobsList';
import { useHostsJobsColumns } from '../../inventories/inventoryHostsPage/hooks/useHostsJobsColumns';

export function TemplateJobs() {
  usePersistentFilters('inventories');
  const jobsColumns = useHostsJobsColumns();
  const { id = '' } = useParams<{ id: string }>();
  const queryParams = {
    job__job_template: id,
    not__launch_type: 'sync',
  };
  return <JobsList queryParams={queryParams} columns={jobsColumns} />;
}
