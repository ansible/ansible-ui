import { QueryParams } from '../../../common/useAwxView';
import { useDynamicToolbarFilters } from '../../../common/useDynamicFilters';

export function useJobsFilters(queryParams: QueryParams = {}) {
  const toolBarFilters = useDynamicToolbarFilters({
    optionsPath: 'unified_jobs',
    preSortedKeys: ['name', 'description', 'status'],
    preFilledValueKeys: {
      name: {
        apiPath: 'unified_jobs',
        queryParams: queryParams,
      },
      id: {
        apiPath: 'unified_jobs',
        queryParams: queryParams,
      },
    },
  });

  return toolBarFilters;
}
