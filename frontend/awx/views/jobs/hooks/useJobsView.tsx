import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';

export function useJobsView() {
  const view = useAwxView<UnifiedJob>({
    url: awxAPI`/unified_jobs/`,
    queryParams: {
      not__launch_type: 'sync',
    },
  });
  return view;
}
