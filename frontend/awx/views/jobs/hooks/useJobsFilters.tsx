import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';

export function useJobsFilters() {
  const toolBarFilters = useDynamicToolbarFilters<UnifiedJob>({
    optionsPath: 'unified_jobs',
    preSortedKeys: ['name', 'description', 'status'],
    preFilledValueKeys: ['name', 'id'],
  });

  return toolBarFilters;
}
