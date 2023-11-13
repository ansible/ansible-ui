import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { useAwxView } from '../../../useAwxView';
import { awxAPI } from '../../../api/awx-utils';

export function useJobsView() {
  const view = useAwxView<UnifiedJob>({
    url: awxAPI`/unified_jobs/`,
    queryParams: {
      not__launch_type: 'sync',
    },
  });
  return view;
}
