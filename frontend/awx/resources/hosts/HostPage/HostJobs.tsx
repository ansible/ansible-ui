import { useParams } from 'react-router-dom';
import { usePersistentFilters } from '../../../../common/PersistentFilters';
import { JobsList } from '../../../views/jobs/JobsList';

export function HostJobs() {
  usePersistentFilters('inventories');
  const { id = '' } = useParams<{ id: string }>();
  return <JobsList jobHosts={id} />;
}
