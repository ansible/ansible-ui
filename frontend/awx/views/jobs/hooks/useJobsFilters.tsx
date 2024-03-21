import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useJobsFilters() {
  const toolBarFilters = useDynamicToolbarFilters({
    optionsPath: 'unified_jobs',
    preSortedKeys: ['name', 'description', 'status'],
    preFilledValueKeys: {
      name: {
        apiPath: 'unified_jobs',
      },
      id: {
        apiPath: 'unified_jobs',
      },
    },
  });

  return toolBarFilters;
}
