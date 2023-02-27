import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { useAwxView } from '../../../useAwxView';

export function useJobsView() {
  const view = useAwxView<UnifiedJob>({
    url: '/api/v2/unified_jobs/',
    queryParams: {
      not__launch_type: 'sync',
    },
  });
  return view;
}
