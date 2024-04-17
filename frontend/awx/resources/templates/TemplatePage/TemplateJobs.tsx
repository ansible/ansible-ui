import { useParams } from 'react-router-dom';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { JobsList } from '../../../views/jobs/JobsList';
import { useHostsJobsColumns } from '../../inventories/inventoryHostsPage/hooks/useHostsJobsColumns';

export function TemplateJobs(props: { resourceType: 'job_templates' | 'workflow_job_templates' }) {
  const { resourceType } = props;
  usePersistentFilters('inventories');
  const jobsColumns = useHostsJobsColumns();
  const { id = '' } = useParams<{ id: string }>();
  const queryParams = {
    [resourceType === 'job_templates'
      ? 'job__job_template'
      : 'workflow_job__workflow_job_template']: id,
    not__launch_type: 'sync',
  };
  return <JobsList queryParams={queryParams} columns={jobsColumns} />;
}
