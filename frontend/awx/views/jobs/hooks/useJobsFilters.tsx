import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useJobsFilters() {
  const toolBarFilters = useDynamicToolbarFilters({
    optionsPath: 'unified_jobs',
    preSortedKeys: ['name', 'description', 'status'],
    preFilledValueKeys: ['name', 'id'],
  });

  return toolBarFilters;
}
