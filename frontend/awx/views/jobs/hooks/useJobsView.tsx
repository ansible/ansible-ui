import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { useControllerView } from '../../../useControllerView';

export function useJobsView() {
  const view = useControllerView<UnifiedJob>({
    url: '/api/v2/unified_jobs/',
    queryParams: {
      not__launch_type: 'sync',
    },
  });
  return view;
}
